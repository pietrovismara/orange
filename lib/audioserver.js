const debug = require('debug')('orange:audioserver');
const express = require('express');
const fs = require('fs');
const app = express();

module.exports = {
    listen: listen
};

app.get('/', function(req, res) {    
    if (req.query.path) {
        return res.sendFile(req.query.path);
    }
    res.send('Missing path');
});


function listen() {
    app.listen(9000, function() {
        debug('listening on port 9000');
    });
}
