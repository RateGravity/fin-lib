const { join } = require('path');

module.exports = {
  ...require('./jest.config'),
  moduleNameMapper: {
    ['^@ownup/fin-lib$']: join(__dirname, './lib')
  }
}