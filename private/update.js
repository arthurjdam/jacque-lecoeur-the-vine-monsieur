
const fs = require('fs');
const Wine = require('../model/wine');
const mongoose = require('mongoose');
const data = require('./out.json');

function update() {
	// Wine.remove({}).then(() => {
		// console.log('database emptied');
		data.map((wine, i) => {
			setTimeout(() => {
				new Wine(wine).save();
				console.log([i, data.length].join('/'));
			}, i * 2);
		})
	// });
}

function save() {
	Wine.find({}).exec((err, data) => {
		console.log('data received, writing file');

		fs.writeFile('out.json', JSON.stringify(data, null, 4));
	});
}

update();
