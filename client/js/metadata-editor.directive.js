(function() {
    angular.module('orange')
    .directive('metadataEditor', metadataEditorDirective);

    function metadataEditorDirective(collection) {
        return {
            restrict: 'E',
            controller: controller,
            controllerAs: 'editor',
            templateUrl: 'client/partials/metadata-editor.html'
        };

        function controller($scope) {
            var vm = this;
            vm.editedMetadata = {};

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
                console.log('onMetadtaEdit', metadata);
                // $scope.$digest();
                vm.editedMetadata = metadata;
                // let temp = "";
                // _.forEach(vm.editedMetadata.artist, (artist, i) => {
                //     temp += `${artist}`;
                //     if (i < vm.editedMetadata.artist.length - 1) {
                //         temp += `,`;
                //     }
                // });
                // $scope.$digest();
            }

        }
    }
})();
