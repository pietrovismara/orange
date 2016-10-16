const basePath = require('base-path');

var sql = require('knex')({
    client: 'sqlite3',
    connection: {
        filename: `${basePath()}/database/db.sqlite`
    },
    useNullAsDefault: true
});

module.exports = {
    init: function() {
        return sql.schema.createTableIfNotExists('metadata', function(table) {
            table.increments();
            table.string('title');
            table.string('artist');
            table.integer('rating');
            table.float('bpm');
            table.string('mood');
            table.string('paths');
            table.string('format');
        });
    },
    getDriver: function(table) {
        return sql(table);
    }
}

// .then(() => {
//     return Promise.all([
//         sql('testone').insert({'name': 'test1', 'play_count': 100}),
//         sql('testone').insert({'name': 'test2', 'play_count': 200}),
//         sql('testone').insert({'name': 'test3', 'play_count': 300})
//     ])
//     .then( function (result) {
//         console.log(result);
//     });
// })
// .then(() => {
//     console.log('write done!');
//     return sql('testone').where('play_count', '>', 100)
//     .then((result) => {
//         console.log('read: ', result);
//     });
// });
