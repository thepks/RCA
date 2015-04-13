(function() {

    var app = angular.module("NodeAnalysisDirective", []);

    app.directive('nodeAnalysis', ["NodeTemplateService" , function(NodeTemplateService) {

        return {

            restrict: 'E',
            templateUrl: 'nodeAnalysis.html',
            link: function(scope, element) {

                scope.enquiryTypes = ['Process', 'Organisation', 'Location'];
                scope.enquiryType = scope.enquiryTypes[0];
                scope.depth = 2;
                
                scope.enquiryObject = '';

                scope.isEnquiryType = function(p) {
                    return p === scope.enquiryType;
                };


                scope.evaluate = function() {
                    NodeTemplateService.load_analysis_results_to_template(scope.enquiryType, scope.enquiryObject, scope.depth).
                    then(function(data) {
                        $broadcast('gp-display-nodes');
                    }, function() {
                        console.log('Download failed!');
                    });
                };

                scope.getProcesses = function() {
                    return NodeTemplateService.get_prototype_object_list('Process');
                };
                
                scope.getOrganisations = function() {
                    return NodeTemplateService.get_prototype_object_list('Organisation');
                };
                
                scope.getLocations = function() {
                    return NodeTemplateService.get_prototype_object_list('Location');
                };


            }

        };
    }]);

})();