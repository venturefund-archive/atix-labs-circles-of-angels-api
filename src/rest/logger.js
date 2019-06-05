const bunyan = require('bunyan');
const bformat = require('bunyan-format');

const formatOut = bformat({ outputMode: 'short' });

module.exports = bunyan.createLogger({
  name: 'circles-of-angels-api',
  streams: [
    {
      level: 'info',
      stream: formatOut
    },
    {
      level: 'error',
      stream: formatOut
    },
    {
      level: 'info',
      path: './logs/logs.info',
      type: 'rotating-file',
      period: '1d',
      count: 5
    },
    {
      level: 'error',
      path: './logs/logs.error',
      type: 'rotating-file',
      period: '1d',
      count: 5
    },
    {
      level: 'fatal',
      path: './logs/logs.fatal',
      type: 'rotating-file',
      period: '1d',
      count: 5
    }
  ]
});
