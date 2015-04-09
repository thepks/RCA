(function() {

    var app = angular.module("nodeTemplate", ["NodeTemplateService","MessageLogService"]);

    app.directive('nodeTemplate', [ "NodeTemplateService", "MessageLogService", function(NodeTemplateService, MessageLogService) {

        return {

            restrict: 'E',
            templateUrl: 'nodeTemplate.html',
            controller: ["NodeTemplateService", "MessageLogService",function(NodeTemplateService, MessageLogService) {

                this.nodeObjs = [];
                this.newItem = {};              //New Node Type Structure
                this.newRelationship = {};      // New Prototype Join Relationship Structure
                this.newObject = {};
                this.nodePrototype = '';        // Used to get prototype value list
                this.newPrototypeValue = {};
                this.leftNode = '';             // Used to find join prototype, left val
                this.rightNode = '';            // Used to find join prototype, right val
                this.instanceLeftNode = '';
                this.instanceRightNode = '';
                this.nameAttribute = 'name';
                this.transfer_in_progress = false;

                var tab = 1;

                this.isSection = function(value) {
                    return tab === value;
                };

                this.setSection = function(id) {
                    tab = id;
                };
                
                this.isTransferInProgress = function() {
                    return this.transfer_in_progress;
                }

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
                        },function() {
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
                        },function() {
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
                
                this.deleteRelationship =function(item) {
                    NodeTemplateService.delete_prototype_join_value(item);
                };
                
                this.prototypes = function() {
                    return NodeTemplateService.get_prototype_object_list(this.nodePrototype);
                };
                
                this.getPrototypeList = function(nodetype){
                    return NodeTemplateService.get_prototype_object_list(nodetype);
                };
                
                this.addPrototypeValue = function() {
                    NodeTemplateService.add_prototype_object(this.nodePrototype, this.newPrototypeValue);
                    this.newPrototypeValue = {};
                };

                this.deletePrototypeValue = function(item) {
                    NodeTemplateService.delete_prototype_object(item);
                };


// GOT THIS FAR  //


                this.addInstanceRelationship = function() {
                    var join;
                    var toAdd = {};
                    
                    for (var i=0; i<this.joins.length; i++) {
                        if (this.joins[i].leftNode === this.leftNode && this.joins[i].rightNode === this.rightNode) {
                            join =  this.joins[i].join;
                        }
                    }    
                    toAdd.leftObj = this.instanceLeftNode;
                    toAdd.leftNodeType = this.leftNode;
                    toAdd.rightObj = this.instanceRightNode;
                    toAdd.rightNodeType = this.rightNode;
                    toAdd.join = join;
                    toAdd.changes = {};
                    toAdd.changes.mod = 'add';
                    
                    this.instanceRelationships.push(toAdd);
                };
                
                this.getInstanceRelationships = function () {
                    return this.instanceRelationships;  
                };
                
                this.deleteInstanceRelationship = function(item) {
                     item.changes = {};
                     item.changes.mod = 'delete';
                };
                
                this.restoreItem = function(item) {
                    delete (item.changes);
                };
                
                this.isItemDeleted = function(item) {
                    if ('changes' in item) {
                    return item.changes.mod === 'delete';
                    } else {
                        return false;
                    }
                };
                
                this.deleteRelationship =function(item) {
                    
                };

                this.nodeObjects = function() {
                    return this.nodeObjs;
                };
                

/*                this.addNodeObj = function() {
                    if (this.newObject.name) {
                        for (var i = 0; i < this.nodes.length; i++) {
                            if (this.newObject.name === this.nodes[i].name) {
                                this.nodeObjs.push(this.newObject);
                                this.newObject = {};
                                break;
                            }
                        }

                    }
                };*/

            }],
            controllerAs: 'nodeTemplateCtrl'
        };

    }]);

})();