const _ = require('lodash');
const EventEmitter = require('eventemitter3');
const debug = require('debug')('orange:collection');
const Promise = require('bluebird');
const basePath = require('base-path');
const db = require(`${basePath()}/lib/db`);
var Track = db.Track;
var Artist = db.Artist;
var Genre = db.Genre;

var collection = [];
var factory = {
    add: addMetadata,
    update: updateMetadata,
    has: hasMetadata,
    create: createMetadata,
    edit: editMetadata,
    get: getMetadata,
    getCollection: getCollection,
    loadCollection: loadCollection,
    size: size,
    isEmpty: isEmpty,
    isReady: isReady
};
var emitter = new EventEmitter();
_.assignIn(factory, emitter);

module.exports = factory;

var ready = false;

function isReady() {
    if (ready) {
        return Promise.resolve();
    }

    return new Promise((resolve) => {
        factory.once('ready', () => {
            resolve();
        });
    });
}

function editMetadata(id) {
    let metadata = getMetadata(id);
    if (metadata) {
        factory.emit('metadata.edit', metadata);
    }
}

function updateMetadata(data, artists, genres) {
    debug('updateMetadata', data.title);
    let track = new Track(_.pick(data, ['id', 'title', 'rating', 'bpm', 'mood', 'path', 'format', 'duration']));
    return track.save()
    .then((trackModel) => {
        let tasks = [];
        if (artists && artists.length) {
            artists = _.map(artists, artist => new Artist({ name: artist }));
            tasks.push(Promise.each(artists, saveArtist));
        }
        if (genres && genres.length) {
            genres = _.map(genres, genre => new Genre({ name: genre }));
            tasks.push(Promise.each(genres, saveGenre));
        }

        return Promise.all(tasks)
        .then((res) => {
            return Promise.resolve({
                track: trackModel,
                artists: res[0],
                genres: res[1]
            });
        });
    })
    .then((res) => {
        let tasks = [];
        if (res.artists) {
            tasks.push(resetModelsCollection(res.track.artists(), res.artists));
        }

        if (res.genres) {
            tasks.push(resetModelsCollection(res.track.genres(), res.genres));
        }


        return Promise.all(tasks)
        .then((result) => {
            return {
                track: res.track,
                artists: result[0],
                genres: result[1]
            };
        });
    })
    .then((res) => {
        if (!res) {
            return Promise.resolve();
        }

        let _metadata = createMetadata(res.track, artists, genres);
        let index = _.findIndex(collection, metadata => metadata.id === _metadata.id);
        if (index !== -1) {
            return collection.splice(index, 1, _metadata);
        }

        return Promise.reject(new Error(`Can't update metadata: not found in collection`));
    })
    .then(() => {
        return factory.emit('metadata.refresh');
    });
}

// Add metadata to the collection and saves it to db
function addMetadata(data, artists, genres) {
    debug('addMetadata', data.title);
    let track = new Track(_.pick(data, ['title', 'rating', 'bpm', 'mood', 'path', 'format', 'duration']));
    return track.where('path', data.path)
    .fetch()
    .then((trackModel) => {
        if (!trackModel) {
            let tasks = [];
            tasks.push(track.save());
            if (artists) {
                artists = _.map(artists, artist => new Artist({ name: artist }));
                tasks.push(Promise.each(artists, saveArtist));
            }
            if (genres) {
                genres = _.map(genres, genre => new Genre({ name: genre }));
                tasks.push(Promise.each(genres, saveGenre));
            }
            return Promise.all(tasks)
            .then((res) => {
                artists = res[1];
                genres = res[2];
                return Promise.resolve(res[0]);
            });
        }

        return Promise.resolve();
    })
    .then((trackModel) => {
        if (!trackModel) {
            return Promise.resolve();
        }
        let tasks = [];
        if (artists) {
            tasks.push(trackModel.artists().attach(artists));
        }

        if (genres) {
            tasks.push(trackModel.genres().attach(genres));
        }


        return Promise.all(tasks)
        .then((res) => {
            return {
                track: trackModel,
                artists: res[0],
                genres: res[1]
            };
        });
    })
    .then((res) => {
        if (!res) {
            return Promise.resolve();
        }

        return collection.push(createMetadata(res.track, res.artists, res.genres));
    })
    .then(() => {
        return factory.emit('metadata.refresh');
    });
}

function createMetadata(trackModel, artists, genres) {
    let track = {
        artist: [],
        genres: []
    };
    artists = artists || trackModel.related('artists');
    genres = genres || trackModel.related('genres');
    artists.forEach((artist) => {
        track.artist.push(artist.get('name'));
    });
    genres.forEach((genre) => {
        track.genres.push(genre.get('name'));
    });
    _.assign(track, trackModel.attributes);
    return track;
}

function getMetadata(id) {
    return _.find(collection, (metadata) => {
        return metadata.id === id;
    });
}

function hasMetadata(id) {
    return !!getMetadata(id);
}

function loadCollection() {
    debug('loadCollection');
    ready = false;

    return Track.fetchAll({
        withRelated: ['artists', 'genres']
    })
    .then((tracks) => {
        tracks.forEach((track) => {
            collection.push(createMetadata(track));
        });

        ready = true;
        factory.emit('ready');
        debug('loadedCollection');
    });
}

function getCollection() {
    return _.slice(collection);
}

function size() {
    return collection.length;
}

function isEmpty() {
    return !collection.length;
}

function saveGenre(genre) {
    return genre.where('name', genre.get('name'))
    .fetch()
    .then((genreModel) => {
        if (!genreModel) {
            return genre.save();
        }

        return Promise.resolve();
    });
}

function saveArtist(artist) {
    return artist.where('name', artist.get('name'))
    .fetch()
    .then((artistModel) => {
        if (!artistModel) {
            return artist.save();
        }

        return Promise.resolve();
    });
}

function resetModelsCollection(modelsCollection, newModels) {
    return modelsCollection.fetch()
    .then((res) => {
        let oldModels = res.slice();
        return modelsCollection.detach(oldModels);
    })
    .then(() => {
        return modelsCollection.attach(newModels);
    });
}
