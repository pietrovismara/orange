(function() {
    angular.module('orange')
    .directive('track', trackDirective);

    function trackDirective() {
        var ctrl = function($scope, $element, $attrs) {
            var vm = this;

            $scope.$watch('data', init);

            function init() {
                vm.track = $scope.data;
                console.log(vm.track);
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
