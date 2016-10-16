const _ = require('lodash');
const basePath = require('base-path');
const db = require(`${basePath()}/lib/db`);
var dbDriver = db.getDriver('metadata');

var fields = [
    { name: 'id', default: null },
    { name: 'title', default: "" },
    { name: 'artist', default: ['Unknown Artist'], save: JSON.stringify, read: JSON.parse },
    { name: 'rating', default: 0 },
    { name: 'bpm', default: 0 },
    { name: 'mood', default: "" },
    { name: 'path', default: "" },
    { name: 'format', default: "" }
];

class Metadata {
    constructor(data) {
        _.forEach(fields, (field) => {
            this[field.name] = data.hasOwnProperty(field.name) ? data[field.name] : field.default;
        });

        if (!this.hasArtist()) {
            this.setArtists(['Unknown Artist']);
        }
    }

    static getFields() {
        return fields;
    }

    static get() {
        return dbDriver.select('*')
        .then((data) => {
            return _.map(data, (metadata) => createMetadataFromDb(metadata));
        });
    }

    static delete(id) {
        return dbDriver
        .where('id', id)
        .del();
    }

    save() {
        return dbDriver.insert(this.getAttributes('save'))
        .catch((err) => {
            if (err.code === 'SQLITE_CONSTRAINT') {
                return Promise.reject();
            }

            throw err;
        });
    }

    getAttributes(format) {
        let attributes = {};
         _.forEach(fields, (field) => {
            attributes[field.name] = this.hasOwnProperty(field.name) ? this[field.name] : field.default;
            let operation = field[format];
            if (operation) {
                attributes[field.name] = field[format](attributes[field.name]);
            }
        });
        return attributes;
    }

    hasPath() {
        return !!this.path;
    }

    setPath(path) {
        this.path = path;
    }

    hasTitle() {
        return !!this.title;
    }

    setTitle(title) {
        this.title = title;
    }

    getTitle() {
        return this.title;
    }

    hasArtist() {
        return !!this.artist.length;
    }

    removeArtist(artist) {
        this.artist = _.filter(this.artist, (_artist) => {
            return _artist !== artist;
        });
    }

    addArtist(artist) {
        this.artist.push(artist);
    }

    setArtists(artists) {
        this.artist = artists;
    }

    setRating(rating) {
        this.rating = rating;
    }

    setBpm(bpm) {
        this.bpm = bpm;
    }

    setMood(mood) {
        this.mood = mood;
    }
}

function createMetadataFromDb(data) {
    data = new Metadata(data);
    _.forEach(fields, (field) => {
        if (field.read) {
            data[field.name] = field.read(data[field.name]);
        }
    });

    return data;
}

module.exports = Metadata;
