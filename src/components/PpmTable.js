import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

const useStyles = makeStyles({
  container: {
    maxHeight: 420,
  },
});

function PpmTable({ station }) {
  const classes = useStyles();

  const formatPercent = (number) => (
    number ? `${(Math.round(number.toFixed(4) * 10000) / 100)}%` : '-'
  );

  const formatWeekday = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('default', { weekday: 'long' });
  };

  return (!!station
    && (
      <TableContainer className={classes.container}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Weekday</TableCell>
              <TableCell>Services</TableCell>
              <TableCell>Ontime</TableCell>
              <TableCell>PPM</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(station.dates).reverse().map(([dateKey, date]) => (
              <TableRow key={dateKey}>
                <TableCell component="th" scope="row">{date.date}</TableCell>
                <TableCell>{formatWeekday(date.date)}</TableCell>
                <TableCell>{date.analysis.total_services}</TableCell>
                <TableCell>{date.analysis.total_ontime}</TableCell>
                <TableCell>{formatPercent(date.analysis.percent_ontime)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )
  );
}

export default PpmTable;
