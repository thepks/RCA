(function() {

    var app = angular.module('NodeTemplateService', []);

    var username;
    var password;
    var model = {};

    var array_prune = function(a) {
        
        var tmp = [];
        tmp = a.filter(function(f) {
           if (f) {
               return true;
           } else {
               return false;
           }
        });
        return tmp;

    };

    app.factory("NodeTemplateService", ["$q", "$http", function($q, $http) {



        return {

            authorize: function(user, pass) {

                var userobj = {};
                userobj.user = {};
                userobj.user.username = user;
                userobj.user.password = pass;

                username = user;
                password = pass;
                
                model = {};
                model.nodes = {};
                model.instanceRelationships = [];
                model.prototypeValue = {};
                model.joins = [];
                
                return $http.post("/action/logon", userobj);

            },

            logoff: function() {

                return $http.post("/action/logoff");
            },
            
            new_model: function() {
                model = {};
                model.nodes = {};
                model.instanceRelationships = [];
                model.prototypeValue = {};
                model.joins = [];
            },

            get_node_types: function() {
                return model.nodes;
            },
            
            get_node_type_list: function() {
                return Object.keys(model.nodes);
            },
            
            delete_node_type: function(name) {
                var deltaRecord = {};
                var found = false;
                var node = model.nodes[name];

                for (var i=0; i<node.length; i++) {
                    if (node[i] && node[i].constructor === Object) {
                        deltaRecord = node[i];
                        if ('model' in deltaRecord && deltaRecord.model === 'existing') {
                            deltaRecord.mod = 'delete';
                            found = true;
                            break;
                        }
                    }
                }
                if(!found) {
                    delete(model.nodes[name]);
                }
            },
            
            undo_delete_existing_node_type: function(name) {

                var deltaRecord = {};
                var node = model.nodes[name];

                for (var i=0; i<node.length; i++) {
                    if (node[i] && node[i].constructor === Object) {
                        deltaRecord = node[i];
                        if ('model' in deltaRecord && deltaRecord.model === 'existing' && 'mod' in deltaRecord && deltaRecord.mod === 'delete') {
                            delete (deltaRecord.mod);
                            break;
                        }
                    }
                }

            },
            
            is_node_flagged_for_deletion: function(name) {

                var deltaRecord = {};
                var node = model.nodes[name];
                
                for (var i=0; i<node.length; i++) {
                    if (node[i] && node[i].constructor === Object) {
                        deltaRecord = node[i];
                        if ('model' in deltaRecord && deltaRecord.model === 'existing' && 'mod' in deltaRecord && deltaRecord.mod === 'delete') {
                            return true;
                        }
                    }
                }
                
                return false;
            },
            
            get_node_type_attributes: function(name) {
                
                var node = model.nodes[name];
                var togo = [];
                if (node) {
                    togo = node.filter(function(item) {
                        return item.constructor !== Object;
                    });
                }
                
                return togo;

            },
            
            add_node_type: function(obj) {

            var attr_provided = [];

            var deltaRecord = {};
            deltaRecord.mod='add';
            
            if(obj.name) {
                model.nodes[obj.name] = [];
                model.nodes[obj.name].push(deltaRecord);
                model.nodes[obj.name].push('name');
                
                try {
                    attr_provided = obj.attributeList.split(' ');
                    for (var i=0; i<attr_provided.length;i++) {
                        model.nodes[obj.name].push(attr_provided[i]);
                    }
                } catch (e) {}
            
                model.prototypeValue[obj.name] = [];

                }                
            },
            
            get_prototype_joins: function() {
                return model.joins;
            },
            
            add_prototype_join: function(obj) {

                if ('leftNode' in obj && 'rightNode' in obj) {
                    obj.deltaRecord = {};
                    obj.deltaRecord.mod = 'add';
                    model.joins.push(obj);
                }
            },
            
            get_prototype_join_value: function(leftObj, rightObj) {
                for (var i=0; i<model.joins.length; i++) {
                    if (model.joins[i].leftNode === leftObj && model.joins[i].rightNode === rightObj) {
                        return model.joins[i].join;
                    }
                }
            },
            
            delete_prototype_join_value: function(obj) {
                if(obj && 'deltaRecord' in obj && 'model' in obj.deltaRecord  && obj.deltaRecord.model === 'existing') {
                    obj.deltaRecord.mod = 'delete';
                    return;
                }
                
                for(var i=0; i<model.joins.length; i++) {
                    if(model.joins[i] && model.joins[i].leftNode === obj.leftNode && model.joins[i].rightNode === obj.rightNode) {
                        delete(model.joins[i]);
                    }
                }
                
                model.joins = array_prune(model.joins);
            },
            
            get_prototype_object_list: function(nodetype) {
              return model.prototypeValue[nodetype];  
            },

            add_prototype_object: function(nodetype, obj) {
                var toadd = {};
                var keyvals = Object.keys(obj);
    
                for (var i=0; i<keyvals.length; i++) {
                    toadd[keyvals[i]] = obj[keyvals[i]];
                }
                
                toadd.deltaRecord = {};
                toadd.deltaRecord.mod = 'add';
    
                model.prototypeValue[nodetype].push(toadd);    
            },
            
            delete_prototype_object: function(obj) {
                var keys = Object.keys(model.prototypeValue);
                var obj2 = {};
                var tmp = [];
                
                if(obj && 'deltaRecord' in obj) {
                    obj.deltaRecord.mod = 'delete';
                }
                
                for(var i=0; i<keys.length;i++) {
                    for (var j=0; j< model.prototypeValue[keys[i]].length; j++) {
                        obj2 = model.prototypeValue[keys[i]][j];
                        if(obj2 && 'deltaRecord' in obj2 && 'mod' in obj2.deltaRecord && obj2.deltaRecord.mod === 'delete' && !('model' in obj2.deltaRecord)) {
                            delete (model.prototypeValue[keys[i]][j]);
                        }
                    }
                    
                    model.prototypeValue[keys[i]] = array_prune(model.prototypeValue[keys[i]]);

                }
            },

            add_instance_relationship: function(leftNode, leftObj, rightNode, rightObj) {
                var join;
                var toAdd = {};
                
                for (var i=0; i<model.joins.length; i++) {
                    if (model.joins[i].leftNode === leftNode && model.joins[i].rightNode === rightNode) {
                        join =  model.joins[i].join;
                    }
                }    
                
                toAdd.leftObj = leftObj;
                toAdd.leftNodeType = leftNode;
                toAdd.rightObj = rightObj;
                toAdd.rightNodeType = rightNode;
                toAdd.join = join;
                
                toAdd.deltaRecord = {};
                toAdd.deltaRecord.mod = 'add';

                model.instanceRelationships.push(toAdd);

            },          
            
            get_instance_relationship_list: function() {
                return model.instanceRelationships;
            },
            
            delete_instance_relationship: function(obj) {
                var obj2;

                if(obj && 'deltaRecord' in obj) {
                    obj.deltaRecord.mod = 'delete';
                }
                
                for(var i=0; i<model.instanceRelationships.length;i++) {
                    obj2 = model.instanceRelationships[i];
                    if(obj2 && 'deltaRecord' in obj2 && 'mod' in obj2.deltaRecord && obj2.deltaRecord.mod === 'delete' && !('model' in obj2.deltaRecord)) {
                        delete (model.instanceRelationships[i]);
                    }
                }
                
                model.instanceRelationships = array_prune(model.instanceRelationships);
                
            },
            
            undo_delete_item: function(obj) {
                if(obj && 'deltaRecord' in obj && 'mod' in obj.deltaRecord  && obj.deltaRecord.mod === 'delete') {
                    delete(obj.deltaRecord);
                }
            },
            
            is_item_deleted: function(obj) {
                return (obj && 'deltaRecord' in obj && 'mod' in obj.deltaRecord  && obj.deltaRecord.mod === 'delete');
            },

            load_model_to_template: function() {

                var deferred = $q.defer();
                var url = '/db/data/transaction/commit';

                var cmd = "{ \"statements\": [ \
                    { \"statement\": \"match(n) return distinct labels(n);\"}, \
                    { \"statement\": \"MATCH (a)-[r]->(b) WHERE labels(a) <> [] AND labels(b) <> [] RETURN DISTINCT head(labels(a)) AS This, type(r) as To, head(labels(b)) AS That;\"}, \
                    { \"statement\": \"match (n)-[r]-(m) where labels(n) <> \\\"User\\\" return distinct labels(n),n,type(r),labels(m),m;\"} \
                    ] \
                }";

                var req = {
                    method: 'POST',
                    url: url,
                    data: cmd,
                };

                $http(req).
                success(function(data) {

                    model = {};
                    model.nodes = {};
                    model.instanceRelationships = [];
                    model.prototypeValue = {};
                    model.joins = [];
                    var deltaRecord = {};
                    deltaRecord.model = 'existing';

                    // results is the structure containing the response
                    // results[0] is the node object;

                    for (var i = 0; i < data.results[0].data.length; i++) {
                        model.nodes[data.results[0].data[i].row[0][0]] = [];
                        model.nodes[data.results[0].data[i].row[0][0]].push(deltaRecord);
                        model.nodes[data.results[0].data[i].row[0][0]].push(name);
                    }

                    // results [1] are the fundamental relationships, but [2] also describes

                    for (i = 0; i < data.results[1].data.length; i++) {
                        var newRelationship = {};
                        newRelationship.leftNode = data.results[1].data[i].row[0];
                        newRelationship.join = data.results[1].data[i].row[1];
                        newRelationship.rightNode = data.results[1].data[i].row[2];
                        newRelationship.deltaRecord = {};
                        newRelationship.deltaRecord.model = 'existing';
                        model.joins.push(newRelationship);
                    }

                    // results [3] gives prototypes and relationships
                    // First populate out the node descriptions
                    for (i = 0; i < data.results[2].data.length; i++) {
                        var node1 = data.results[2].data[i].row[0][0];
                        var properties1 = data.results[2].data[i].row[1];
                        var currProps = model.nodes[node1];
                        var keyvals = Object.keys(properties1);
                        for (var j = 0; j < keyvals.length; j++) {
                            if (currProps.indexOf(keyvals[j]) < 0) {
                                model.nodes[node1].push(keyvals[j]);
                            }
                        }

                        var node2 = data.results[2].data[i].row[3][0];
                        var properties2 = data.results[2].data[i].row[4];
                        currProps = model.nodes[node2];
                        keyvals = Object.keys(properties2);
                        for (j = 0; j < keyvals.length; j++) {
                            if (currProps.indexOf(keyvals[j]) < 0) {
                                model.nodes[node2].push(keyvals[j]);
                            }
                        }
                    }

                    // Now populate out the instances

                    for (i = 0; i < data.results[2].data.length; i++) {

                        // The type is the hash, key 0 and key 3
                        // The properties are in key 1 and key 4

                        var leftNode = data.results[2].data[i].row[0][0];
                        var rightNode = data.results[2].data[i].row[3][0];
                        var join = data.results[2].data[i].row[2];
                        var toAdd = {};
                        var leftObj = data.results[2].data[i].row[1];
                        var rightObj = data.results[2].data[i].row[4];
                        var prototypes = [];
                        var found = false;

                        if ('$$hashKey' in leftObj) {
                            delete leftObj['$$hashKey'];
                        }

                        if ('$$hashKey' in rightObj) {
                            delete rightObj['$$hashKey'];
                        }



                        toAdd.leftObj = leftObj;
                        toAdd.leftNodeType = leftNode;
                        toAdd.rightObj = rightObj;
                        toAdd.rightNodeType = rightNode;
                        toAdd.join = join;
                        toAdd.deltaRecord = {};
                        toAdd.deltaRecord.model = 'existing';

                        model.instanceRelationships.push(toAdd);

                        if (leftNode in model.prototypeValue) {
                            prototypes = model.prototypeValue[leftNode];
                            for (var k = 0; k < prototypes.length; k++) {
                                if (prototypes[k].name === leftObj.name) {
                                    found = true;
                                    break;
                                }
                            }
                        } else {
                            model.prototypeValue[leftNode] = [];
                        }

                        if (!found) {
                            
                            leftObj.deltaRecord = {};
                            leftObj.deltaRecord.model = 'existing';
    
                            model.prototypeValue[leftNode].push(leftObj);
                        }

                        found = false;

                        if (rightNode in model.prototypeValue) {
                            prototypes = model.prototypeValue[rightNode];
                            for (var l = 0; l < prototypes.length; l++) {
                                if (prototypes[l].name === rightObj.name) {
                                    found = true;
                                    break;
                                }
                            }
                        } else {
                            model.prototypeValue[rightNode] = [];
                        }

                        if (!found) {
                            
                            rightObj.deltaRecord = {};
                            rightObj.deltaRecord.model = 'existing';
                            
                            model.prototypeValue[rightNode].push(rightObj);
                        }

                    }

                    console.log(JSON.stringify(model));
                    deferred.resolve(model);
                }).
                error(function() {
                    console.log('Error in loading model');
                    deferred.reject();
                });

                return deferred.promise;

            },


// Need to mod still this fm
            add_template_to_model: function() {

                var deferred = $q.defer();
                var url = '/db/data/transaction/commit';

                var proto_keys = Object.keys(model.prototypeValue);
                var join_list = model.instanceRelationships;
                var obj_keys = {};
                var obj_keys2;
                var cmd = '';
                var cmd2 = '';
                var cmd3 = '';
                var nodetype = '';
                var obj;
                var cmds = [];


                // First create these nodes     
                for (var i = 0; i < proto_keys.length; i++) {
                    nodetype = proto_keys[i];
                    for (var j = 0; j < model.prototypeValue[proto_keys[i]].length; j++) {
                        // add object
                        obj = model.prototypeValue[proto_keys[i]][j];


                        if ('changes' in obj) {

                            if (obj.changes.mod === 'add') {

                                delete(obj.changes);
                                obj_keys = Object.keys(obj);

                                cmd = 'CREATE (a:' + nodetype + ' {';
                                for (var k = 0; k < obj_keys.length; k++) {
                                    cmd = cmd + obj_keys[k] + ": '" + obj[obj_keys[k]] + "',";
                                }

                                if (obj_keys.length > 0) {
                                    // strip last ,
                                    cmd = cmd.substring(0, cmd.length - 1);
                                }

                                cmd = cmd + "});";
                                cmds.push(cmd);

                            } else if (obj.changes.mod === 'delete') {

                                delete(obj.changes);
                                obj_keys = Object.keys(obj);

                                cmd = 'MATCH (a:' + nodetype + ' {';
                                for (var k = 0; k < obj_keys.length; k++) {
                                    cmd = cmd + obj_keys[k] + ": '" + obj[obj_keys[k]] + "',";
                                }

                                if (obj_keys.length > 0) {
                                    // strip last ,
                                    cmd = cmd.substring(0, cmd.length - 1);
                                    cmd2 = cmd + "\"}) -[r]- () delete r;";
                                    cmd3 = cmd + "\"}) delete a;";
                                }

                                cmds.push(cmd2);
                                cmds.push(cmd3);
                            }

                        }
                    }
                }


                // Now link them based on the relationships

                for (var l = 0; l < join_list.length; l++) {

                    // Were there any prototypes of these types
                    var obj1 = join_list[l].leftObj;
                    var obj1type = join_list[l].leftNodeType;
                    var obj2 = join_list[l].rightObj;
                    var obj2type = join_list[l].rightNodeType;
                    var join = join_list[l].join;

                    if ('changes' in join_list[l]) {

                        if (join_list[l].changes.mod === 'add') {

                            delete(join_list[l].changes);

                            if ('changes' in obj1) {
                                delete(obj1.changes);
                            }

                            // add object
                            cmd = 'MATCH (a:' + obj1type + '), (b:' + obj2type + ')';
                            var where_clause = 'WHERE ';

                            obj_keys = Object.keys(obj1);
                            for (var n = 0; n < obj_keys.length; n++) {
                                where_clause = where_clause + "a." + obj_keys[n] + "='" + obj1[obj_keys[n]] + "' AND ";
                            }

                            if ('changes' in obj2) {
                                delete(obj2.changes);
                            }

                            obj_keys2 = Object.keys(obj2);
                            for (var p = 0; p < obj_keys2.length; p++) {
                                where_clause = where_clause + "b." + obj_keys2[p] + "='" + obj2[obj_keys2[p]] + "' AND ";
                            }

                            // strip last 
                            where_clause = where_clause.substring(0, where_clause.length - 4);

                            cmd = cmd + where_clause + " CREATE (a)-[:" + join.toUpperCase() + "]->(b);";
                            cmds.push(cmd);
                        } else if (join_list[l].changes.mod === 'delete') {

                            delete(join_list[l].changes);

                            cmd = 'MATCH (a:' + obj1type + ') -[r]- (b:' + obj2type + ')';
                            var where_clause = 'WHERE ';

                            if ('changes' in obj1) {
                                delete(obj1.changes);
                            }

                            obj_keys = Object.keys(obj1);
                            for (var n = 0; n < obj_keys.length; n++) {
                                where_clause = where_clause + "a." + obj_keys[n] + "='" + obj1[obj_keys[n]] + "' AND ";
                            }

                            if ('changes' in obj2) {
                                delete(obj2.changes);
                            }


                            obj_keys2 = Object.keys(obj2);
                            for (var p = 0; p < obj_keys2.length; p++) {
                                where_clause = where_clause + "b." + obj_keys2[p] + "='" + obj2[obj_keys2[p]] + "' AND ";
                            }

                            // strip last 
                            where_clause = where_clause.substring(0, where_clause.length - 4);

                            cmd = cmd + where_clause + " DELETE r;";
                            cmds.push(cmd);

                        }
                    }
                }

                cmd = "{ \"statements\": [";

                for (var z = 0; z < cmds.length; z++) {
                    cmd = cmd + "{ \"statement\": \"";
                    cmd = cmd + cmds[z];
                    cmd = cmd + "\"},";
                }

                cmd = cmd.substring(0, cmd.length - 1);
                cmd = cmd + "]}";
                
                console.log(cmd);


                var req = {
                    method: 'POST',
                    url: url,
                    data: cmd,
                };

                $http(req).
                    success ( function (data) {
                    deferred.resolve(data);
                }).
                error ( function() {
                    console.log('Error in loading model');
                    deferred.reject();
                });

                return deferred.promise;

            }

        };
    }]);
})();