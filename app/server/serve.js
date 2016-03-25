var express = require('express'),
    bodyParser = require('body-parser'),
    path = require('path'),
    auth = require('./auth.js'),
    directory = require('./directory.js');

var Serve = module.exports = function (port, htmlRoot, userManager, ignoredAuthConfig) {
    htmlRoot = path.resolve(htmlRoot ? htmlRoot : path.join(__dirname, './../../www/'));
    this.serverPort = port ? port : 8080;
    this.server = express();

    this.server.use(bodyParser.json());
    this.server.use(auth.basicUsers(userManager, ignoredAuthConfig));
    this.server.use(directory.dir(htmlRoot));
};

var handleApiCall = function(serverCall, api, func) {
    serverCall.call(this, '/api/' + api, function (req, res) {
        try {
            res.contentType("application/json");
            if (func(req, res)) {
                res.status(200).send('{"complete":true}');
            }
        }
		catch (e) {
            console.log(e.stack);
            res.status(400).send('{"complete":false}');
        }
    });
};

Serve.prototype.apiGet = function (api, func) {
    handleApiCall.call(this.server, this.server.get, api, func);
};

Serve.prototype.apiPost = function (api, func) {
    handleApiCall.call(this.server, this.server.post, api, func);
};

Serve.prototype.start = function () {
    this.server.listen(this.serverPort);
};
