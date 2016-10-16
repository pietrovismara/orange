const _ = require('lodash');
const EventEmitter = require('eventemitter3');
const debug = require('debug')('orange:collection');
const basePath = require('base-path');
const Metadata = require(`${basePath()}/lib/metadata`);

var collection = [];
var factory = {
    add: addMetadata,
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

    return new Promise((resolve, reject) => {
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

// Add metadata to the collection and saves it to db
function addMetadata(data) {
    if (!(data instanceof Metadata)) {
        data = createMetadata(data);
    }

    return data.save()
    .then(() => {
        collection.push(data);
    });
}

function getMetadata(id) {
    return _.find(collection, (metadata) => {
        return metadata.id === id;
    });
}

function createMetadata(data) {
    return new Metadata(data);
}

function hasMetadata(id) {
    return !!getMetadata(id);
}

function loadCollection() {
    debug('loadCollection');
    ready = false;
    return Metadata.get()
    .then((data) => {
        _.forEach(data, (metadata) => {
           collection.push(metadata);
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
