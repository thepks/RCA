(function() {

    var app = angular.module('NodeTemplateService', []);
    
    var username;
    var password;

    app.factory("NodeTemplateService", ["$q", "$http", function($q,$http) {


        return {
            
            authorize : function(user, pass) {
                
                var userobj = {};
                userobj.user = {};
                userobj.user.username = user;
                userobj.user.password = pass;
                
                username = user;
                password = pass;
                
                return $http.post("/action/logon", userobj);
                
            },
            
            logoff : function() {
                
                return $http.post("/action/logoff");
            },
            

            load_model_to_template : function() {
                
                var deferred = $q.defer();
                var url = '/db/data/transaction/commit';

                var cmd = "{ \"statements\": [ \
                    { \"statement\": \"match(n) return distinct labels(n);\"}, \
                    { \"statement\": \"MATCH (a)-[r]->(b) WHERE labels(a) <> [] AND labels(b) <> [] RETURN DISTINCT head(labels(a)) AS This, type(r) as To, head(labels(b)) AS That;\"}, \
                    { \"statement\": \"match (n)-[r]-(m) where labels(n) <> \\\"User\\\" return distinct labels(n),n,type(r),labels(m),m;\"} \
                    ] \
                }";
                
                var req = {
                    method : 'POST',
                    url : url,
                    data: cmd,
                };
                
                $http(req).
                    success ( function (data) {
                        
                        var model = {};
                        model.nodes = {};
                        
                        // results is the structure containing the response
                        // results[0] is the node object;
                        
                        for (var i=0; i<data.results[0].data.length;i++) {
                            model.nodes[data.results[0].data[i].row[0][0]] =[];
                            model.nodes[data.results[0].data[i].row[0][0]].push(name);
                        }
                        
                        // results [1] are the fundamental relationships, but [2] also describes
                        model.joins = [];
                        for (i=0; i<data.results[1].data.length;i++) {
                            var newRelationship = {};
                            newRelationship.leftNode = data.results[1].data[i].row[0];
                            newRelationship.join = data.results[1].data[i].row[1];
                            newRelationship.rightNode = data.results[1].data[i].row[2];
                            model.joins.push(newRelationship);
                        }
                        
                        // results [3] gives prototypes and relationships
                        // First populate out the node descriptions
                        for (i=0; i<data.results[2].data.length;i++) {
                            var node1 = data.results[2].data[i].row[0][0];
                            var properties1 = data.results[2].data[i].row[1];
                            var currProps = model.nodes[node1];
                            var keyvals = Object.keys(properties1);
                            for (var j=0; j<keyvals.length;j++) {
                                if (currProps.indexOf(keyvals[j]) < 0) {
                                    model.nodes[node1].push(keyvals[j]);
                                }    
                            }

                            var node2 = data.results[2].data[i].row[3][0];
                            var properties2 = data.results[2].data[i].row[4];
                            currProps = model.nodes[node2];
                            keyvals = Object.keys(properties2);
                            for (j=0; j<keyvals.length;j++) {
                                if (currProps.indexOf(keyvals[j]) < 0) {
                                    model.nodes[node2].push(keyvals[j]);
                                }    
                            }
                        }
                        
                        // Now populate out the instances
                        
                        console.log(JSON.stringify(model));
                        deferred.resolve(model);
                    }).
                    error ( function() {
                        console.log('Error in loading model');
                        deferred.reject();
                    });

                return deferred.promise;

            },
            
            add_template_to_model : function(model) {
                
                var chosen_template = model;
                var proto_keys = Object.keys(chosen_template.prototypeValues);
                var join_list = chosen_template.instanceRelationships;
                var obj_keys = {};
                var obj_keys2;
                var cmd = '';
                var nodetype = '';
                var obj;
                var cmds = [];
                
        
                // First create these nodes     
                for (var i=0; i<proto_keys.length;i++) {
                    nodetype = proto_keys[i];
                    for (var j=0; j<chosen_template.prototypeValues[proto_keys[i]].length;j++) {
                        // add object
                        obj = chosen_template.prototypeValues[proto_keys[i]][j];
                        obj_keys = Object.keys(obj);
                        
                        cmd = 'CREATE (a:' + nodetype + ' {' ;
                        for (var k=0; k<obj_keys.length; k++) {
                            cmd = cmd + obj_keys[k] + ": '" + obj[obj_keys[k]] +"',";   
                        }
                        
                        if (obj_keys.length > 0) {
                            // strip last ,
                            cmd = cmd.substring(0,cmd.length -1);
                        }
                        
                        cmd = cmd + "});";
                        cmds.push(cmd);
                    }
                }
                
                // Now link them based on the relationships

                for (var l=0; l<join_list.length; l++) {
                    
                    // Were there any prototypes of these types
                    var obj1 = join_list[l].leftObj;
                    var obj1type = join_list[l].leftNodeType;
                    var obj2 = join_list[l].rightObj;
                    var obj2type = join_list[l].rightNodeType;
                    var join = join_list[l].join;

                    // add object
                    cmd = 'MATCH (a:' + obj1type + '), (b:' +obj2type +')';
                    var where_clause = 'WHERE ';

                    obj_keys = Object.keys(obj1);
                    for (var n=0; n<obj_keys.length; n++) {
                        where_clause = where_clause + "a." + obj_keys[n] + "='" + obj1[obj_keys[n]] + "' AND ";
                    }
                    
                    obj_keys2 = Object.keys(obj2);
                    for (var p=0; p<obj_keys2.length; p++) {
                        where_clause = where_clause + "b." + obj_keys2[p] + "='" + obj2[obj_keys2[p]] + "' AND ";    
                    }
                    
                    // strip last 
                    where_clause = where_clause.substring(0, where_clause.length -4);

                    
                    cmd = cmd + where_clause + " CREATE (a)-[:" + join.toUpperCase() + "]->(b);";
                    cmds.push(cmd);
                }
                
                cmd = "{ \"statements\": [";
                
                for (var z=0; z<cmds.length; z++) {
                    cmd = cmd + "{ \"statement\": \"";
                    cmd = cmd + cmds[z];
                    cmd = cmd + "\"},";
                }
                
                cmd = cmd.substring(0,cmd.length -1);
                cmd = cmd + "]}";
                
                console.log(cmd);
                

            }
            
        };
    }]);
})();