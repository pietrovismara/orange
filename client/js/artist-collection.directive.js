(function() {
    angular.module('orange')
    .directive('artistCollection', artistCollectionDirective);

    function artistCollectionDirective(audioPlayer, collection) {
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
                audioPlayer.addToPlaylist(track);
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
