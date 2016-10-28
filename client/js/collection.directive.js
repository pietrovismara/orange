(function() {
angular.module('orange')
.directive('collection', collectionDirective);

function collectionDirective(superFilter, collection, scanner) {
    return {
        restrict: 'E',
        replace: true,
        controller: controller,
        controllerAs: 'ctrl',
        templateUrl: 'client/partials/collection.html'
    };

    function controller($scope) {
        var vm = this;
        vm.collection = {};
        vm.activeFilters = {
            groupBy: false,
            searchBy: false
        };

        vm.searchKey = "";
        vm.groupByKey = "artist";
        vm.groupBy = groupBy;
        vm.searchBy = searchBy;
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
            collection.on('metadata.refresh', onScanData);
        }

        function removeListeners() {
            scanner.removeListeners('scan.complete', onScanComplete);
            scanner.removeListeners('scan.data', onScanData);
            scanner.removeListeners('scan.start', onScanStart);
            collection.removeListeners('metadata.refresh', onScanData);
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

        function searchBy(searchKey) {
            if (searchKey) {
                superFilter.searchBy((track) => {
                    if (track.title.toLowerCase().indexOf(searchKey.toLowerCase()) !== -1) {
                        return true;
                    }

                    return _.some(track.artist, (artist) => {
                        return artist.toLowerCase().indexOf(searchKey.toLowerCase()) !== -1;
                    });
                });
            } else {
                superFilter.searchBy(null);
            }

            filter();
        }

        function groupBy(groupByKey) {
            superFilter.groupBy(groupByKey);
            filter();
        }

        function filter() {
            vm.activeFilters = superFilter.getFiltersStatus();
            _.assign(vm.checkBoxes, vm.activeFilters);
            vm.collection = superFilter.exec();
        }
    }
}

})();
