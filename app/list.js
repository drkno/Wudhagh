'use strict';

let Datastore = require('nedb'),
    path = require('path'),
    fs = require('fs');

let Manager = module.exports = function(database) {
    if (!database) {
        database = 'data.db';
    }
    database = path.join(__dirname, './../', database);
    database = path.resolve(database);
    this.store = new Datastore({filename:database, autoload:true});
    this.newList();
};

Manager.prototype.current = function (callback) {
	let id = this.currId;
	this.store.findOne({_id: id}, function(err, obj) {
		if (err) {
			throw err;
		}
		callback(obj);
	});
};

Manager.prototype.addItem = function (item) {
	let id = this.currId;
	this.store.update({_id: id}, {$push: {items: item}}, {}, function(){});
};

Manager.prototype.replaceItem = function(name, newItem) {
    let id = this.currId;
    this.store.update({ _id: id }, { $pull: { items: { name: name } }, $push: { items: newItem } }, {}, function (err, obj) {
        if (err) {
            throw err;
        }
    });
};

Manager.prototype.updateFields = function(name, updatedFields) {
    let id = this.currId,
        self = this;
    this.store.findOne({ _id: id }, function (err, obj) {
        if (err) {
            throw err;
        }

        let ind = -1;
        for (let i = 0; i < obj.items.length; i++) {
            if (obj.items[i].name === name) {
                ind = i;
                break;
            }
        }
        if (ind < 0) {
            return;
        }

        let keys = Object.keys(updatedFields);
        for (let i = 0; i < keys.length; i++) {
            obj.items[ind][keys[i]] = updatedFields[keys[i]];
        }

        self.replaceItem(name, obj.items[ind]);
    });
};

Manager.prototype.removeItem = function (item) {
	let id = this.currId;
	this.store.update({_id: id}, {$pull: {items: item}}, {}, function(err, obj){
		if (err) {
		    throw err;
        }
	});
};

Manager.prototype.newList = function () {
    let cfg = require('./../config.json'),
        xthis = this;

	if (!xthis.currId && cfg.current) {
		xthis.currId = cfg.current;
		return;
	}

	let newList = {
		items: []
	};

	this.store.insert(newList, function (err, id) {
		xthis.currId = id._id;
		cfg.current = id._id;
		fs.writeFileSync('config.json', JSON.stringify(cfg, null, 2));
	});
};

Manager.prototype.getItems = function(callback) {
    this.store.find({}, function (err, res) {
        if (err) {
            throw err;
        }
        
        // get all items
        let tota = 0,
            tots = [],
            coll = [];
        for (let i = 0; i < res.length; i++) {
            coll = coll.concat(res[i].items);
            tots.push(res[i].items.length);
            tota += res[i].items.length;
        }
        
        // to title case and unique
        let temp = {},
            result = [];
        for (let j = 0; j < coll.length; j++) {
            let key = coll[j].name.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
            if (!temp[key]) {
                temp[key] = 1;
            } else {
                temp[key]++;
            }
        }
        for (let i in temp) {
            if (temp.hasOwnProperty(i)) {
                result.push([i, temp[i]]);
            }
        }

        // sort by frequency and alphabet
        result = result.sort(function(a, b) {
            let res = b[1] - a[1];
            if (res !== 0) return res;
            if (a[0] > b[0]) return 1;
            if (a[0] < b[0]) return -1;
            return 0;
        });

        callback({
            items: result,
            total: tota,
            shops: tots
        });
    });
};
