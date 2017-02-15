const Types = {
	'dry-white': [
		'Sauvignon Blanc',
		'Grigio'
	],
	'sweet-white': [
		'Muscat',
		'Riesling'
	],
	'rich-white': [
		'Chardonnay',
		'Marsanne'
	],
	'sparkling': [
		'Prosecco',
		'Cava',
		'Champagne'
	],
	'light-red': [
		'Pinot noir',
		'Zweigelt'
	],
	'medium-red': [
		'Zinfadel',
		'Merlot'
	],
	'bold-red': [
		'Cabernet Sauvignon',
		'Malbec',
		'Syrah'
	],
	'dessert': [
		'Sherry',
		'Port'
	]
};

const Pairings = {
	'Vegetables': [].concat(
		Types['dry-white'],
		Types['sparkling']
	),
	'Roasted Vegetables': [].concat(
		Types['dry-white'],
		Types['light-red'],
		Types['medium-red']
	),
	'Soft cheese': [].concat(
		Types['sweet-white'],
		Types['rich-white']
	),
	'Hard cheese': [].concat(
		Types['sweet-white'],
		Types['medium-red']
	),
	'Starches': [].concat(
		Types['dry-white'],
		Types['rich-white'],
		Types['light-red'],
		Types['medium-red']
	),
	'Fish': [].concat(
		Types['dry-white'],
		Types['rich-white']
	),
	'Rich fish': [].concat(
		Types['light-red'],
		Types['rich-white']
	),
	'Light meat': [].concat(
		Types['rich-white'],
		Types['light-red'],
		Types['medium-red']
	),
	'Red meat': [].concat(
		Types['medium-red'],
		Types['bold-red']
	),
	'Cured meat': [].concat(
		Types['sweet-white'],
		Types['light-red'],
		Types['medium-red'],
		Types['bold-red']
	),
	'Sweets': [].concat(
		Types['dessert']
	)
};

module.exports = Pairings;
