(function() {
    var app = angular.module('rcaAnalyser', ["MessageLogService", "messageLog", "nodeTemplate", "capitalizeFirst","NodeAnalysisDirective","BroadcastService","nodeVisualisation"]);

    var option = 0;
    var logged_on = false;
    var logon_error = 0;
    var logon_error_message;
    var username;
    var password;


    app.controller('rcaController', ["MessageLogService", "NodeTemplateService", "BroadcastService",function(MessageLogService, NodeTemplateService, BroadcastService) {
        
        this.username = '';
        this.password = '';
        this.admin = false;
        this.option = 1;

        this.setOption = function(value) {
            this.option = value;
        };

        this.isOption = function(value) {
            return this.option === value;
        };

        this.isErrorLogon = function() {
            return logon_error === 1;
        };
        
        this.isAdmin = function() {
          return this.admin;  
        };

        this.logon = function() {
            console.log(this.username);
            var that = this;

            NodeTemplateService.authorize(this.username, this.password).
            success(function(data) {
                that.option = 1;
                that.logged_on = true;
                if (data.roles.indexOf('admin') >= 0) {
                    that.admin = true;
                }
                MessageLogService.add_message("Logon Complete");
            }).
            error(function(data, status) {
                MessageLogService.add_message("Logon Failed! " + status);
            });

            
        };


        this.logoff = function() {
            console.log('In event logoff');
            this.logged_on = false;
            this.admin = false;
            this.option = 1;
            NodeTemplateService.logoff();

                MessageLogService.clear_messages();

        };

        this.isLoggedOn = function() {
            return this.logged_on;
        };

        this.visualise_overview = function() {
            this.option = 5;
            var that = this;
            NodeTemplateService.load_full_model_to_template().
            then(function(data) {
                BroadcastService.broadcast('gp-display-nodes',{value:1});
            }, function() {
                MessageLogService.add_message('Download failed!');
            });

        };

    }]);



})();