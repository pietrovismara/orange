(function() {
    angular.module('orange')
    .directive('metadataEditor', metadataEditorDirective);

    function metadataEditorDirective($mdToast, collection) {
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
                metadata = _.clone(metadata);
                let duration = metadata.duration.split(':');
                let seconds = (parseInt(duration[0]) * 60) + parseInt(duration[1]);
                metadata.duration = Math.floor(seconds);
                collection.update(metadata, metadata.artist, metadata.genres)
                .then(() => {
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('Track updated!')
                        .position('top right')
                        .hideDelay(2000)
                    );
                })
                .catch((err) => {
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent(`Error: ${err}`)
                        .position('top right')
                        .hideDelay(2000)
                    );
                });
            }

            function onMetadataEdit(metadata) {
                console.log('onMetadtaEdit', metadata);
                vm.metadata = _.clone(metadata);
                vm.metadata.rating = vm.metadata.rating || 0;
                vm.metadata.bpm = vm.metadata.bpm || 0;
                let minutes = 0;
                let seconds = 0;
                if (vm.metadata.duration > 0) {
                    minutes = Math.floor(vm.metadata.duration / 60);
                    seconds = Math.floor(vm.metadata.duration - minutes * 60);
                }

                vm.metadata.duration = `${minutes}:${seconds}`;
                $scope.$digest();
            }

        }
    }
})();
