// Update with your config settings.
const path = require('path');
const basePath = require('base-path');
basePath((path.resolve('../', './')));
const conf = require(`${basePath()}/database/conf`);

module.exports = {
    development: conf
};
