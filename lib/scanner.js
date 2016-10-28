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

var emitter = new EventEmitter();

var scanner = {
    scan: scan
};

_.assignIn(scanner, emitter);
module.exports = scanner;

function scan(scanPath, doRecursive) {
    debug('scan.start');
    scanner.emit('scan.start');
    let task;
    if (isFile(scanPath)) {
        debug('isFile');
         task = scanFile(path.resolve(scanPath, '../'), path.basename(scanPath));
    } else if (isDir(scanPath)) {
        debug('isDir');
        task = scanDirectory(scanPath, doRecursive);
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
        mm(fileStream, { duration: true }, (err, metadata) => {
            metadata = _.omit(metadata, ['picture']);
            metadata.title = metadata.title || filename;
            metadata.path = metadata.path || absolutePath;
            metadata.format = metadata.format || extension.substring(extension.indexOf('.') + 1);
            metadata.duration = Math.floor(metadata.duration);
            metadata.genre = split(metadata.genre);
            metadata.artist = split(metadata.artist);
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

function scanDirectory(scanPath, doRecursive) {
    if (doRecursive) {
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
               scanPath = path.resolve(absolutePath, '../');
               return scanFile(scanPath, filename);
           });
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

function split(list) {
    let _list = [];
    _.forEach(list, (item) => {
        let splitted = _.map(item.split(','), (splittedItem) => {
            return splittedItem.trim();
        });
        _list = _list.concat(splitted);
    });
    return _list;
}
