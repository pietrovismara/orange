(function() {
    angular.module('scannerApp')
    .directive('track', trackDirective);

    function trackDirective() {
        var ctrl = function($scope, $element, $attrs) {
            var vm = this;

            init();
            function init() {
                vm.track = $scope.data;
            }
        };

        return {
            restrict: 'E',
            scope: {
                data: '='
            },
            controller: ctrl,
            controllerAs: 'vm',
            templateUrl: 'client/partials/track.html'
        };
    }
})();
