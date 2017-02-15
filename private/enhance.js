const slug = require('slug');
const request = require('request-promise');
const Language = require('@google-cloud/language');
const languageClient = Language({
    projectId: 'ge-sentiment-test-150402',
    keyFilename: 'ge-sentiment-test-150402-f8e2d39ebdf3.json'
});

const Wine = require('../model/wine');

class App {
	constructor() {
		this.wines = [];
		Wine.find({}).exec((err, data) => {
			this.wines = data;

			let start = 29211;
			// let start = 0;
			// this.enrich(start);
			this.entities(start);
		});
	}

	enrich(index) {
		let wine = this.wines[index];

		console.log('http://www.wine.com/v6/' + slug(wine.name) + '/wine/'+ wine.id + '/Detail.aspx?state=CA');
		request('http://www.wine.com/v6/' + slug(wine.name) + '/wine/'+ wine.id + '/Detail.aspx?state=CA').then((page) => {
			wine.detail = page.replace('\n', '').match(/<p itemprop=\"description\">([\s\S]*?)<\/p>/ig);
			if(wine.detail) wine.detail = wine.detail.replace(/<p>/gm, '. ').replace(/<(?:.|\n)*?>/gm, ' ').replace(/\\n/, ' ');
			wine.save();
			console.log('done ' + index + '/' + this.wines.length);

			if(index < this.wines.length) this.enrich(++index);
		}, err => {
			console.log('err ' + index + '/' + this.wines.length);
			if(index < this.wines.length) this.enrich(++index);
		});
	}

	entities(index) {
		let wine = this.wines[index];
		if(!wine.detail) {
			this.entities(++index);
			return;
		}

		languageClient.detectEntities(wine.detail, (err, entities) => {
			if(!err && entities && entities.length > 0)
			{
				let keys = Object.keys(entities);
				let tags = [];
				for(let i = 0; i < keys.length; ++i)
				{
					for(let j = 0; j < entities[keys[i]].length; ++j)
					{
					    tags.push(entities[keys[i]][j]);
					}
				}
				wine.tags = tags;

				wine.save();
			}
			console.log('done ' + index + '/' + this.wines.length);

			if(index < this.wines.length) this.entities(++index);
		});
	}
}

new App();
