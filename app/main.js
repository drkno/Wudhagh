var Serve = require('./serve.js'),
	ListManager = require('./list.js');

exports.run = function(config) {
	var server = new Serve(config.port),
		manager = new ListManager(config.datastore);

	server.apiGet('new', function (req, res) {
		manager.newList();
		res.send('{"complete":true}');
	});

	server.apiGet('current', function (req, res) {
		try {
			manager.current(function(obj) {
				res.send(obj);
			});
		}
		catch(e) {
			console.log(e.stack);
			res.status(400).send('{"complete":false}');
		}
	});

	server.apiPost('addItem', function (req, res) {
		res.contentType("application/json");
		try {
			var json = req.body;
			manager.addItem(json.newItem);
			res.send('{"complete":true}');

		}
		catch(e) {
			console.log(e.stack);
			res.status(400).send('{"complete":false}');
		}
	});

	server.apiPost('removeItem', function (req, res) {
		try {
			var json = req.body;
			manager.removeItem(json.removeItem);
			res.send('{"complete":true}');
		}
		catch(e) {
			console.log(e.stack);
			res.status(400).send('{"complete":false}');
		}
    });

    server.apiPost('updateItem', function(req, res) {
        try {
            var json = req.body;
            manager.replaceItem(json.oldItem, json.newItem);
            res.send('{"complete":true}');
        }
		catch (e) {
            console.log(e.stack);
            res.status(400).send('{"complete":false}');
        }
    });

    server.apiGet('itemsList', function(req, res) {
        try {
            manager.getItems(function (obj) {
                res.send({ items: obj });
            });
        }
		catch (e) {
            console.log(e.stack);
            res.status(400).send('{"complete":false}');
        }
    });

	server.start(config.port);
};
