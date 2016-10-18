(function() {
angular.module('orange')
.directive('musicPlayer', musicPlayerDirective);

function musicPlayerDirective(audioPlayer) {
    return {
        restrict: 'E',
        controller: controller,
        controllerAs: 'player',
        templateUrl: 'client/partials/music-player.html'
    };

    function controller($scope) {
        var vm = this;
        vm.playingIndex = 0;
        vm.playlist = [];
        vm.playingTrack = null;
        vm.play = play;
        vm.stop = stop;
        vm.pause = pause;
        vm.prev = prev;
        vm.next = next;
        vm.canPrev = canPrev;
        vm.canNext = canNext;
        vm.volume = audioPlayer.getVolume() || 50;
        vm.setVolume = audioPlayer.setVolume;
        vm.isPlaying = audioPlayer.isPlaying;

        init();

        function init() {
            setListeners();
        }

        $scope.$on('$destroy', function() {
            removeListeners();
        });

        function setListeners() {
            audioPlayer.on('playlist.add', addToPlaylist);
        }

        function removeListeners() {
            audioPlayer.removeListeners('playlist.add', addToPlaylist);
        }

        function play() {
            vm.playingTrack = vm.playlist[vm.playingIndex];
            audioPlayer.play(vm.playingTrack.path);
            audioPlayer.setVolume(vm.volume);
        }

        function stop() {
            audioPlayer.stop();
        }

        function pause() {
            audioPlayer.pause();
        }

        function next() {
            if (canNext()) {
                vm.playingIndex += 1;
                play();
            }
        }

        function prev() {
            if (canPrev()) {
                vm.playingIndex -= 1;
                play();
            }
        }

        function canNext() {
            return !!vm.playlist[vm.playingIndex + 1];
        }

        function canPrev() {
            return (vm.playingIndex - 1) >= 0 && vm.playlist[vm.playingIndex - 1];
        }

        function addToPlaylist(track) {
            vm.playlist.push(track);
            if (!vm.playingTrack) {
                vm.playingTrack = vm.playlist[vm.playingIndex];
            }
        }
    }

}

})();
