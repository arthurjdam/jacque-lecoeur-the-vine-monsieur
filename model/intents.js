const Intents = {
	'misc.intro': {
		name: 'misc.intro',
		responses: {
			first: '',
			default: ''
		}
	},
	'recommend.event': {
		name: 'recommend.event',
		responses: {
			yes: [
				'I found you a nice {name}. It is described as: {description}'
			],
			no: [
				'I was unable to find you a nice wine! Try searching with different parameters.'
			]
		}
	},
	'recommend.generic': {
		name: 'recommend.generic',
		responses: {
			yes: [
				'Excellent! I have the perfect wine for you. A {name}. It is described as: {description}',
				'I have just the thing! How about a {name}. It is {description}'
			],
			no: [
				'I was unable to find you a nice wine! Try searching with different parameters.'
			],
			'pasta.unknown': [
				'That sounds delicious! Can you tell me the main ingredient of the sauce you\'re making?'
			],
			'meat.unknown': [
				'What type of sauce will you have on your meat?'
			]
		}
	},
	'recommend.generic.specify-pasta': {
		name: 'recommend.generic.specify-pasta'
	},
	'recommend.generic.modify-price': {
		name: 'recommend.generic.modify-price'
	},
	'recommend.detail.price': {
		name: 'recommend.detail.price',
		responses: {
			yes: [
				'That wine will be {price}',
				'That\'ll be {price}',
				'This beauty will set you back {price}'
			]
		}
	},
	'recommend.detail.location': {
		name: 'recommend.detail.location',
		responses: {
			yes: [
				'This wine is from the beautiful {location}',
				'It\'s from {location}, born and raised.'
			]
		}
	},
	'recommend.detail.age': {
		name: 'recommend.detail.age',
		responses: {
			yes: [
				'This wine originates from the year {year}',
				'This wine is from {year}, which means it is currently {age} years old',
				'The beauty is from {year}'
			]
		}
	}
};

module.exports = Intents;
