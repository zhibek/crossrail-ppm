import sys
import json
import requests
from bs4 import BeautifulSoup
import datetime

DATA_FILE = 'data/output.json'

# https://api.rtt.io/api/v1/json/search/BDS  # Note: Cannot use API as detailed view not available
SOURCE_TEMPLATE_URL = "https://www.realtimetrains.co.uk/search/detailed/gb-nr:{}/{}-{}-{}/0800-2000?stp=WVS&show=all&order=actual"
SOURCE_PATH = "div.servicelist > a.service"

CHECKS = [
    {
        # "station": "BDS",
        "station": "PDX",
        "origin": "Abbey Wood (Crossrail)",
        # "destination": "Paddington Crossrail",
        "destination": "Terminates here",
    },
    {
        # "station": "WWC",
        "station": "ABX",
        "origin": "Paddington Crossrail",
        # "destination": "Abbey Wood (Crossrail)",
        "destination": "Terminates here",
    },
]


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


def process_services(date, station, origin, destination):
    date_parts = date.split("-")
    url = SOURCE_TEMPLATE_URL.format(station, date_parts[0], date_parts[1], date_parts[2])
    print("Requesting URL: {}".format(url))
    result = requests.get(url)
    xml = result.content

    soup = BeautifulSoup(xml, features="lxml")
    results = soup.select(SOURCE_PATH)
    print("Found {} total services".format(len(results)))

    items = []
    for data in results:
        service_origin = safe_select_single(data, "div.location.o")
        service_destination = safe_select_single(data, "div.location.d")
        if service_origin != origin or service_destination != destination:
            continue

        time_planned = safe_select_single(data, "div.time.plan.a.wtt")
        time_actual = safe_select_single(data, "div.time.real.a.act")

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
        print(item)
        items.append(item)

    return items


def safe_select_single(data, selector):
    result = data.select(selector)
    if not result:
        return None
    return result[0].string


def check_service_delay(time_actual, time_planned):
    actual = parse_service_time(time_actual)
    planned = parse_service_time(time_planned)

    delay = actual - planned

    if delay < 0:
        return 0

    return delay


def parse_service_time(time):
    if not time:
        return False

    time = time.replace("½", ".5")

    hours = time[0:2]
    mins = time[2:]

    # Handle midnight very simply - will break if services run later than 00:59
    if hours == "00":
        hours = "24"

    total = (int(hours) * 60) + float(mins)

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
        station = check["station"]
        print("Checking station: {}".format(station))
        services = process_services(date, station, check["origin"], check["destination"])
        analysis = analyse_services(services)
        print(analysis)

        if station not in output:
            output[station] = {
                "meta": {
                    "station": station,
                    "origin": check["origin"],
                    "destination": check["destination"],
                },
                "dates": {},
            }

        output[station]["dates"][date] = {
            "date": date,
            "analysis": analysis,
            "services": services,
        }

    print("Saving output to JSON...")
    print(output)
    save_json(output)
    print("Process ended!")


main()
