(function() {

    var app = angular.module("NodeAnalysisDirective", ["BroadcastService"]);

    app.directive('nodeAnalysis', ["NodeTemplateService" ,"BroadcastService", function(NodeTemplateService, BroadcastService) {

        return {

            restrict: 'E',
            templateUrl: 'nodeAnalysis.html',
            link: function(scope, element) {

                scope.enquiryTypes = ['Process', 'Userbase', 'Location'];
                scope.enquiryType = scope.enquiryTypes[0];
                scope.depth = 2;
                scope.processes = [];
                scope.locations = [];
                scope.userbases= [];
                
                scope.enquiryObject = '';

                scope.isEnquiryType = function(p) {
                    return p === scope.enquiryType;
                };


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
                       var data = NodeTemplateService.get_model_data();
                       scope.processes = data.processes;
                       scope.locations = data.locations;
                       scope.userbases = data.userbases;
                    }, function() {
                        console.log("Failed to load")
                    });
                };
                


            }

        };
    }]);

})();