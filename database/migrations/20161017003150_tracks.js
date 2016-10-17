exports.up = function(knex, Promise) {
    var creators = getCreators();
    var schema = knex.schema;
    creators.forEach((creator) => {
        schema = creator(schema);
    });

    return schema;
};

exports.down = function(knex, Promise) {
    return knex.schema
    .dropTable('tracks')
    .dropTable('artists')
    .dropTable('genres')
    .dropTable('artists_tracks')
    .dropTable('genres_tracks');
};

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
        table.string('name').unique();
    });
}

function createGenresTable(schema) {
    return schema.createTable('genres', function(table) {
        table.increments();
        table.string('name').unique();
    });
}

function createTracksTable(schema) {
    return schema.createTable('tracks', function(table) {
        table.increments();
        table.string('title');
        table.integer('rating');
        table.float('bpm');
        table.string('mood');
        table.string('path').unique();
        table.string('format');
    });
}
