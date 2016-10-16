(function() {
    angular.module('orange')
    .factory('superFilter', superFilterFactory);

    function superFilterFactory(collection) {
        var filters, filteredCollection;

        return {
            exec: exec,
            groupBy: groupBy,
            searchBy: searchBy,
            reset: reset,
            init: reset,
            getFiltersStatus: getFiltersStatus
        };

        function reset() {
            filters = {
                groupBy: {},
                searchBy: {}
            };
        }

        function getFiltersStatus() {
            return _.mapValues(filters, (filter) => {
                return !!filter.iteratee;
            });
        }

        function groupBy(groupFn) {
            filters.groupBy = {
                iterator: _.groupBy,
                iteratee: groupFn
            };
        }

        function searchBy(searchFn) {
            filters.searchBy = {
                iterator: _.pickBy,
                iteratee: searchFn
            };
        }

        function exec() {
            filteredCollection = collection.getCollection();
            if (filters.searchBy.iteratee) {
                filteredCollection = filters.searchBy.iterator(filteredCollection, filters.searchBy.iteratee);
            }
            if (filters.groupBy.iteratee) {
                filteredCollection = filters.groupBy.iterator(filteredCollection, filters.groupBy.iteratee);
            }
            return filteredCollection;
        }
    }

})();
