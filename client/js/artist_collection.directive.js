(function() {
    angular.module('scannerApp')
    .directive('artistCollection', artistCollectionDirective);

    function artistCollectionDirective(collection) {
        var ctrl = function($scope, $element, $attrs) {
            var vm = this;
            vm.showTracks = false;
            vm.toggleTracks = toggleTracks;
            vm.editTrack = editTrack;

            init();

            $scope.$watch('tracks', init);

            function init() {
                vm.artist = $scope.artist;
                vm.tracks = $scope.tracks;
            }

            function toggleTracks() {
                vm.showTracks = !vm.showTracks;
            }

            function editTrack(track) {
                collection.edit(track.id);
            }
        };

        return {
            restrict: 'E',
            scope: {
                artist: '=',
                tracks: '='
            },
            controller: ctrl,
            controllerAs: 'vm',
            templateUrl: 'client/partials/artist-collection.html'
        };
    }
})();
