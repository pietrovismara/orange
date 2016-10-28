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
            vm.save = save;
            vm.metadata = {};

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

            function save(metadata) {
                console.log("save", metadata);
                collection.update(metadata, metadata.artist, metadata.genres)
                .then((res) => {
                    console.log("saved", res);
                })
                .catch((err) => {
                    console.log(err);
                });
            }

            function onMetadataEdit(metadata) {
                console.log('onMetadtaEdit', metadata);
                vm.metadata = _.clone(metadata);
                vm.metadata.rating = vm.metadata.rating || 0;
                vm.metadata.bpm = vm.metadata.bpm || 0;
                $scope.$digest();
            }

        }
    }
})();
