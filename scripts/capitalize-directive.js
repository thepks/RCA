(function() {


var app = angular.module('capitalizeFirst', []);

app.filter('capitalizeFirst', function () {
    return function (input, scope) {
        var text = input.substring(0, 1).toUpperCase() + input.substring(1).toLowerCase();
        return text;
    }
});

app.directive('capitalizeFirst', ['$filter', function ($filter) {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, controller) {
            controller.$parsers.push(function (value) {
                var transformedInput = $filter('capitalizeFirst')(value);
                if (transformedInput !== value) {
                    var el = element[0];
                    el.setSelectionRange(el.selectionStart, el.selectionEnd);
                    controller.$setViewValue(transformedInput);
                    controller.$render();
                }
                return transformedInput;
            });
        }
    };
}]);


})();