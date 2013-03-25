/**
 * @file overview This file contains the core framework class CBMVC_Alloy.
 * @author Winson  winsonet@gmail.com
 * @version v1.2
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

var _mainContent, _currentController, _previousController, _staticControllers = [];

/**
 * CB app core namespace
 * @type {JSON}
 */
var CB = function() {};

CB.Version = Ti.App.version;
CB.UI = require('ui');
CB.Util = require('util');
CB.Net = require('net');
CB.WP = require('wp');
CB.Debug = require('debug');

/**
 * Init the core app setting
 * @param {object} mainContent view
 */
CB.init = function(mainContent) {
    CB.Util.init(mainContent.index);
    _mainContent = mainContent.main;
    _currentController = Alloy.createController(Alloy.CFG.firstController);
};
/**
 * Get current controller
 * @return {[type]} [description]
 */
CB.getCurrentController = function() {
    if (_currentController === undefined) {
        _currentController = Alloy.createController(Alloy.CFG.firstController);
    }

    return _currentController;
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
 */
CB.pushController = function(args) {
    if (args.showInd) {
        CB.Util.actInd.show();
    }

    if (!args.duration) {
        args.duration = Alloy.CFG.animationDuration;
    }

    var oldController = _currentController;
    var oldView = oldController.getView();
    var _tmp_currentController = null;

    if (!oldView.name) {
        oldView.name = Alloy.CFG.firstController;
    }

    if (args.action && args.action == CB.UI.NavAction.Back && _previousController !== null) {
        args.controller = _previousController;
        args.currTab = _previousController;
        Alloy.Globals.CB.Debug.echo('_previousController:==' + _previousController, 88, 'core.js');
    }

    if (args.controller === undefined || args.controller === null) {
        args.controller = oldView.name;
    }


    if (args.action && args.action == CB.UI.NavAction.Back && _staticControllers.length > 0) {
        _currentController = _staticControllers.pop();
    } else {
        _currentController = Alloy.createController(args.controller, args.data || {});
        //init the controller
        _currentController.onLoad();
    }

    if(args.static){
        _staticControllers.push(oldController);
    }

    var currentView = _currentController.getView();
    currentView.name = args.controller;
    _mainContent.width = Ti.Platform.displayCaps.platformWidth;
    currentView.width = Ti.Platform.displayCaps.platformWidth;
    //_mainContent.add(currentView);
    //currentView.opacity = 0;
    switch (args.animation) {
        case CB.UI.AnimationStyle.FadeIn:
            currentView.left = 0;
            currentView.opacity = 0;
            _mainContent.add(currentView);
            currentView.animate({
                opacity: 1,
                duration: args.duration
            }, function() {
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
            currentView.left = Ti.Platform.displayCaps.platformWidth;
            _mainContent.add(currentView);
            _mainContent.children[0].left = 0;
            _mainContent.children[0].width = Ti.Platform.displayCaps.platformWidth;
            _mainContent.width = Ti.Platform.displayCaps.platformWidth * 2;
            _mainContent.left = 0;
            _mainContent.animate({
                left: -currentView.left,
                duration: args.duration
            }, function() {
                currentView.left = 0;
                _mainContent.left = 0;
                _mainContent.width = Ti.Platform.displayCaps.platformWidth;
                finishedPush(args, currentView, oldView, oldController);
            });
            break;
        case CB.UI.AnimationStyle.NavRight:
            //_mainContent.children[0].left = 0;
            _mainContent.width = Ti.Platform.displayCaps.platformWidth * 2;
            _mainContent.left = -Ti.Platform.displayCaps.platformWidth;
            _mainContent.children[0].left = Ti.Platform.displayCaps.platformWidth;
            currentView.left = 0;
            _mainContent.add(currentView);
            _mainContent.animate({
                left: 0,
                duration: args.duration
            }, function() {
                _mainContent.left = 0;
                _mainContent.width = Ti.Platform.displayCaps.platformWidth;
                finishedPush(args, currentView, oldView, oldController);
            });
            break;
        case CB.UI.AnimationStyle.SlideLeft:
            currentView.left = Ti.Platform.displayCaps.platformWidth;
            _mainContent.add(currentView);
            currentView.animate({
                left: 0,
                duration: args.duration
            }, function() {
                finishedPush(args, currentView, oldView, oldController);
            });
            break;
        case CB.UI.AnimationStyle.SlideRight:
            oldView.left = 0;
            oldView.zIndex = 100;
            oldView.animate({
                left: Ti.Platform.displayCaps.platformWidth,
                duration: args.duration
            }, function() {
                finishedPush(args, currentView, oldView, oldController);
            });
            break;
        case CB.UI.AnimationStyle.SlideUp:
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
        var tab = args.container;
        if (args.currTab) {
            tab = args.currTab;
        }
        Alloy.Globals.Tabs.setTab(tab);
    }
    //keep the previous controller
    if (args.action && args.action == CB.UI.NavAction.KeepBack) {
        _previousController = oldView.name;
    }
    oldController.onClose();
    _mainContent.remove(oldView);
    args.callback && args.callback(_currentController);
    oldController = null;
    if (args.showInd) {
        CB.Util.actInd.hide();
    }
};


module.exports = CB;