var Alloy = require('alloy');

var Cache = {

	Data: [],

	init: function() {

	},

	/**
	 * set object to cache
	 * @param {[string]} key ,  the cache key
	 * @param {[object]} object , the object save in cache
	 */
	set: function(key, object) {
		Cache.Data[key] = object;
	},

	get: function(key) {
		return Cache.Data[key];
	},

	clear: function(key) {
		Cache.Data[key] = '';
	}
}

module.exports = Cache;