(function() {

    var app = angular.module("nodeTemplate", ["NodeTemplateService","MessageLogService"]);

    app.directive('nodeTemplate', [ "NodeTemplateService", "MessageLogService", function(NodeTemplateService, MessageLogService) {

        return {

            restrict: 'E',
            templateUrl: 'nodeTemplate.html',
            controller: ["NodeTemplateService", "MessageLogService",function(NodeTemplateService, MessageLogService) {

                this.isnew = false;
                this.nodes = {};
                this.joins = [];
                this.nodeObjs = [];
                this.newItem = {};
                this.newRelationship = {};
                this.newObject = {};
                this.nodePrototype = '';
                this.prototypeValue = {};
                this.newPrototypeValue = {};
                this.leftNode = '';
                this.rightNode = '';
                this.instanceRelationships = [];
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
                    this.isnew = true;
                    
                    this.nodes = {};
                    this.joins = [];
                    this.prototypeValue = {};
                    this.instanceRelationships = [];
                };

                this.isNew = function() {
                    return this.isnew;
                };

                this.upload = function() {
                    var model = {};
                    var that = this;
                    model.nodes = this.nodes;
                    model.joins = this.joins;
                    model.prototypeValue = this.prototypeValue;
                    model.instanceRelationships = this.instanceRelationships;
                    this.transfer_in_progress = true;
                    
                    NodeTemplateService.add_template_to_model(model).
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
                        that.nodes = data.nodes;
                        that.joins = data.joins;
                        that.instanceRelationships = data.instanceRelationships;
                        that.prototypeValue = data.prototypeValue;
                            MessageLogService.add_message('Loaded !');
                            that.transfer_in_progress = false;
                        },function() {
                            MessageLogService.add_message('Download failed!');
                            that.transfer_in_progress = false;
                        });                    

                };

                this.nodeTypes = function() {
                    return this.nodes;
                };

                this.nodeTypeList = function() {
                    return Object.keys(this.nodes);
                };
                
                this.deleteNodeType = function(item) {
                    var changes = {};
                    var found = false;
                    var node = this.nodes[item];
                    
                    for (var i=0; i<node.length; i++) {
                        if (node[i].constructor === Object) {
                            changes = node[i];
                            changes.mod = 'delete';
                            found = true;
                            break;
                        }
                    }
                    
                    if (!found) {
                        changes.mod = 'delete';
                        node.push(changes);
                    }

                };
                                
                this.restoreNodeTypeItem = function(item) {
                    
                    var changes = {};
                    var found = false;
                    var node = this.nodes[item];
                    
                    for (var i=0; i<node.length; i++) {
                        if (node[i].constructor === Object) {
                            changes = node[i];
                            if('mod' in changes && changes.mod === 'delete') {
                                delete(node[i]);
                                break;
                            }
                        }
                    }

                };
                
                this.isNodeTypeDeleted = function(item) {
                    var changes = {};
                    var found = false;
                    var node = this.nodes[item];
                    
                    for (var i=0; i<node.length; i++) {
                        if (node[i].constructor === Object) {
                            changes = node[i];
                            if('mod' in changes && changes.mod === 'delete') {
                                return true;
                            }
                        }
                    }
                    
                    return false;
                };

                
                this.nodeAttributeList = function() {
                    return (this.nodes[this.nodePrototype]); //[0].split(' ');
                };
                
                this.addNodeType = function() {
                    var attrlist = [];
                    var changes = {};
                    changes.mod='add';
                    if (this.newItem.name) {
                        this.nodes[this.newItem.name] = [];
                        this.nodes[this.newItem.name].push(this.nameAttribute);
                        try {
                            attrlist = this.newItem.attributeList.split(' ');
                            for (var i=0; i<attrlist.length;i++) {
                                this.nodes[this.newItem.name].push(attrlist[i]);
                            }
                            this.nodes[this.newItem.name].push(changes);
                        } catch (exception) {}
                        this.prototypeValue[this.newItem.name] = [];
                    }
                    this.newItem = {};
                };

                this.relationships = function() {
                    return this.joins;
                };

                this.addRelationship = function() {
                    var changes = {};
                    changes.mod='add';

                    if ('leftNode' in this.newRelationship && 'rightNode' in this.newRelationship) {
                        this.newRelationship.changes = {};
                        this.newRelationship.changes.mod = 'add';
                        this.joins.push(this.newRelationship);
                        
                        
                        this.newRelationship = {};
                    }
                };

                this.getNodeRelationship = function() {
                    for (var i=0; i<this.joins.length; i++) {
                        if (this.joins[i].leftNode === this.leftNode && this.joins[i].rightNode === this.rightNode) {
                            return this.joins[i].join;
                        }
                    }
                };
                
                this.deleteRelationship =function(item) {
                    item.changes = {};
                    item.changes.mod = 'delete';
                };
                
                
                this.deletePrototypeValue = function(item) {
                    item.changes = {};
                    item.changes.mod = 'delete';
                };

                
                this.prototypes = function() {
                    return (this.prototypeValue[this.nodePrototype]);
                };
                
                this.getPrototypeList = function(nodetype){
                    return (this.prototypeValue[nodetype]);
                };
                
                this.addPrototypeValue = function() {
                    var obj = {};
                    var keyvals = Object.keys(this.newPrototypeValue);
                    
                    for (var i=0; i<keyvals.length; i++) {
                        obj[keyvals[i]] = this.newPrototypeValue[keyvals[i]];
                    }
                    obj.changes = {}
                    obj.changes.mod = 'add';
                    this.prototypeValue[this.nodePrototype].push(obj);    
                    this.newPrototypeValue = {};
                };



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
                    toadd.changes = {};
                    toadd.changes.mod = 'add';
                    
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