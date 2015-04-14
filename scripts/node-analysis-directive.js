(function() {

    var app = angular.module("NodeAnalysisDirective", ["BroadcastService"]);

    app.directive('nodeAnalysis', ["NodeTemplateService" ,"BroadcastService", function(NodeTemplateService, BroadcastService) {

        return {

            restrict: 'E',
            templateUrl: 'nodeAnalysis.html',
            link: function(scope, element) {

                scope.enquiryType = '';
                scope.depth = 2;
                scope.types = {};

                scope.enquiryObject = '';

                scope.evaluate = function() {
                    NodeTemplateService.load_analysis_results_to_template(scope.enquiryType, scope.enquiryObject, scope.depth).
                    then(function(data) {
                        BroadcastService.broadcast('gp-display-nodes',{value:2});
                    }, function() {
                        console.log('Download failed!');
                    });
                };

                scope.load_lists = function() {
                    NodeTemplateService.load_model_data().
                    then(function() {
                       scope.types = NodeTemplateService.get_model_data();
                    }, function() {
                        console.log("Failed to load")
                    });
                };
                


            }

        };
    }]);

})();