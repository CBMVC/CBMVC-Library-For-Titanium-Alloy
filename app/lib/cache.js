var Alloy = require('alloy');

var Cache = function(){};

Cache.init = function(){
    Alloy.Globals.CBCache = [];
};

/**
 * set object to cache
 * @param {[string]} key ,  the cache key
 * @param {[object]} object , the object save in cache
 */
Cache.set = function(key, object){
    Alloy.Globals.CBCache[key] = object;
};

Cache.get = function(key){
    return Alloy.Globals.CBCache[key];
};

Cache.clear = function(key){
    Alloy.Globals.CBCache[key] = '';
};


module.exports = Cache;