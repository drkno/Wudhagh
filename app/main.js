var Server = require('./server/serve.js'),
    ListManager = require('./list.js'),
    UserManager = require('./users/users.js');

var setupServer = function(config) {
    var userManager = new UserManager(config.usersFile, config.passwordAlgorithm);
    return new Server(config.port, config.htmlRoot, userManager, config.authentication);
};

exports.run = function(config) {
    var server = setupServer(config),
        manager = new ListManager(config.datastore);

    server.apiGet('new', function () {
        manager.newList();
        return true;
    });

	server.apiGet('current', function (req, res) {
	    manager.current(function(obj) {
		    res.send(obj);
	    });
	});

	server.apiPost('addItem', function (req) {
		manager.addItem(req.body.newItem);
        return true;
	});

	server.apiPost('removeItem', function (req) {
		manager.removeItem(req.body.removeItem);
        return true;
    });

    server.apiPost('updateItem', function(req) {
        manager.replaceItem(req.body.oldItem, req.body.newItem);
        return true;
    });

    server.apiGet('itemsList', function(req, res) {
        manager.getItems(function (obj) {
            res.send(obj);
        });
    });

	server.start();
};
