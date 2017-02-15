
// Express-related things
const Express = require('express');
const BodyParser = require('body-parser');
const pkg = require('./package.json');
const child_process = require('child_process');

// The MongoDB model
const Wine = require('./model/wine');

// Local entities and models
const Appellation = require('./api_ai/entities/wine-appellation.json');
const Pairings = require('./model/pairing');
const Intents = require('./model/intents');

class Util {
	/*
	*	Just return a random element from an Array
	*/
	static random_element(arr) {
		return arr[Math.floor(Math.random() * arr.length)];
	}

	/*
	*	Return a random response from the available options
	*/
	static response(intent, state, params) {
		let res = Util.random_element(Intents[intent].responses[state]);

		for(let i in params) res = res.replace(i, params[i]);

		return res;
	}

	/*
	*	Necessary for context carrying; flatten down the context so the
	*	parameters are as expected.
	*/
	static flatten(query) {
		let p = {};

		if(!query.contexts) return query.parameters;

		let copy = new RegExp(/(.+?)\.original$/i)

		for(let i = 0; i < query.contexts.length; ++i)
		{
			for(let j in query.contexts[i].parameters)
			{
				if(!j.match(copy)) p[j] = query.contexts[i].parameters[j];
			}
		}

		for(let j in query.parameters)
		{
			if(!j.match(copy)) p[j] = query.parameters[j];
		}

		return p;
	}

	/*
	*	Shorthand for finding a pairing
	*/
	static pair(pairing) {
		return (Pairings.hasOwnProperty(pairing)) ? Util.random_element(Pairings[pairing]) : '';
	}

	/*
	*	Format number as dollars
	*/
	static format_monetary(n) {
		return '$' + n.toFixed(2);
	}

	/*
	*	Get object from an array by its key
	*/
	static element_by_key(arr, key, value) {
		for(let i = 0; i < arr.length; ++i)
		{
			if(arr[i][key] === value) return arr[i];
		}
	}
}

class App {
	constructor() {
		/*
		*	Setup the Express app because we're lazy
		*/
		this.a = Express();

		this.settings = {
			branch:  '',
			base:    '',
			version: pkg.version,
			title:   pkg.name
		};

		child_process.exec('git rev-parse HEAD', (err, stdout) => this.settings.branch = (stdout) ? stdout : (process.env.REVISION) ? process.env.REVISION : '0ff');
		this.settings.base = (process.env.HEROKU_URL) ? process.env.HEROKU_URL : 'http://localhost:' + this.a.get('port') + '/';

		this.a.use(BodyParser.json());
		this.a.set('port', process.env.PORT || 5000);

		this.a.get('/', (req, res) => res.render('index', {settings: this.settings}));

		/*
		*	Generic passthrough of everything coming from api.ai
		*/
		this.a.post('*', (req, res) => this.parse(req.body, res));

		this.a.listen(this.a.get('port'), () => console.log('App listening on port ' + this.a.get('port')));
	}

	/*
	*	Parse the user's input and return an output.
	*/
	parse(body, res) {
		switch (body.result.metadata.intentName) {
			/*
			*	As it turns out, if we're trying to get to 1 result it's easier
			*	to merge all these intents together
			*/
			case Intents['recommend.generic'].name:
			case Intents['recommend.event'].name:
			case Intents['recommend.generic.specify-pasta'].name:
			case Intents['recommend.generic.modify-price'].name:
				if(body.result.parameters['wine-pairing'] === 'Pasta') {
					this.reply(
						Util.response(Intents['recommend.generic'].name, 'pasta.unknown', {}),
						res
					);

					return;
				}

				this.search(Util.flatten(body.result)).then(wine =>
				{
					// Little formatters to make this contextually correct.
					// Not apologyzing for this being in the main parser.
					// console.log(wine);
					let shortname = wine.name.replace(/[0-9]{4}/i, '').replace(/[\s]{2}/i, '');
					let description = wine.detail.replace(wine.name, 'This wine').replace(shortname, 'This wine');

					this.reply(
						Util.response(Intents['recommend.generic'].name, 'yes', {'{name}': shortname || '', '{description}': description || ''}),
						res,
						[{name: 'identified', 'lifespan': 5, parameters: {id: wine.id}}]
					);
				}, () =>
				{
					this.reply(
						Util.response(Intents['recommend.generic'].name, 'no', {}),
						res
					);
				});

				break;
			/*
			*	Return the price of a wine, assuming it's ID is already known in
			*	the context parameter
			*/
			case Intents['recommend.detail.price'].name:
				this.parameter(
					Util.element_by_key(body.result.contexts, 'name', 'identified').parameters.id,
					'price').then(price =>
				{
					this.reply(
						Util.response(Intents['recommend.detail.price'].name, 'yes', {'{price}': Util.format_monetary(price)}),
						res
					);
				}, e =>
				{
					console.log(e);
				});

				break;
			/*
			*	Return the origin of a wine, assuming it's ID is known
			*/
			case Intents['recommend.detail.location'].name:
				this.parameter(
					Util.element_by_key(body.result.contexts, 'name', 'identified').parameters.id,
					'region_short').then(location =>
				{
					this.reply(
						Util.response(Intents['recommend.detail.location'].name, 'yes', {'{location}': location.join(', ')}),
						res
					);
				}, e =>
				{
					console.log(e);
				});

				break;

				/*
				*	Return the year a wine is from.
				*/
				case Intents['recommend.detail.age'].name:
					this.parameter(
						Util.element_by_key(body.result.contexts, 'name', 'identified').parameters.id,
						'year').then(year =>
					{
						let age = new Date().getFullYear() - year;

						this.reply(
							Util.response(Intents['recommend.detail.age'].name, 'yes', {'{year}': year, '{age}': age}),
							res
						);
					}, e =>
					{
						console.log(e);
					});

					break;
			// case Intents['recommend.detail.alcohol'].name:
			// 	this.parameter(Util.element_by_key(body.result.contexts, name, 'identified').parameters.id, 'price').then(price =>
			// 	{
			// 		this.reply(Util.response('recommend.detail.price', 'yes', {'{price}', price}), res);
			// 	});
			break;

			default:
				break;
		}
	}

