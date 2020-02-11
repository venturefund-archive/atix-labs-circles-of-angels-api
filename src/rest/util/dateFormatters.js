const moment = require('moment');

const SECONDS_IN_A_DAY = 86400;

module.exports = {
  secondsToDays: seconds => Math.round(seconds / SECONDS_IN_A_DAY),
  getStartOfDay: date => moment(date).startOf('day'),
  getDaysPassed: (from, to) => moment(to).diff(from, 'days')
};
