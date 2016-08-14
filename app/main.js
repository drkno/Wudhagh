'use strict';

let Server = require('./server/serve.js'),
    ListManager = require('./list.js'),
    UserManager = require('./users/users.js');

let setupServer = function(config) {
    let userManager = new UserManager(config.usersFile, config.passwordAlgorithm),
        eventsRoot = config.eventsRoot ? config.eventsRoot : '/wudhagh-ws-events';
    return new Server(config.port, config.htmlRoot, eventsRoot, userManager, config.authentication);
};

exports.run = function(config) {
    var server = setupServer(config),
        manager = new ListManager(config.datastore);

    server.on('connection', function (socket) {
        manager.current(function (obj) {
            if (!obj.purchaser) {
                
            }
            socket.emit('current', obj);
        });
    });
    
    server.on('new', function (socket) {
        manager.newList();
        socket.broadcast.emit('new');
        server.emit('purchaser', { purchaser: getNextPurchaser() });
    });

    server.on('add', function(socket, data) {
        manager.addItem(data);
        socket.broadcast.emit('add', data);
    });
    
    server.on('remove', function(socket, data) {
        manager.removeItem(data);
        socket.broadcast.emit('remove', data);
    });
    
    server.on('update', function(socket, data) {
        manager.replaceItem(data.oldName, data.item);
        socket.broadcast.emit('update', data);
    });
    
    server.apiGet('suggestions', function(req, res) {
        manager.getItems(function (obj) {
            res.send(obj);
        });
    });
    
    server.on('swipe', function (socket, data) {
        manager.updateFields(data.name, { purchased: data.purchased });
        socket.broadcast.emit('swipe', data);
    });

	server.start();
};
