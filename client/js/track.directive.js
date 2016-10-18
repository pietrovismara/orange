(function() {
    angular.module('orange')
    .directive('track', trackDirective)
    .directive('playerTrack', playerTrackDirective);

    function sharedController($scope, $element, $attrs) {
        var vm = this;

        $scope.$watch('data', init);
        init();
        function init() {
            vm.track = $scope.data;
        }
    };

    function playerTrackDirective() {
        return {
            restrict: 'E',
            scope: {
                data: '='
            },
            controller: sharedController,
            controllerAs: 'vm',
            templateUrl: 'client/partials/player-track.html'
        };
    }

    function trackDirective() {
        return {
            restrict: 'E',
            scope: {
                data: '='
            },
            controller: sharedController,
            controllerAs: 'vm',
            templateUrl: 'client/partials/track.html'
        };
    }
})();
