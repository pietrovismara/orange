(function() {
    angular.module('orange')
    .directive('track', trackDirective);

    function trackDirective() {
        var ctrl = function($scope, $element, $attrs) {
            var vm = this;

            $scope.$watch('data', init);
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
