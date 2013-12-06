var Alloy = require('alloy');

var Cache = {
	
	Alloy.Globals.CBCache = [],

	init : function(){
	    Alloy.Globals.CBCache = [];
	},

	/**
	 * set object to cache
	 * @param {[string]} key ,  the cache key
	 * @param {[object]} object , the object save in cache
	 */
	set : function(key, object){
	    Alloy.Globals.CBCache[key] = object;
	},

	get : function(key){
	    return Alloy.Globals.CBCache[key];
	},

	clear : function(key){
	    Alloy.Globals.CBCache[key] = '';
	},
}

module.exports = Cache;