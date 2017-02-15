const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/vino');
mongoose.Promise = global.Promise;

const Wine = mongoose.model('Wine', {
	id: Number,
	name: String,
	year: String,
	region_short: Array,
	description: String,
	appellation: Object,
	type: String,
	variety: String,
	varietal: Object,
	vineyard: Object,
	price: Number,
	attributes: Object,
	rating: Number,
	detail: String,
	tags: Array
});

module.exports = Wine;
