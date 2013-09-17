/**
 * @file overview This file contains the core framework class CBMVC_Alloy.
 * @author Winson  winsonet@gmail.com
 * @version v1.5
 * @copyright Winson http://www.coderblog.in
 * @license MIT License http://www.opensource.org/licenses/mit-license.php
 *
 * @disclaimer THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 * IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 *  PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

var Alloy = require('alloy'),
    _ = require('alloy/underscore')._;

// var contentWidth = '320dp',
//     contentWidth2 = '640dp';

var contentWidth = Ti.Platform.displayCaps.platformWidth,
    contentWidth2 = Ti.Platform.displayCaps.platformHeight;

var mainContent, _mainContent, _indexContent, _innerContent, _currentController, _previousController, _staticControllers = [],
    _backAnimation;

/**
 * CB app core namespace
 * @type {JSON}
 */
var CB = function() {};

CB.Version = Ti.App.version;
CB.UI = require('ui');
CB.Util = require('util');
CB.Net = require('net');
//CB.WP = require('wp');
CB.Debug = require('debug');
CB.Cache = require('cache');
CB.Date = require('date');
//CB.Youtube = require('youtube');

/**
 * Init the core app setting
 * @param {object} mainContent view
 */
CB.init = function(content) {
    CB.Cache.init();
    CB.Util.init(content.index);
    mainContent = content.main;
    _mainContent = mainContent;
    _currentController = Alloy.createController(Alloy.CFG.firstController);
};
/**
 * Get current controller
 * @return {[type]} [description]
 */
CB.getCurrentController = function(data) {
    if (_currentController === undefined) {
        _currentController = Alloy.createController(Alloy.CFG.firstController, data || {});
    }

    return _currentController;
};
/**
 * Get Previous controller
 * @return {[type]} [description]
 */
CB.getPreviousController = function(data) {
    return _previousController;
};

/**
 * Push controller for page switch, and popup a confirm dialog before leave this page
 * @param  {string}   args.controller   , next controller's name
 * @param  {enum}   args.animation      , animation type, should be an animation enum object
 * @param  {int}   args.duration        , the animation duration
 * @param  {JSON} args.data             , the data for pass to next controller, JSON format
 * @param  {Function} args.callback     , callback function
 * @param  {bool}   args.noTabs         , whether don't use custom tabs widget
 * @param  {string}   args.currTab        , set the current tab name
 * @param  {bool} args.showInd          , whether show an activity indicator
 * @param  {enum} args.action           , what action to do when push the controller
 * @param  {Object} args.setInnerContent   , whether need to set the inner content
 * @param  {Object} args.useInnerContent   , whether use the inner content
 * @param  {Object} args.showConfirm   , whether need to popup the confirm dialog box
 */
CB.pushConfirmLeaveController = function(args) {
    if (args.showConfirm) {
        CB.Util.confirm('You have not submit, are you sure leave this page?', 'Leave Page', function(e) {
            CB.pushController(args);
        });
    } else {
        CB.pushController(args);
    }
};

/**
 * Push controller for page switch
 * @param  {string}   args.controller   , next controller's name
 * @param  {enum}   args.animation      , animation type, should be an animation enum object
 * @param  {int}   args.duration        , the animation duration
 * @param  {JSON} args.data             , the data for pass to next controller, JSON format
 * @param  {Function} args.callback     , callback function
 * @param  {bool}   args.noTabs         , whether don't use custom tabs widget
 * @param  {string}   args.currTab        , set the current tab name
 * @param  {bool} args.showInd          , whether show an activity indicator
 * @param  {enum} args.action           , what action to do when push the controller
 * @param  {Object} args.setInnerContent   , whether need to set the inner content
 * @param  {Object} args.useInnerContent   , whether use the inner content
 */
