(function() {

    var app = angular.module("nodeTemplate", ["NodeTemplateService", "MessageLogService"]);

    app.directive('nodeVisualisation', ["NodeTemplateService", "MessageLogService", function(NodeTemplateService, MessageLogService) {

        return {

            restrict: 'E',
            template: '<div id="gpOverview" class="model-overview"></div>',
            link: function(scope, element) {

                scope.$on('gp-display-nodes', function() {


                    var gjson = NodeTemplateService.get_graph_json();
                    var ntjson = NodeTemplateService.get_graph_node_types();

                    var width = 1200,
                        height = 800;
                    var color = d3.scale.category10();


                    element.children().children().remove();

                    // setup svg div
                    var svg = d3.select(element).append("svg")
                        .attr("width", width).attr("height", height)
                        .attr("pointer-events", "all");

                    // force layout setup
                    var force = d3.layout.force()
                        .charge(-350).linkDistance(125).size([width, height]);

                    force.gravity(0.025);

                    force.nodes(gjson.nodes);
                    force.links(gjson.edges);
                    force.start();

                    // render relationships as lines
                    var link = svg.selectAll(".link")
                        .data(gjson.edges).enter()
                        .append("line").attr("class", function(d) {
                        return "link " + d.caption
                    })
                        .style("stroke-width", 6)
                        .on("mouseover", function() {
                        d3.select(this).style("stroke", "#999999").attr("stroke-opacity", "1.0");
                    })
                        .on("mouseout", function() {
                        d3.select(this).style("stroke", function(d) {
                            if (d.color !== null) {
                                return d.color;
                            };
                        })
                            .attr("stroke-opacity", 0.5)
                    });

                    // render nodes as circles, css-class from label
                    var node = svg.selectAll(".node")
                        .data(gjson.nodes).enter()
                        .append("g")
                        .attr("class", function(d) {
                        return "node node-type-" + d.type_id
                    });

                    node.append("circle")
                        .style("fill", function(d) {
                        return color(d.type_id);
                    })
                        .attr("r", 20);
                    //                        .call(force.drag);

                    link.append("title").text(function(d) {
                        return d.caption;
                    });

                    node.append("text")
                        .attr("x", 3.5)
                        .attr("y", 3.5)
                        .attr("class", "shadow")
                        .text(function(d) {
                        return d.caption;
                    });

                    node.append("text")
                        .attr("x", 3.5)
                        .attr("y", 3.5)
                        .attr("fill", "black")
                        .text(function(d) {
                        return d.caption;
                    });


                    // html title attribute for title node-attribute
                    node.append("title")
                        .text(function(d) {
                        return d.caption + ' (' + d.type + ')';
                    });

                    node.call(force.drag);

                    // force feed algo ticks for coordinate computation
                    force.on("tick", function() {
                        link.attr("x1", function(d) {
                            return d.source.x;
                        })
                            .attr("y1", function(d) {
                            return d.source.y;
                        })
                            .attr("x2", function(d) {
                            return d.target.x;
                        })
                            .attr("y2", function(d) {
                            return d.target.y;
                        });

                        // node.attr("cx", function(d) { return d.x; })
                        //         .attr("cy", function(d) { return d.y; })
                        node.attr("transform", function(d) {
                            return "translate(" + [d.x, d.y] + ")";
                        });
                    });
                });
            }
        };
    }]);
})();