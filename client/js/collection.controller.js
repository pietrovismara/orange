(function() {
angular.module('scannerApp')
.controller('CollectionController', CollectionController);

function CollectionController($scope, superFilter, collection, scanner) {
    var vm = this;
    vm.collection = {};
    vm.activeFilters = {
        groupBy: false,
        searchBy: false
    };

    vm.searchKey = "";
    vm.groupBy = groupBy;
    vm.filter = filter;
    vm.scanning = true;

    collection.loadCollection()
    .then(() => {
        init();
    });

    function init() {
        superFilter.init();
        setListeners();
        onScanData();
    }

    $scope.$on('$destroy', function() {
        removeListeners();
    });

    function setListeners() {
        scanner.on('scan.complete', onScanComplete);
        scanner.on('scan.data', onScanData);
        scanner.on('scan.start', onScanStart);
    }

    function removeListeners() {
        scanner.removeListeners('scan.complete', onScanComplete);
        scanner.removeListeners('scan.data', onScanData);
        scanner.removeListeners('scan.start', onScanStart);
    }

    function onScanData() {
        vm.collection = collection.getCollection();
        vm.collectionSize = collection.size();
        groupBy('artist');
        filter();
        $scope.$digest();
    }

    function onScanStart() {
        vm.scanning = true;
        $scope.$digest();
    }

    function onScanComplete() {
        vm.scanning = false;
        onScanData();
    }

    function searchBy() {
        if (!vm.searchKey) {
            superFilter.searchBy(null);
        } else {
            superFilter.searchBy((track) => {
                if (track.title.toLowerCase().indexOf(vm.searchKey.toLowerCase()) !== -1) {
                    return true;
                }

                return _.some(track.artist, (artist) => {
                    return artist.toLowerCase().indexOf(vm.searchKey.toLowerCase()) !== -1;
                });
            });
        }

        filter();
    }

    function groupBy(type) {
        superFilter.groupBy(type);
        filter();
    }

    function filter() {
        vm.activeFilters = superFilter.getFiltersStatus();
        _.assign(vm.checkBoxes, vm.activeFilters);
        vm.collection = superFilter.exec();
    }
}

})();
