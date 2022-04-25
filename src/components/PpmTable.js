import React from 'react';

import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

function PpmTable({ station }) {
  const formatPercent = (number) => (
    number ? `${(number.toFixed(4) * 100)}%` : '-'
  );

  const formatWeekday = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('default', { weekday: 'long' });
  };

  return (!!station
    && (
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Weekday</TableCell>
            <TableCell>Total Services</TableCell>
            <TableCell>Total Ontime</TableCell>
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
    )
  );
}

export default PpmTable;
