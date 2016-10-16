(function() {
const remote = require('electron').remote;
const {dialog} = require('electron').remote;
const basePath = remote.require('base-path');
const collection = remote.require(`${basePath()}/lib/collection`);
const scanner = remote.require(`${basePath()}/lib/scanner`);
remote.getCurrentWindow().removeAllListeners();

angular.module('scannerApp', ['ngMaterial', 'mdDataTable', 'ngMdIcons', 'ngSanitize'])
.factory('collection', function() {
    return collection;
})
.factory('scanner', function() {
    return scanner;
})
.factory('dialog', function() {
    return dialog;
})
.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .primaryPalette('orange')
    .accentPalette('red');
});

})();
