const logger = require('../logger');

module.exports = {
  async getAll(props) {
    logger.info('[CountryService] :: Entering getAll method');
    const filters = props && props.filters ? props.filters : {};
    const countries = await this.countryDao.findAllByProps(filters);
    return countries.map(({ name }) => name);
  }
};
