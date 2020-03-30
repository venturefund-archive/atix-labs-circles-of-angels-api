const config = require('config');

const { explorerLink } = config;
const TX_ROUTE = 'tx';
const ADDRESSES_ROUTE = 'addresses';

exports.buildTxURL = txHash => `${explorerLink}/${TX_ROUTE}/${txHash}`;
exports.buildAddressURL = address =>
  `${explorerLink}/${ADDRESSES_ROUTE}/${address}`;
