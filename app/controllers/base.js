var args = arguments[0] || {};
/**
 * the common init function for all controllers
 * @return {[type]} [description]
 */
exports.init = function(currController, data) {

};
/**
 * on load function before the controller load
 * @return {[type]} [description]
 */
exports.onLoad = function(returnObj) {};
/**
 * on close function when the controller is closed
 * @return {[type]} [description]
 */
exports.onClose = function() {};
/**
 * on before close
 * @return {[type]} [description]
 */
exports.onBeforeClose = function() {};
/**
 * get data from controller
 * @return {[type]} [description]
 */
exports.getData = function() {
	return args;
};