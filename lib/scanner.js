"use strict";

const fs = require('fs');
const mm = require('musicmetadata');
const _ = require('lodash');
const path = require('path');
const recursive = require('recursive-readdir');
const Promise = require('bluebird');
const EventEmitter = require('eventemitter3');
const debug = require('debug')('orange:scanner');
const basePath = require('base-path');
const collection = require(`${basePath()}/lib/collection`);

const validExtensions = ['.wav', '.flac', '.mp3', '.ogg'];
const collectionFilePath = './collection.json';

var emitter = new EventEmitter();

var scanner = {
    scan: scan
};

_.assignIn(scanner, emitter);
module.exports = scanner;

function scan(scanPath, recursive) {
    debug('scan.start');
    scanner.emit('scan.start');
    let task;
    if (isFile(scanPath)) {
        debug('isFile');
         task = scanFile(path.resolve(scanPath, '../'), path.basename(scanPath));
    } else if (isDir(scanPath)) {
        debug('isDir');
        task = scanDirectory(scanPath, recursive);
    } else {
        debug('neither');
        task = Promise.resolve();
    }

    return task.then(() => {
        debug('scan.complete')
        return scanner.emit('scan.complete');
    })
    .catch((err) => {
        console.error(err);
    });
}

function scanFile(scanPath, filename) {
    return new Promise((resolve, reject) => {
        let absolutePath = path.join(scanPath, filename);
        let extension = path.extname(filename);
        if (!_.includes(validExtensions, extension)) {
            return resolve();
        }
        debug('scanning file: ', filename);
        var fileStream = fs.createReadStream(absolutePath, { autoClose: true });
        mm(fileStream, (err, metadata) => {
            metadata = _.omit(metadata, ['picture']);
            metadata.title = metadata.title || filename;
            metadata.path = metadata.path || absolutePath;
            metadata.format = metadata.format || extension.substring(extension.indexOf('.') + 1);
            fileStream.close();
            collection.add(metadata, metadata.artist, metadata.genre)
            .then(() => {
                resolve();
            })
            .catch((e) => {
                reject(e);
            });
        });
    });
}

function scanDirectory(scanPath, recursive) {
    if (recursive) {
        return scanRecursive(scanPath);
    }

    var items = fs.readdirSync(scanPath);
    return Promise.each(items, (filename) => {
        scanner.emit('scan.data');
        return scanFile(scanPath, filename);
    });
}

function recursivePromise(scanPath) {
    return new Promise((resolve, reject) => {
        recursive(scanPath, ['.jpg', '.cue', '.log', '.m3u', '.txt', '.pdf', '.exe'], function (err, items) {
            if (err) {
                reject(err);
            }
            resolve(items);
        });
    });
}

function scanRecursive(scanPath) {
    return recursivePromise(scanPath)
    .then((items) => {
        return _.chunk(items, 20);
    })
   .then((chunkedItems) => {
       return Promise.each(chunkedItems, (items) => {
           scanner.emit('scan.data');
           return Promise.each(items, (absolutePath) => {
               var filename = path.basename(absolutePath);
               var scanPath = path.resolve(absolutePath, '../');
               return scanFile(scanPath, filename);
           });
       });
   });
}

function updateCollection() {
    return new Promise((resolve, reject) => {
        fs.writeFile(collectionFilePath, JSON.stringify(collection.getCollection()), (err) => {
            if (err) { return reject(); }
            resolve();
        });
    });
}

function isFile(filePath) {
    try {
        return fs.statSync(filePath).isFile();
    } catch (err) {
        return false;
    }
}

function isDir(filePath) {
    try {
        return fs.statSync(filePath).isDirectory();
    } catch (err) {
        return false;
    }
}
