(function() {

    var app = angular.module("NodeAnalysisDirective", ["BroadcastService"]);

    app.directive('nodeAnalysis', ["NodeTemplateService" ,"BroadcastService", function(NodeTemplateService, BroadcastService) {

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
                        BroadcastService.broadcast('gp-display-nodes',{value:2});
                    }, function() {
                        console.log('Download failed!');
                    });
                };

                scope.getProcesses = function() {
                    NodeTemplateService.get_prototype_object_list('Process')
                    .success(function(data) {
                        var o = []
                        for (var i = 0; i < data.results[0].data.length; i++) {
                            o.push(data.results[0].data[i].row[0]);
                        }
    
                        return o;
                    }).
                    error(function() {
                        console.log('Error in loading data');
                    });
    
                };
                
                scope.getOrganisations = function() {
                    NodeTemplateService.get_prototype_object_list('Organisation')
                    .success(function(data) {
                        var o = []
                        for (var i = 0; i < data.results[0].data.length; i++) {
                            o.push(data.results[0].data[i].row[0]);
                        }
    
                        return o;
                    }).
                    error(function() {
                        console.log('Error in loading data');
                    });
                };
                
                scope.getLocations = function() {
                    NodeTemplateService.get_prototype_object_list('Location').
                    success(function(data) {
                        var o = []
                        for (var i = 0; i < data.results[0].data.length; i++) {
                            o.push(data.results[0].data[i].row[0]);
                        }
    
                        return o;
                    }).
                    error(function() {
                        console.log('Error in loading data');
                    });
    
                };


            }

        };
    }]);

})();