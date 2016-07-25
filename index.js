var tough = require('tough-cookie-no-native');
var denodeify = require('es6-denodeify')(Promise);

class IsomorphicFetch {
	constructor(fetch = window.fetch, jar = new tough.CookieJar()) {
		this.fetch = fetch;
		this.jar = jar;

		this.getCookieString = denodeify(jar.getCookieString.bind(jar));
		this.setCookie = denodeify(jar.setCookie.bind(jar));

		return this.makeRequest.bind(this);
	}
	makeRequest(url, options = {}) {
		options.credentials = 'include'; // Include cookies (only) in the browser
		options.redirect = 'manual'; // Intercept redirects (only) in node

		return new Promise((resolve, reject) => {
			this.getCookieString(url)
			.then(cookie => {
				if (!options.headers) {
					options.headers = {};
				}

				if (typeof window == 'undefined') { // Don't include cookie header if browser / react native environment
					options.headers.Cookie = cookie;
				}

				options.headers = this.normalizeHeaders(options.headers);
				return this.fetch(url, options);
			})
			.then(response => {
				var cookies = response.headers.getAll('Set-Cookie');
				if (!cookies.length) {
					return [response];
				}
				var saveAllCookies = cookies.map(cookie => this.setCookie(cookie, url));
				return Promise.all([
					response,
					Promise.all(saveAllCookies)
				]);
			})
			.then(afterSaved => {
				var [response] = afterSaved;
				var redirect = response.headers.get('Location');
				var optionsToCarry = this.getOptionsToCarry(options);
				if (redirect) {
					return this.makeRequest(redirect, optionsToCarry);
				}
				return response;
			})
			.then(resolve)
			.catch(reject);
		});
	}
	normalizeHeaders(headers) {
		var keys = Object.keys(headers);
		for (var i = 0; i < keys.length; i++) {
			let key = keys[i];
			let lowercasedKey = key.toLowerCase();
			if (!headers[lowercasedKey]) {
				headers[lowercasedKey] = headers[key];
				delete headers[key];
			}
		}
		return headers;
	}
	getOptionsToCarry(options) {
		var headers = {};
		if (options.headers['user-agent']) {
			headers['user-agent'] = options.headers['user-agent'];
		}
		return {
			headers
		};
	}
}

module.exports = IsomorphicFetch;
