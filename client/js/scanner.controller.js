(function() {
    angular.module('orange')
    .controller('ScannerController', ScannerController);

    function ScannerController($scope, scanner, collection, dialog) {
        var vm = this;
        vm.scanDirRec = scanDirRec;
        vm.scanDir = scanDir;
        vm.scanFile = scanFile;
        vm.searchBy = searchBy;
        vm.groupBy = groupBy;
        vm.filter = filter;
        vm.scanning = true;

        collection.isReady()
        .then(() => {
            init();
            onScanData();
        });

        function init() {
            vm.scanning = false;
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
            vm.collectionSize = collection.size();
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

        function scan(path, recursive) {
            scanner.scan(path, recursive);            
        }

        function scanDir() {
            var path = dialog.showOpenDialog({
                properties: ['openDirectory']
            });
            if (path) {
                scan(path[0]);
            }
        }

        function scanDirRec() {
            var path = dialog.showOpenDialog({
                properties: ['openDirectory']
            });

            if (path) {
                scan(path[0], true);
            }
        }

        function scanFile() {
            var path = dialog.showOpenDialog({
                properties: ['openFile'],
                filters: [{
                    name: 'Audio Files',
                    extensions: ['wav', 'mp3', 'flac', 'ogg']
                }]
            });

            if (path) {
                scan(path[0]);
            }
        }


    }
})();
