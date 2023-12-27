import os
import sys
import json
import requests
import unicodedata
import datetime

DATA_FILE = '../public/data.json'

API_TEMPLATE_URL = "https://api.rtt.io/api/v1/json/search/{}/{}/{}/{}/arrivals"
API_KEY = os.environ["API_KEY"]

CHECKS = [
    {
        "station_code": "PAD",
        "station_name": "London Paddington",
        "origin": "Abbey Wood",
        "destination": None,
        "toc": "XR",
    },
    {
        "station_code": "ABW",
        "station_name": "Abbey Wood",
        "origin": None,
        "destination": "Abbey Wood",
        "toc": "XR",
    },
]

VERBOSE = False


def load_json():
    data_object = {}
    with open(DATA_FILE) as file:
        data_object = json.load(file)
    return data_object


def save_json(output, pretty=True):
    file = open(DATA_FILE, "w")
    indent = 4 if pretty else 0
    content = json.dumps(output, indent=indent)
    file.write(content)
    file.close()


def process_services(date, station_code, toc, origin=None, destination=None):
    date_parts = date.split("-")
    url = API_TEMPLATE_URL.format(station_code, date_parts[0], date_parts[1], date_parts[2])
    print("Requesting URL: {}".format(url))
    headers = {"Authorization": "Basic {}".format(API_KEY)}
    result = requests.get(url, headers=headers)

    if result.status_code != 200:
        raise Exception("Cannot retrieve results!")

    raw = result.content
    parsed = json.loads(raw)
    results = parsed["services"]

    if not results:
        return []

    print("Found {} total services".format(len(results)))

    items = []
    for data in results:
        service_toc = data["atocCode"]
        service_origin = data["locationDetail"]["origin"][0]["description"]
        service_destination = data["locationDetail"]["destination"][0]["description"]
        if toc is not None and service_toc != toc:
            continue
        elif origin is not None and service_origin != origin:
            continue
        elif destination is not None and service_destination != destination:
            continue

        time_planned = data["locationDetail"]["gbttBookedArrival"]
        time_actual = data["locationDetail"]["realtimeArrival"] if data["locationDetail"]["realtimeArrivalActual"] else None
        if not service_in_time_scope(time_planned):
            continue

        ran = False
        ontime = False
        delay = None

        if parse_service_time(time_actual):
            ran = True
            delay = check_service_delay(time_actual, time_planned)
            if delay < 5:
                ontime = True

        item = {
            "planned": time_planned,
            "actual": time_actual,
            "ran": ran,
            "ontime": ontime,
            "delay": delay,
        }
        items.append(item)

    return items


def service_in_time_scope(time_planned):
    hours = time_planned[0:2]
    hours = int(hours)
    if hours < 8 or hours > 19:
        return False
    return True


def check_service_delay(time_actual, time_planned):
    actual = parse_service_time(time_actual)
    planned = parse_service_time(time_planned)

    delay = actual - planned

    if delay < 0:
        return 0

    return delay


def normalise_fractions(input):
    if not input[-1].isdecimal():
        main = float(input[:-1])
        fraction = float(unicodedata.numeric(input[-1]))
        return main + fraction
    return float(input)


def parse_service_time(time):
    if not time:
        return False

    time = time.replace("½", ".5")

    hours = time[0:2]
    mins = time[2:]

    # Handle midnight very simply - will break if services run later than 00:59
    if hours == "00":
        hours = "24"


    total = (int(hours) * 60) + normalise_fractions(mins)

    if total < 1:
        return False

    return total


def analyse_services(services):
    total_services = len(services)
    total_ran = sum(service["ran"] for service in services)
    total_ontime = sum(service["ontime"] for service in services)
    percent_ran = (total_ran / total_services) if total_services else None
    percent_ontime = (total_ontime / total_services) if total_services else None

    return {
        "total_services": total_services,
        "total_ran": total_ran,
        "total_ontime": total_ontime,
        "percent_ran": percent_ran,
        "percent_ontime": percent_ontime,
    }


def main():
    print("Starting process...")

    if len(sys.argv) == 2:
        date = sys.argv[1]
    else:
        yesterday = datetime.date.today() - datetime.timedelta(days=1)
        date = yesterday.strftime('%Y-%m-%d')
    print("Using date: {}".format(date))

    print("Loading existing output from JSON...")
    try:
        output = load_json()
    except FileNotFoundError:
        print("Existing JSON doesn't exist yet, starting from empty output!")
        output = {}

    for check in CHECKS:
        station_code = check["station_code"]
        print("Checking station code: {}".format(station_code))
        services = process_services(date, station_code, check["toc"], check["origin"], check["destination"])
        if VERBOSE:
            print(services)
        analysis = analyse_services(services)
        print(analysis)

        if station_code not in output:
            output[station_code] = {
                "meta": {
                    "station_code": station_code,
                    "station_name": check["station_name"],
                    "origin": check["origin"],
                    "destination": check["destination"],
                    "toc": check["toc"],
                },
                "dates": {},
            }

        output[station_code]["dates"][date] = {
            "date": date,
            "analysis": analysis,
            "services": services,
        }

    print("Saving output to JSON...")
    save_json(output)
    print("Process ended!")


main()
