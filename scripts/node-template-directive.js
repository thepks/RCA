(function() {

    var app = angular.module("nodeTemplate", ["NodeTemplateService", "MessageLogService"]);

    app.directive('nodeTemplate', ["NodeTemplateService", "MessageLogService", function(NodeTemplateService, MessageLogService) {

        return {

            restrict: 'E',
            templateUrl: 'nodeTemplate.html',
            controller: ["NodeTemplateService", "MessageLogService", function(NodeTemplateService, MessageLogService) {

                this.nodeObjs = [];
                this.newItem = {}; //New Node Type Structure
                this.newRelationship = {}; // New Prototype Join Relationship Structure
                this.newObject = {};
                this.nodePrototype = ''; // Used to get prototype value list
                this.newPrototypeValue = {};
                this.leftNode = ''; // Used to find join prototype, left val
                this.rightNode = ''; // Used to find join prototype, right val
                this.instanceLeftNode = ''; // Used to define instance relationships
                this.instanceRightNode = ''; // Used to define instance relationships
                this.nameAttribute = 'name';
                this.transfer_in_progress = false;

                var tab = 1;

                this.isSection = function(value) {
                    return tab === value;
                };

                this.setSection = function(id) {
                    tab = id;
                };
                
                this.setSection5AndCalc = function() {
                    var gjson = NodeTemplateService.get_graph_json();
                    var ntjson = NodeTemplateService.get_graph_node_types();
                    console.log(JSON.stringify(gjson));
                    var config = {
                        dataSource : gjson,
                        graphHeight: function(){ return 500; },
                        graphWidth: function(){ return 1000; },
                        nodeTypes: ntjson,
                        "nodeStyle": {
                            "Server": {
                                color: "#00ff0e",
                            },
                            "Application":{
                                color: "#aaff0e",
                                borderColor: "#00ffda"
                            },
                            "Process": {
                                color: "#ff7921",
                                borderColor: "#4f07ff"
                            },
                            "Location": {
                                color: '#00aaff',
                                borderColor: '#00aaaa'
                            },
                            "Userbase": {
                                color: '#0000ff',
                                borderColor: '#0000aa'
                            }
                        },
                        forceLocked: false,
                        nodeFilters: true,
                        search: true,
                        showControlDash: true,
                        showFilters: true,
                        scaleExtent: [0.1, 10],
                        zoomControls: true
                    };
                    var alchemy = new Alchemy();
                    alchemy.begin(config);
                    tab = 5;
                };

                this.isTransferInProgress = function() {
                    return this.transfer_in_progress;
                };

                this.new = function() {
                    NodeTemplateService.new_model();
                };


                this.upload = function() {
                    var that = this;
                    this.transfer_in_progress = true;

                    NodeTemplateService.add_template_to_model().
                    then(function() {
                        MessageLogService.add_message('Uploaded to model!');
                        that.transfer_in_progress = false;
                        that.download();
                    }, function() {
                        MessageLogService.add_message('Uploaded to model failed!');
                        that.transfer_in_progress = false;
                    });
                };



                this.download = function() {
                    var that = this;
                    this.transfer_in_progress = true;
                    NodeTemplateService.load_model_to_template().
                    then(function(data) {
                        MessageLogService.add_message('Loaded !');
                        that.transfer_in_progress = false;
                    }, function() {
                        MessageLogService.add_message('Download failed!');
                        that.transfer_in_progress = false;
                    });

                };

                this.nodeTypes = function() {
                    return NodeTemplateService.get_node_types();
                };

                this.nodeTypeList = function() {
                    return NodeTemplateService.get_node_type_list();
                };

                this.deleteNodeType = function(item) {
                    NodeTemplateService.delete_node_type(item);
                };

                this.restoreNodeTypeItem = function(item) {
                    NodeTemplateService.undo_delete_existing_node_type(item);
                };

                this.isNodeTypeDeleted = function(item) {
                    return NodeTemplateService.is_node_flagged_for_deletion(item);
                };


                this.nodeAttributeList = function() {
                    return NodeTemplateService.get_node_type_attributes(this.nodePrototype);
                };

                this.nodeAttributeListByItem = function(itemname) {
                    return NodeTemplateService.get_node_type_attributes(itemname);
                };


                this.addNodeType = function() {
                    NodeTemplateService.add_node_type(this.newItem);
                    this.newItem = {};
                };


                this.relationships = function() {
                    return NodeTemplateService.get_prototype_joins();
                };

                this.addRelationship = function() {
                    NodeTemplateService.add_prototype_join(this.newRelationship);
                    this.newRelationship = {};
                };

                this.getNodeRelationship = function() {
                    return NodeTemplateService.get_prototype_join_value(this.leftNode, this.rightNode);
                };

                this.deleteRelationship = function(item) {
                    NodeTemplateService.delete_prototype_join_value(item);
                };

                this.prototypes = function() {
                    return NodeTemplateService.get_prototype_object_list(this.nodePrototype);
                };

                this.getPrototypeList = function(nodetype) {
                    return NodeTemplateService.get_prototype_object_list(nodetype);
                };

                this.addPrototypeValue = function() {
                    NodeTemplateService.add_prototype_object(this.nodePrototype, this.newPrototypeValue);
                    this.newPrototypeValue = {};
                };

                this.deletePrototypeValue = function(item) {
                    NodeTemplateService.delete_prototype_object(item);
                };

                this.addInstanceRelationship = function() {
                    NodeTemplateService.add_instance_relationship(this.leftNode, this.instanceLeftNode, this.rightNode, this.instanceRightNode);
                };

                this.getInstanceRelationships = function() {
                    return NodeTemplateService.get_instance_relationship_list();
                };

                this.deleteInstanceRelationship = function(item) {
                    NodeTemplateService.delete_instance_relationship(item);
                };

                this.restoreItem = function(item) {
                    NodeTemplateService.undo_delete_item(item);
                };

                this.isItemDeleted = function(item) {
                    return NodeTemplateService.is_item_deleted(item);
                };

                this.clean_attribute_object_for_prototype = function(item) {
                    return NodeTemplateService.clean_attribute_object_for_prototype(item);
                };

            }],
            controllerAs: 'nodeTemplateCtrl'
        };

    }]);

})();