	/*
	*	Lazy-enabled return function
	*/
	reply(text, res, context) {
		console.log(text);
		res.json({
			speech: text,
			displayText: text,
			data: {},
			contextOut: context || [],
			source: ''
		})
	}

	/*
	* 	Bad things are about to happen. Only read this is you hate
	*/
	search(parameters) {
		return new Promise((res, rej) =>
		{
			let search_parameters = { detail: { $ne: null }};
			let sort = { rating: -1 };

			/*
			* User has set a pairing and looking for a wine type.
			*/
			if((parameters['wine-pairing'] && parameters['wine-pairing'].length > 0) && !(parameters['wine-type'] && parameters['wine-type'].length > 0)) {
				search_parameters['name'] = new RegExp(Util.pair(parameters['wine-pairing']), 'i');
				// search_parameters['variety'] = new RegExp('' + parameters['wine-type'] + '', 'i');
			}

			/*
			*	If wine type is set, search for variety and title
			*/
			else if(parameters['wine-type'] && parameters['wine-type'].length > 0) {
				search_parameters['name'] = new RegExp('' + parameters['wine-type'] + '', 'i');
			}

			/*
			*	If a wine region is set, look for it in the correct object.
			*/
			if(parameters['wine-appellation'] && parameters['wine-appellation'].length > 0) {
				let t = '';
				let s = new RegExp('^' + parameters['wine-appellation'] + '$', 'i');

				for(let i = 0; i < Appellation.entries.length; ++i)
				{
					//Parses through local object
					if(Appellation.entries[i].value.match(s))
					{
						t = 'appellation.Region.Name';
						break;
					}
					else
					{
						for(let j = 0; j < Appellation.entries[i].synonyms.length; ++j)
						{
							if(Appellation.entries[i].synonyms[j].match(s))
							{
								t = 'appellation.Name';
								break;
							}
						}
					}
				}
				if(t.length > 0) search_parameters[t] = parameters['wine-appellation'];
			}

			/*
			*	If user looking for a specific flavor, look through the extra-tags set
			*/
			if(parameters['wine-flavors'] && parameters['wine-flavors'].length > 0) {
				search_parameters['tags'] = { $in: parameters['wine-flavors'] };
			}

			/*
			*	If user is looking for a backwards pair, look for a corresponding wine type
			*/
			if(parameters['wine-pairing'] && parameters['wine-pairing'].length > 0) {

			}

			if(parameters['wine-price'] && parameters['wine-price'].length > 0) {
				if(parameters['wine-price'] === 'Cheap') search_parameters['price'] = { $lt: 15 };
				if(parameters['wine-price'] === 'Medium') search_parameters['price'] = { $lt: 40 };
				else sort = { price: -1 };
			}

			/*
			*	Finally, get it from Mongo and be a happy camper
			*/
			Wine.find(search_parameters).sort(sort).limit(1).exec((err, data) => {
				if(!err && data.length > 0) res(data[0]);
				else rej();
			});
		});
	}

	/*
	*	Search price by id
	*/
	parameter(id, parameter) {
		return new Promise((res, rej) =>
		{
			Wine.find({id: id}).exec((err, data) => {
				if(!err && data.length > 0) res(data[0][parameter]);
				else rej();
			});
		});
	}
}

let a = new App();