CB.pushController = function(args) {
    if (args.useMainContent) {
        _mainContent = mainContent;
    }

    if (args.showInd) {
        CB.Util.actInd.show();
    }

    if (!args.duration) {
        args.duration = Alloy.CFG.animationDuration;
    }

    var oldController = _currentController;
    var oldView = oldController.getView();
    var _tmp_currentController = null;

    oldController.onBeforeClose();

    //keep the previous controller
    //_previousController = oldView.name;

    if (!oldView.name) {
        oldView.name = Alloy.CFG.firstController;
    }

    if (args.action && args.action == CB.UI.NavAction.Back && _previousController !== null) {
        args.controller = _previousController;
        args.currTab = _previousController;
        if (_backAnimation) {
            args.animation = _backAnimation;
        }
        Alloy.Globals.CB.Debug.echo('_previousController:==' + _previousController, 97, 'core.js');
    }

    if (args.controller === undefined || args.controller === null) {
        args.controller = oldView.name;
    }

    if (args.action && args.action == CB.UI.NavAction.Back && _staticControllers.length > 0) {
        _currentController = _staticControllers.pop();
    } else {
        _currentController = Alloy.createController(args.controller, args.data || {});
        if (args.setInnerContent) {
            _innerContent = _currentController.getView('content');
        }
        //init the controller, should be not overwrite
        var returnObj = _currentController.init(args.controller, args.data);
        //run the controller, can be overwrite
        _currentController.onLoad(returnObj, args.controller);
    }
    Alloy.Globals.CB.CurrentPage = args.controller;
    if (args.static) {
        _staticControllers.push(oldController);
    }
    _backAnimation = null;
    var currentView = _currentController.getView();
    currentView.name = args.controller;
    _mainContent.width = contentWidth;
    currentView.width = contentWidth;
    //_mainContent.add(currentView);
    //currentView.opacity = 0;
    switch (args.animation) {
        case CB.UI.AnimationStyle.FadeIn:
            _backAnimation = CB.UI.AnimationStyle.FadeIn;
            currentView.left = 0;
            currentView.opacity = 0;
            _mainContent.add(currentView);
            currentView.animate({
                opacity: 1,
                duration: args.duration
            }, function() {
                Alloy.Globals.CB.Debug.echo(_mainContent.children.length, 172, 'core.js=====');
                finishedPush(args, currentView, oldView, oldController);
            });
            break;
        case CB.UI.AnimationStyle.FadeOut:
            currentView.left = 0;
            currentView.opacity = 0;
            _mainContent.add(currentView);
            oldView.opacity = 1;
            oldView.animate({
                opacity: 0,
                duration: args.duration
            }, function() {
                currentView.animate({
                    opacity: 1,
                    duration: args.duration
                }, function() {
                    finishedPush(args, currentView, oldView, oldController);
                });
            });
            break;
        case CB.UI.AnimationStyle.NavLeft:
            _backAnimation = CB.UI.AnimationStyle.NavRight;
            currentView.left = contentWidth;
            _mainContent.add(currentView);
            _mainContent.children[0].left = 0;
            _mainContent.children[0].width = contentWidth;
            _mainContent.width = contentWidth2;
            _mainContent.left = 0;
            _mainContent.animate({
                left: -currentView.left,
                duration: args.duration
            }, function() {
                currentView.left = 0;
                _mainContent.left = 0;
                _mainContent.width = contentWidth;
                finishedPush(args, currentView, oldView, oldController);
            });
            break;
        case CB.UI.AnimationStyle.NavRight:
            //_mainContent.children[0].left = 0;
            _mainContent.width = contentWidth2;
            _mainContent.left = -contentWidth;
            _mainContent.children[0].left = contentWidth;
            currentView.left = 0;
            _mainContent.add(currentView);
            _mainContent.animate({
                left: 0,
                duration: args.duration
            }, function() {
                _mainContent.left = 0;
                _mainContent.width = contentWidth;
                finishedPush(args, currentView, oldView, oldController);
            });
            break;
        case CB.UI.AnimationStyle.SlideLeft:
            _backAnimation = CB.UI.AnimationStyle.SlideRight;
            _mainContent.left = 0;
            currentView.left = contentWidth;
            _mainContent.width = contentWidth * 2;
            _mainContent.add(currentView);
            _mainContent.animate({
                left: -contentWidth,
                duration: OS_ANDROID ? args.duration + 1000 : args.duration
            }, function() {
                currentView.left = 0;
                finishedPush(args, currentView, oldView, oldController);
                _mainContent.left = 0;
                _mainContent.width = contentWidth;
            });
            break;
        case CB.UI.AnimationStyle.SlideRight:
            _mainContent.width = contentWidth * 2;
            _mainContent.left = -contentWidth;
            if (_mainContent.children[1]) {
                _mainContent.children[1].left = contentWidth;
            } else {
                _mainContent.children[0].left = contentWidth;
            }
            currentView.left = 0;
            _mainContent.add(currentView);
            _mainContent.animate({
                left: 0,
                duration: OS_ANDROID ? args.duration + 1000 : args.duration
            }, function() {
                finishedPush(args, currentView, oldView, oldController);
            });
            break;
        case CB.UI.AnimationStyle.SlideUp:
            _backAnimation = CB.UI.AnimationStyle.SlideDown;
            currentView.top = Ti.Platform.displayCaps.platformHeight * 2;
            _mainContent.add(currentView);
            currentView.animate({
                top: 0,
                duration: args.duration
            }, function() {
                finishedPush(args, currentView, oldView, oldController);
            });
            break;
        case CB.UI.AnimationStyle.SlideDown:
            oldView.top = 0;
            oldView.zIndex = 100;
            _mainContent.add(currentView);
            oldView.animate({
                top: Ti.Platform.displayCaps.platformHeight * 2,
                duration: args.duration
            }, function() {
                finishedPush(args, currentView, oldView, oldController);
            });
            break;
        case CB.UI.AnimationStyle.None:
            _mainContent.add(currentView);
            finishedPush(args, currentView, oldView, oldController);
            break;
        default:
            _mainContent.add(currentView);
            finishedPush(args, currentView, oldView, oldController);
            break;
    }
};

