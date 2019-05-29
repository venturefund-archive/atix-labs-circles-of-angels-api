const configs = environment => {
  switch (environment) {
    case 'development':
      return require('./configs-development');
    case 'test':
      return require('./configs-test');
    default:
      return require('./configs-development');
  }
};

module.exports = configs;
