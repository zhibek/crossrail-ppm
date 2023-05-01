import React, { useState } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';

const useStyles = makeStyles((theme) => ({
  container: {
    maxHeight: 420,
  },
  rowSuccess: {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
  },
  rowWarning: {
    backgroundColor: theme.palette.warning.main,
    color: theme.palette.warning.contrastText,
  },
  rowError: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
  },
}));

function PpmTable({ station }) {
  const classes = useStyles();

  const [expand, setExpand] = useState();

  const toggleExpand = (dateKey) => {
    if (expand === dateKey) {
      return setExpand();
    }
    return setExpand(dateKey);
  };

  const checkExpand = (dateKey) => (expand === dateKey);

  const formatPercent = (number) => (
    number ? `${(Math.round(number.toFixed(4) * 10000) / 100)}%` : '-'
  );

  const formatWeekday = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('default', { weekday: 'long' });
  };

  const dateRowClass = (onTimePercent) => {
    if (onTimePercent >= 0.95) {
      return classes.rowSuccess;
    }
    if (onTimePercent >= 0.8) {
      return classes.rowWarning;
    }
    return classes.rowError;
  };

  const serviceRowClass = (service) => {
    if (!service.ran) {
      return classes.rowError;
    }
    if (!service.ontime) {
      return classes.rowWarning;
    }
    return classes.rowSuccess;
  };

  const serviceStatus = (service) => {
    if (!service.ran) {
      return 'Cancelled';
    }
    if (!service.ontime) {
      return 'Delayed';
    }
    return 'Ontime';
  };

  return (!!station
    && (
      <TableContainer className={classes.container}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Date</TableCell>
              <TableCell>Weekday</TableCell>
              <TableCell>Services</TableCell>
              <TableCell>Ontime</TableCell>
              <TableCell>PPM</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(station.dates).reverse().map(([dateKey, date]) => (
              <>
                <TableRow
                  key={dateKey}
                  classes={{
                    root: dateRowClass(date.analysis.percent_ontime),
                  }}
                >
                  <TableCell style={{ width: '20px' }}>
                    <IconButton aria-label="expand row" size="small" onClick={() => toggleExpand(dateKey)}>
                      {checkExpand(dateKey) ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                  </TableCell>
                  <TableCell component="th" scope="row">{date.date}</TableCell>
                  <TableCell>{formatWeekday(date.date)}</TableCell>
                  <TableCell>{date.analysis.total_services}</TableCell>
                  <TableCell>{date.analysis.total_ontime}</TableCell>
                  <TableCell>{formatPercent(date.analysis.percent_ontime)}</TableCell>
                </TableRow>
                <TableRow key={`extra-${dateKey}`}>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={checkExpand(dateKey)} timeout="auto" unmountOnExit>
                      <Table stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell>Planned</TableCell>
                            <TableCell>Actual</TableCell>
                            <TableCell>Delay</TableCell>
                            <TableCell>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {Object.entries(date.services).map(([serviceKey, service]) => (
                            <TableRow key={serviceKey} classes={{ root: serviceRowClass(service) }}>
                              <TableCell>{service.planned ?? '-'}</TableCell>
                              <TableCell>{service.actual ?? '-'}</TableCell>
                              <TableCell>{service.delay ?? '-'}</TableCell>
                              <TableCell>{serviceStatus(service)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )
  );
}

export default PpmTable;
