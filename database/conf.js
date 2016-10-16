const basePath = require('base-path');

module.exports = {
    client: 'sqlite3',
    connection: {
        filename: `${basePath()}/database/db.sqlite`
    },
    useNullAsDefault: true
};
