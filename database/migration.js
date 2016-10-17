const basePath = require('base-path');
const conf = require(`${basePath()}/database/conf`);
const _ = require('lodash');
var sql = require('knex')(conf);
var bookshelf = require('bookshelf')(sql);


module.exports.up = function() {
    let schema = sql.schema;
    let creators = getCreators();

    _.forEach(creators, (creator) => {
        schema = creator(schema);
    });

    return schema
    .then((res) => {
        console.log('done', res);
    })
    .catch((err) => {
        throw err;
    });
}

module.exports.down = function() {
    return sql.schema
    .dropTable('tracks')
    .dropTable('artists');
    .dropTable('genres')
    .dropTable('');
}

function getCreators() {
    return [
        createTracksTable,
        createArtistsTable,
        createGenresTable,
        createArtistsTracksTable,
        createGenresTracksTable
    ];
}

function createArtistsTracksTable(schema) {
    return schema.createTable('artists_tracks', function(table) {
        table.integer('artist_id').references('artists.id');
        table.integer('track_id').references('tracks.id');
    });
}

function createGenresTracksTable(schema) {
    return schema.createTable('genres_tracks', function(table) {
        table.integer('genre_id').references('genres.id');
        table.integer('track_id').references('tracks.id');
    });
}

function createArtistsTable(schema) {
    return schema.createTable('artists', function(table) {
        table.increments();
        table.string('name');
    });
}

function createGenresTable(schema) {
    return schema.createTable('genres', function(table) {
        table.increments();
        table.string('name');
    });
}

function createTracksTable(schema) {
    return schema.createTable('tracks', function(table) {
        table.increments();
        table.string('title');
        table.integer('rating');
        table.float('bpm');
        table.string('mood');
        table.string('path');
        table.unique('path');
        table.string('format');
    });
}
