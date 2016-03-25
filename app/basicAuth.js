var basicAuth = require('basic-auth'),
        sha512 = require('sha512'),
        users = require('./../users.json').users;

var auth = function (req, res, next) {
        var ip = req.ip;
        if (ip.includes(':')) {
                ip = ip.substring(ip.lastIndexOf(':') + 1);
        }

        if (auth.localOk && (ip === "1" || ip.startsWith("127.0.0."))) {
                return next();
        }

        if (auth.lanOk && (ip.startsWith("192.168.") || ip.startsWith("10."))) {
                return next();
        }

        function unauthorized(res) {
                res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
                return res.sendStatus(401);
        };

        var user = basicAuth(req);

        if (!user || !user.name || !user.pass) {
                return unauthorized(res);
        };

        user.pass = sha512(user.pass).toString('hex');
        var f = users.filter(function(u) {
                return u.username === user.name && u.password === user.pass;
        });
        if (f.length > 0) {
                return next();
        } else {
                return unauthorized(res);
        };
};

auth.localOk = true;
auth.lanOk = false;

module.exports = auth;