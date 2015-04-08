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

                var tab = 1;

                this.isSection = function(value) {
                    return tab === value;
                };

                this.setSection = function(id) {
                    tab = id;
                };

                this.new = function() {
                    this.isnew = true;
                    
                    this.nodes = {};
                    this.joins = [];
                    this.prototypeValue = {};
                };

                this.isNew = function() {
                    return this.isnew;
                };

                this.upload = function() {
                    var model = {};
                    model.nodes = this.nodes;
                    model.relationships = this.joins;
                    model.prototypeValue = this.prototypeValue;
                    model.instanceRelationships = this.instanceRelationships;
                    
                    NodeTemplateService.add_template_to_model(model);
                };
                


                this.download = function() {
                    var that = this;
                    NodeTemplateService.load_model_to_template().
                        then(function(data, status, headers) {
                        that.nodes = data.nodes;
                        that.joins = data.joins;
                        that.instanceRelationships = data.instanceRelationships;
                        that.prototypeValue = data.prototypeValue;
                            MessageLogService.add_message('Loaded !');
                        },function(data, status) {
                            MessageLogService.add_message('Download failed!' + status);
                        });                    

                };


                this.delete = function() {
                    // delete is actually more processing, it needs to find all of the connected nodes and delete these  
                };

                this.nodeTypes = function() {
                    return this.nodes;
                };

                this.nodeTypeList = function() {
                    return Object.keys(this.nodes);
                };
                
                this.nodeAttributeList = function() {
                    return (this.nodes[this.nodePrototype]); //[0].split(' ');
                };
                
                this.add = function() {
                    var attrlist = [];
                    if (this.newItem.name) {
                        this.nodes[this.newItem.name] = [];
                        this.nodes[this.newItem.name].push(this.nameAttribute);
                        try {
                            attrlist = this.newItem.attributeList.split(' ');
                            for (var i=0; i<attrlist.length;i++) {
                                this.nodes[this.newItem.name].push(attrlist[i]);
                            }
                        } catch (exception) {}
                        this.prototypeValue[this.newItem.name] = [];
                    }
                    this.newItem = {};
                };

                this.relationships = function() {
                    return this.joins;
                };

                this.addRelationship = function() {
                    if ('leftNode' in this.newRelationship && 'rightNode' in this.newRelationship) {
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
                    this.prototypeValue[this.nodePrototype].push(obj);    
                    this.newPrototypeValue = {};
                };

                this.deletePrototypeValue = function(item) {

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
                    
                    this.instanceRelationships.push(toAdd);
                };
                
                this.getInstanceRelationships = function () {
                    return this.instanceRelationships;  
                };

                this.nodeObjects = function() {
                    return this.nodeObjs;
                };
                

                this.addNodeObj = function() {
                    if (this.newObject.name) {
                        for (var i = 0; i < this.nodes.length; i++) {
                            if (this.newObject.name === this.nodes[i].name) {
                                this.nodeObjs.push(this.newObject);
                                this.newObject = {};
                                break;
                            }
                        }

                    }
                };

            }],
            controllerAs: 'nodeTemplateCtrl'
        };

    }]);

})();