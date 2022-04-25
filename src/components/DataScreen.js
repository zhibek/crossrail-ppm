import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Typography from '@material-ui/core/Typography';

import PpmTable from './PpmTable';

const useStyles = makeStyles({
  root: {
    maxWidth: 1000,
  },
});

function DataScreen({ data }) {
  const classes = useStyles();

  return (!!data
    && (
      <Grid container spacing={4}>

        <Grid item xs={12} align="center">
          <Typography component="h2" variant="h2">Crossrail PPM</Typography>
        </Grid>

        <Grid item xs={12} align="center">
          <p>
            Basic script to approximate Crossrail PPM using data from&nbsp;
            <a href="https://www.realtimetrains.co.uk/" target="_blank" rel="noreferrer">Realtime Trains</a>
            .
          </p>
        </Grid>

        {Object.entries(data).map(([stationKey, station]) => (
          <Grid item key={stationKey} xs={12} align="center">
            <Card className={classes.root}>
              <CardHeader title={`Arriving at ${station.meta.station}, from ${station.meta.origin}`} />
              <CardContent>
                <PpmTable station={station} />
              </CardContent>
            </Card>
          </Grid>
        ))}

      </Grid>
    )
  );
}

export default DataScreen;
