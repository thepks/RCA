var express = require('express');
var forge = require('node-forge');
var bodyParser = require('body-parser');
var session = require('cookie-session');
var http = require('http');
var app = express();


var service_config = {
    'host': 'rca1.sb04.stations.graphenedb.com',
    'port': 24789,
    'path': '/db/data/transaction/commit',
    'username': 'rca1',
    'password': ''
};

var jsonParser = bodyParser.json();

var form_user_search = function(username) {
    var cmd = "MATCH (u:User)-[p]-(r:Role) where u.username=\\\"" + username + "\\\" return u.password,p,r.name;";
    var stmt = "{ \"statements\": [ { \"statement\": \"" + cmd + "\"}]}";
    return stmt;
};

var form_post_headers = function(username) {
    return {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(form_user_search(username), 'utf8'),
        'Authorization': 'Basic ' + new Buffer(service_config.username + ":" + service_config.password).toString('base64')
    };
};

var form_proxy_options = function(req) {

    //    console.log(JSON.stringify(req.headers));

    var new_headers = {};
    if ('content-type' in req.headers) {
        new_headers['content-type'] = req.headers['content-type'];
    }
    if ('content-length' in req.headers) {
        new_headers['content-length'] = req.headers['content-length'];
    }
    new_headers['Authorization'] = 'Basic ' + new Buffer(service_config.username + ":" + service_config.password).toString('base64');



    return {
        hostname: service_config.host,
        port: service_config.port,
        path: req.url,
        method: req.method,
        'X-Stream': true,
        headers: new_headers
    };
};


var form_post_options = function(username) {

    // the post options
    return {
        host: service_config.host,
        port: service_config.port,
        path: service_config.path,
        method: 'POST',
        headers: form_post_headers(username)
    };
};


app.use(express.static('/home/action/RCA/'));

app.use(session({
    keys: ['flog1', '2flog', 'fl3og']
}));


app.all('/db/data/transaction/commit', function(req, res) {


    if (!req.session.auth) {
        res.statusCode = 401;
        res.send("Unauthorized");
        return false;
    }


    // do the POST call
    var reqPost = http.request(form_proxy_options(req), function(resembedded) {
        console.log("statusCode: ", resembedded.statusCode);
        // uncomment it for header details
        //  console.log("headers: ", res.headers);

        resembedded.pipe(res);

    });

    req.addListener('data', function(d) {
        //    console.log(d);
        reqPost.write(d, 'binary');
    });

    req.addListener('end', function(d) {
        reqPost.end();
    });

    reqPost.on('error', function(e) {
        console.error(e);
        res.statusCode = 500;
        res.send('Error ' + e);
    });



});



app.all('/action/logoff', function(req, res) {
    console.log('Logged on? ' + req.session.auth);
    req.session.auth = false;
    req.session.roles = [];
    res.statusCode = 200;
    res.send("Logged off");
});

app.post('/action/logon', jsonParser, function(req, res) {
    var secret;
    var md = forge.md.sha1.create();
    var reply_body = '';
    md.update(req.body.user.password);
    secret = md.digest().toHex();
    console.log(secret);
    console.log(form_user_search(req.body.user.username));


    // do the POST call
    var reqPost = http.request(form_post_options(req.body.user.username), function(resembedded) {
        console.log("statusCode: ", resembedded.statusCode);
        // uncomment it for header details
        //  console.log("headers: ", res.headers);

        resembedded.on('data', function(d) {
            reply_body += d;
        });

        resembedded.on('end', function(d) {

            var result = {};
            console.info('POST result:\n');
            process.stdout.write(reply_body);
            console.info('\n\nPOST completed');
            var p = JSON.parse(reply_body);
            try {
                if (p.results[0].data[0].row[0] === secret) {

                    result.authorised = true;
                    result.roles = [];

                    req.session.auth = true;
                    req.session.roles = [];
                    res.statusCode = 200;
                    for (var j = 0; j < p.results[0].data.length; j++) {
                        console.log('Permission: ' + p.results[0].data[j].row[2]);
                        req.session.roles.push(p.results[0].data[j].row[2]);
                        result.roles.push(p.results[0].data[j].row[2]);
                    }
                    res.send(JSON.stringify(result));
                } else {
                    req.session.auth = false;
                    res.statusCode = 401;
                    result.authorised = false;
                    res.send(JSON.stringify(result));
                }

            } catch (e) {
                console.log('Failed to find path');
                req.session.auth = false;
                req.session.roles = [];
                res.statusCode = 401;
                result.authorised = false;
                res.send(JSON.stringify(result));
            }


        });
    });

    // write the json data
    var posting = form_user_search(req.body.user.username);
    console.log(posting);
    reqPost.write(posting);
    reqPost.end();
    reqPost.on('error', function(e) {
        console.error(e);
    });

});


var server = app.listen(8080, function() {

    var host = server.address().address;
    var port = server.address().port;

    console.log('Server app listening at http://%s:%s', host, port);

});