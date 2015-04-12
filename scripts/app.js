(function() {
    var app = angular.module('rcaAnalyser', ["MessageLogService", "messageLog", "nodeTemplate", "capitalizeFirst"]);

    var option = 0;
    var logged_on = false;
    var logon_error = 0;
    var logon_error_message;
    var username;
    var password;


    app.controller('rcaController', ["MessageLogService", "NodeTemplateService", function(MessageLogService, NodeTemplateService) {
        
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
            NodeTemplateService.load_model_to_template().
            then(function(data) {
                MessageLogService.add_message('Loaded !');
                
                var gjson = NodeTemplateService.get_graph_json();
                var ntjson = NodeTemplateService.get_graph_node_types();

                var width = 1200, height = 800;
                var color = d3.scale.category10();
                
                
                var svgold = d3.select("#overview>svg").remove();
                // setup svg div
                var svg = d3.select("#overview").append("svg")
                        .attr("width", width).attr("height", height)
                        .attr("pointer-events", "all");

                // force layout setup
                var force = d3.layout.force()
                        .charge(-200).linkDistance(125).size([width, height]);


                force.nodes(gjson.nodes);
                force.links(gjson.edges);
                force.start();
            
                // render relationships as lines
                var link = svg.selectAll(".link")
                        .data(gjson.edges).enter()
                        .append("line").attr("class", function(d) { return "link " + d.caption})
                        .style("stroke-width",6)
                        .on("mouseover", function(){d3.select(this).style("stroke", "#999999").attr("stroke-opacity", "1.0");})
                        .on("mouseout", function(){d3.select(this).style("stroke", function(d) { if(d.color !== null) { return d.color;}; })
                        .attr("stroke-opacity", 0.5)} );
            
                // render nodes as circles, css-class from label
                var node = svg.selectAll(".node")
                        .data(gjson.nodes).enter()
                        .append("g")
                        .append("circle")
                        .attr("class", function (d) { return "node node-type-"+d.type_id })
                        .style("fill", function(d) { return color(d.type_id); })
                        .attr("r", 25)
                        .call(force.drag);
                        
                link.append("title").text(function (d) { return d.caption;});
                
                node.append("text")
                .attr("dx",12)
                .attr("dy",".35em")
                .attr("text-anchor", "middle") 
                .attr("class","shadow")
                .text(function(d) {return d.caption;});
            
                node.append("text")
                .attr("dx",12)
                .attr("dy",".35em")
                .attr("text-anchor", "middle") 
                .attr("fill","black")
                .text(function(d) {return d.caption;});
            
            
                // html title attribute for title node-attribute
                node.append("title")
                        .text(function (d) { return d.caption+'('+d.type + ')'; });
            
                // force feed algo ticks for coordinate computation
                force.on("tick", function() {
                    link.attr("x1", function(d) { return d.source.x; })
                            .attr("y1", function(d) { return d.source.y; })
                            .attr("x2", function(d) { return d.target.x; })
                            .attr("y2", function(d) { return d.target.y; });
            
                    node.attr("cx", function(d) { return d.x; })
                            .attr("cy", function(d) { return d.y; })
                            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
                });


                
            }, function() {
                MessageLogService.add_message('Download failed!');
            });

        };

    }]);



})();