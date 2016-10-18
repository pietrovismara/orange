(function() {
const remote = require('electron').remote;
const {dialog} = require('electron').remote;
const basePath = remote.require('base-path');
const collection = remote.require(`${basePath()}/lib/collection`);
const scanner = remote.require(`${basePath()}/lib/scanner`);
remote.getCurrentWindow().removeAllListeners();

angular.module('orange', ['ngMaterial', 'mdDataTable', 'ngMdIcons', 'ngSanitize'])
.factory('collection', function() {
    return collection;
})
.factory('scanner', function() {
    return scanner;
})
.factory('dialog', function() {
    return dialog;
})
.factory('AV', function() {
    var AV = window.AV;
    delete window.AV;
    return AV;
})
.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .primaryPalette('blue-grey')
    .accentPalette('blue-grey')
    .dark();
});

})();
