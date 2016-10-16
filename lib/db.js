const basePath = require('base-path');
const conf = require(`${basePath()}/database/conf`);

var sql = require('knex')(conf);

module.exports = {
    init: function() {
        return sql.schema.hasTable('metadata').then(function(exists) {
            if (exists) {
                return Promise.resolve();
            }

            return sql.schema.createTable('metadata', function(table) {
                table.increments();
                table.string('title');
                table.string('artist');
                table.integer('rating');
                table.float('bpm');
                table.string('mood');
                table.string('path');
                table.unique('path');
                table.string('format');
            });
        });
    },
    getDriver: function(table) {
        return sql(table);
    }
}
