(function() {
    angular.module('scannerApp')
    .controller('EditorController', EditorController);

    function EditorController($scope, collection) {
        var vm = this;
        vm.editedMetadata = {};
        vm.showTable = false;
        vm.saveRow = saveRow;

        init();

        function init() {
            setListeners();
        }

        $scope.$on('$destroy', function() {
            removeListeners();
        });

        function setListeners() {
            collection.on('metadata.edit', onMetadataEdit);
        }

        function removeListeners() {
            collection.removeListeners('metadata.edit', onMetadataEdit);
        }

        function saveRow(row) {
            console.log(row);
        }

        function onMetadataEdit(metadata) {
            vm.showTable = false;
            $scope.$digest();
            vm.editedMetadata = metadata;
            let temp = "";
            _.forEach(vm.editedMetadata.artist, (artist, i) => {
                temp += `${artist}`;
                if (i < vm.editedMetadata.artist.length - 1) {
                    temp += `,`;
                }
            });
            vm.editedMetadata.artist = temp;
            vm.showTable = true;
            $scope.$digest();
        }

    }
})();