/**
 * the private function after run when the pushController finished
 * @param  {[type]} args          [description]
 * @param  {[type]} currentView   [description]
 * @param  {[type]} oldView       [description]
 * @param  {[type]} oldController [description]
 * @return {[type]}               [description]
 */
var finishedPush = function(args, currentView, oldView, oldController) {

    if (Alloy.CFG.hasCustomTabs && !args.noTabs) {
        var tab = args.controller;
        if (args.currTab) {
            tab = args.currTab;
        }
        Alloy.Globals.Tabs.setTab(tab);
    }
    //keep the previous controller
    if (args.action && args.action == CB.UI.NavAction.KeepBack) {
        _previousController = oldView.name;
        Alloy.Globals.CB.Debug.echo(_previousController, 299, 'core======');
    }
    oldController.onClose();
    // if (Ti.Platform.name !== 'android') {
    //     _mainContent.remove(oldView);
    // }
    args.callback && args.callback(_currentController);
    oldController = null;

    if (_mainContent.children.length > 2) {
        _mainContent.remove(_mainContent.children[_mainContent.children.length - 2]);
        //_mainContent.width = contentWidth;
    }
    oldView = null;

    if (args.showInd) {
        CB.Util.actInd.hide();
    }
    //handle difference mainContent
    if (args.useInnerContent && _innerContent) {
        _mainContent = _innerContent;
    } else {
        _mainContent = mainContent;
    }
};

/**
 * Show the remote webserver error by error code
 * @param {[type]} errCode [description]
 */
CB.ShowError = function(errCode) {
    var errorMsg = '';
    switch (errCode) {
        case 110:
            errorMsg = Alloy.Globals.CB.Util.L('noCatID');
            break;
        case 120:
            errorMsg = 'There is no share event id!';
            break;
        case 130:
            errorMsg = Alloy.Globals.CB.Util.L('noFileObject');
            break;
        case 140:
            errorMsg = Alloy.Globals.CB.Util.L('noDefineLanguage');
            break;
        case 160:
            errorMsg = Alloy.Globals.CB.Util.L('paramsRequire');
            break;
        case 900:
            errorMsg = Alloy.Globals.CB.Util.L('noRecordFound');
            break;
        case -100:
            errorMsg = Alloy.Globals.CB.Util.L('networkErr');
            break;
        default:
            errorMsg = Alloy.Globals.CB.Util.L('unKnowError');
    }

    var alertDialog = Ti.UI.createAlertDialog({
        title: Alloy.Globals.CB.Util.L('error'),
        message: errorMsg,
        buttonNames: ['OK']
    });
    alertDialog.show();
};

module.exports = CB;