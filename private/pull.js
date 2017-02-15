const request = require('request-promise');
const Wine = require('../model/wine');

class App {
	constructor() {
		this.wines = [];
		this.target = Infinity;
		this.offset = 0;
		this.size = 100;

		this.fetch(() => {
			console.log('done');
		});
	}

	fetch(cb) {
		console.log('getting: ' + this.offset + '-' + (this.offset + this.size) + ' / ' + this.target);
		request('http://services.wine.com/api/beta2/service.svc/json/catalog?apikey=<SOME API KEY>&size=' + this.size + '&offset=' + this.offset).then((data) =>
		{
			this.target = JSON.parse(data).Products.Total;
			this.offset += this.size;
			JSON.parse(data).Products.List.map(wine => this.process_wine(wine));

			if(this.wines.length < this.target - 1) { setTimeout(() => this.fetch(cb), 1000); }
			else { cb(); }
		})
	}

	process_wine(entry) {
		if(this.wines.indexOf(entry.Id) < 0 && entry.Appellation)
		{
			new Wine({
				id: entry.Id,
				name: entry.Name || null,
				year: entry.Vintage,
				region_short: [entry.Appellation.Name || null, entry.Appellation.Region.Name || null],
				description: entry.description,
				appellation: entry.Appellation,
				type: entry.Type,
				wine_type: entry.Varietal.WineType.Name || null,
				variety: entry.Varietal.Name || null,
				vineyard: entry.Vineyard,
				rating: entry.Ratings.HighestScore,
				attributes: entry.ProductAttributes,
				price: entry.PriceRetail
			}).save();
		}

		// request(entry.Url).then(page => {
			// console.log(page);
			// console.log(page.match(/<p itemprop=\"description\">(.+?)<\/p>/igm));
		// });

		// console.log(entry.Name);
	}

	write() {

	}
}

new App();
