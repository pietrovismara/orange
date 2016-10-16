(function() {
    angular.module('orange')
    .factory('audioPlayer', audioPlayer);
    var player;

    function audioPlayer() {
        var factory = {
            play: play,
            stop: stop,
            pause: pause,
            addToPlaylist: addToPlaylist,
            isPlaying: isPlaying
        };
        var emitter = new EventEmitter();
        _.assignIn(factory, emitter);
        return factory;

        function addToPlaylist(track) {
            emitter.emit('playlist.add', track);
        }

        function play(path) {
            stop();
            player = AV.Player.fromURL(`http://127.0.0.1:9000/?path=${path}`);
            player.play();
        }

        function stop() {
            if (isPlaying()) {
                player.stop();
            }
        }

        function pause() {
            if (isPlaying()) {
                player.pause();
            }
        }

        function isPlaying() {
            return player ? player.playing : false;
        }
    }
})();
