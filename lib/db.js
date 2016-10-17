const _ = require('lodash');
const basePath = require('base-path');
const conf = require(`${basePath()}/database/conf`);
var sql = require('knex')(conf);
var bookshelf = require('bookshelf')(sql);

var Track = bookshelf.Model.extend({
    tableName: 'tracks',
    artists: function() {
        return this.belongsToMany(Artist);
    },
    genres: function() {
        return this.belongsToMany(Genre);
    },
    hasTimestamps: false
});

var Artist = bookshelf.Model.extend({
    tableName: 'artists',
    tracks: function() {
        return this.belongsToMany(Track);
    },
    hasTimestamps: false
});

var Genre = bookshelf.Model.extend({
    tableName: 'genres',
    tracks: function() {
        return this.belongsToMany(Track);
    },
    hasTimestamps: false
});


module.exports = {
    Track: Track,
    Artist: Artist,
    Genre: Genre
};
