# real-isomorphic-fetch [![Build Status](https://travis-ci.org/JonnyBurger/real-isomorphic-fetch.svg?branch=master)](https://travis-ci.org/JonnyBurger/real-isomorphic-fetch)

> Isomorphic fetch() with cookie 🍪 and redirect ⏩ support for all environments

## Installation

```
npm install real-isomorphic-fetch --save
```

## Usage

```js
const IsomorphicFetch = require('real-isomorphic-fetch');
const fetch = require('node-fetch'); // could also be window.fetch in the browser or global.fetch in react-native
const fetchInstance = new IsomorphicFetch(fetch) // cookies are shared between every IsomorphicFetch instance

fetchInstance('https://example.com/123') // Cookies and redirects are handled automatically
.then(response => response.text())
.then(text => console.log(text))
.catch(err => console.error(err));
```

## The problem

* There are libraries out there that [polyfill fetch in the browser](https://github.com/github/fetch) and [bring it to node](https://github.com/bitinn/node-fetch).
* However, [node-fetch](https://github.com/bitinn/node-fetch) library doesn't handle receiving cookies...
* ... so you can use [fetch-cookie](https://github.com/valeriangalliat/fetch-cookie) to use cookies with fetch() ...
* ... but then you have to intercept redirects manually because [fetch-cookie](https://github.com/valeriangalliat/fetch-cookie) doesn't handle them...

```js
const fetchWithCookie = require('fetch-cookie')(require('node-fetch'));
fetchWithCookie('https://example.com/123', {
	redirect: 'manual'
})
.then(response => response.headers.get('Location'))
.then(location => fetchWithCookie(location, {redirect: 'manual'}))
```

* ... which then doesn't work in the browser anymore because you can't intercept redirects (and because it uses native dependencies)!


## The solution

This library handles cookies and redirects together and normalizes the behaviour of `node-fetch` to match the one of the browser, so you can use the same syntax in both environments.

## Credits

This is a rewrite of [fetch-cookie](https://github.com/valeriangalliat/fetch-cookie).
Heavy inspiration also from [isomorphic-fetch](https://github.com/matthew-andrews/isomorphic-fetch).

## License

MIT © [Jonny Burger](http://jonny.io)
