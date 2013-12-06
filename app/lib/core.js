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


/**
 * CB app core namespace
 * @type {JSON}
 */
var CB = {
    /**
     * Define all libs namespace
     */
    UI : require('ui'),
    Util : require('util'),
    Network : require('net'),
    WP : require('wp'),
    Debug : require('debug'),
    Cache : require('cache'),
    Date : require('date'),
    Youtube : require('youtube'),
    Social : require('social'),

    /**
     * Holds data from the JSON config file
     */
    ID: null,
    VERSION: null,
    CVERSION: '1.5.0.0612131440',
    LEGAL: {
        COPYRIGHT: null,
        TOS: null,
        PRIVACY: null
    },
    ConfigurationURL: null,
    Nodes: [],
    Plugins: null,
    Settings: null,
    CurrentPage: null,
    /**
     * The loading view
     */
    Loading: Alloy.createWidget("com.chariti.loading").getView(),
    cancelLoading: false,
    loadingOpen: false,
    /**
     * Tabs Widget
     */
    Tabs: null,

    MainContent: null,
    _mainContent: null,
    _innerContent: null,
    _currentController: null,
    _previousController: null,
    _staticControllers: [],
    _backAnimation: null,
    _contentWidth: Ti.Platform.displayCaps.platformWidth,
    _mainContentwidth : Ti.Platform.displayCaps.platformHeight,

    /**
     * Device information
     */
    Device: {
        isHandheld: Alloy.isHandheld,
        isTablet: Alloy.isTablet,
        type: Alloy.isHandheld ? "handheld" : "tablet",
        os: null,
        name: null,
        version: Titanium.Platform.version,
        versionMajor: null,
        versionMinor: null,
        width: Ti.Platform.displayCaps.platformWidth > Ti.Platform.displayCaps.platformHeight ? Ti.Platform.displayCaps.platformHeight : Ti.Platform.displayCaps.platformWidth,
        height: Ti.Platform.displayCaps.platformWidth > Ti.Platform.displayCaps.platformHeight ? Ti.Platform.displayCaps.platformWidth : Ti.Platform.displayCaps.platformHeight,
        dpi: Ti.Platform.displayCaps.dpi,
        orientation: Ti.Gesture.orientation == Ti.UI.LANDSCAPE_LEFT || Ti.Gesture.orientation == Ti.UI.LANDSCAPE_RIGHT ? "LANDSCAPE" : "PORTRAIT",
        statusBarOrientation: null,
        isNexus7 = (OS_ANDROID && (Ti.Platform.displayCaps.platformWidth == 1280 || (Ti.Platform.displayCaps.platformWidth == 800 && Ti.Platform.displayCaps.platformHeight > 1200)))
    },
    /**
     * Init the core app setting
     * @param {object} mainContent view
     */
    init : function(content) {

        // Global system Events
        Ti.Network.addEventListener("change", CB.networkObserver);
        Ti.Gesture.addEventListener("orientationchange", CB.orientationObserver);
        Ti.App.addEventListener("pause", CB.exitObserver);
        Ti.App.addEventListener("close", CB.exitObserver);
        Ti.App.addEventListener("resumed", CB.resumeObserver);

        // Determine device characteristics
        CB.determineDevice();

        // Migrate to newer version
        require("migrate").init();

        // Init cache object
        CB.Cache.init();

        // Init utility object
        CB.Util.init(content.index);

        // The main content
        CB.MainContent = content.main;

        // The main content copy
        CB._mainContent = content.main; 

        // Get the current controller
        CB._currentController = Alloy.createController(Alloy.CFG.firstController);
    },
    /**
     * Determines the device characteristics
     */
    determineDevice: function() {
        CB.Device.versionMajor = parseInt(CB.Device.version.split(".")[0], 10);
        CB.Device.versionMinor = parseInt(CB.Device.version.split(".")[1], 10);

        if(OS_IOS) {
            CB.Device.os = "IOS";

            if(Ti.Platform.osname.toUpperCase() == "IPHONE") {
                CB.Device.name = "IPHONE";
            } else if(Ti.Platform.osname.toUpperCase() == "IPAD") {
                CB.Device.name = "IPAD";
            }
        } else if(OS_ANDROID) {
            CB.Device.os = "ANDROID";

            CB.Device.name = Ti.Platform.model.toUpperCase();

            // Fix the display values
            CB.Device.width = (CB.Device.width / (CB.Device.dpi / 160));
            CB.Device.height = (CB.Device.height / (CB.Device.dpi / 160));
        }
    },
    /**
     * Setup the database bindings
     */
    setupDatabase: function() {
        Ti.API.debug("CB.setupDatabase");

        var db = Ti.Database.open(Alloy.CFG.database);

        db.execute("CREATE TABLE IF NOT EXISTS updates (url TEXT PRIMARY KEY, time TEXT);");
        db.execute("CREATE TABLE IF NOT EXISTS log (time INTEGER, type TEXT, message TEXT);");

        // Fill the log table with empty rows that we can 'update', providing a max row limit
        var data = db.execute("SELECT time FROM log;");

        if(data.rowCount === 0) {
            db.execute("BEGIN TRANSACTION;");

            for(var i = 0; i < 100; i++) {
                db.execute("INSERT INTO log VALUES (" + i + ", \"\", \"\");");
            }

            db.execute("END TRANSACTION;");
        }

        data.close();
        db.close();
    },
    /**
     * Drops the entire database
     */
    dropDatabase: function() {
        Ti.API.debug("CB.dropDatabase");

        var db = Ti.Database.open(Alloy.CFG.database);
        db.remove();
    },
    /**
     * Loads in the appropriate controller and config data
     */
    loadContent: function() {
        CB.log("debug", "CB.loadContent");

        var contentFile = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, "cbapp.json");

        if(!contentFile.exists()) {
            contentFile = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory + "cbapp.json");
        }

        var content = contentFile.read();
        var data;

        try {
            data = JSON.parse(content.text);
        } catch(_error) {
            CB.log("error", "Unable to parse downloaded JSON, reverting to packaged JSON");

            contentFile = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory + "cbapp.json");

            if(contentFile.exists()) {
                content = contentFile.read();
                data = JSON.parse(content.text);
            } else {
                CB.log("error", "Unable to parse local JSON, dying");

                alert("Unable to open the application");

                return;
            }
        }

        CB.ID = data.id;
        CB.VERSION = data.version;
        CB.LEGAL = {
            COPYRIGHT: data.legal.copyright,
            TOS: data.legal.terms,
            PRIVACY: data.legal.privacy
        };

        CB.ConfigurationURL = data.configurationUrl && data.configurationUrl.length > 10 ? data.configurationUrl : false;
        CB.Settings = data.settings;
        CB.Plugins = data.plugins;
    },
    /**
     * Get current controller
     * @return {[type]} [description]
     */
    getCurrentController : function(data) {
        if (CB._currentController === undefined) {
            CB._currentController = Alloy.createController(Alloy.CFG.firstController, data || {});
        }

        return CB._currentController;
    },
    /**
     * Get Previous controller
     * @return {[type]} [description]
     */
    getPreviousController : function(data) {
        return CB._previousController;
    },

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
    pushConfirmLeaveController : function(args) {
        if (args.showConfirm) {
            CB.Util.confirm('You have not submit, are you sure leave this page?', 'Leave Page', function(e) {
                CB.pushController(args);
            });
        } else {
            CB.pushController(args);
        }
    },

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
    pushController : function(args) {
        if (args.useMainContent) {
            CB._mainContent = mainContent;
        }

        if (args.showInd) {
            CB.Util.actInd.show();
        }

        if (!args.duration) {
            args.duration = Alloy.CFG.animationDuration;
        }

        var oldController = CB._currentController;
        var oldView = oldController.getView();
        var _tmpCB._currentController = null;

        oldController.onBeforeClose();

        //keep the previous controller
        //CB._previousController = oldView.name;

        if (!oldView.name) {
            oldView.name = Alloy.CFG.firstController;
        }

        if (args.action && args.action == UI.NavAction.Back && CB._previousController !== null) {
            args.controller = CB._previousController;
            args.currTab = CB._previousController;
            if (CB._backAnimation) {
                args.animation = CB._backAnimation;
            }
            CB.Debug.echo('CB._previousController:==' + CB._previousController, 97, 'core.js');
        }

        if (args.controller === undefined || args.controller === null) {
            args.controller = oldView.name;
        }

        if (args.action && args.action == UI.NavAction.Back && CB._staticControllers.length > 0) {
            CB._currentController = CB._staticControllers.pop();
        } else {
            CB._currentController = Alloy.createController(args.controller, args.data || {});
            if (args.setInnerContent) {
                CB._innerContent = CB._currentController.getView('content');
            }
            //init the controller, should be not overwrite
            var returnObj = CB._currentController.init(args.controller, args.data);
            //run the controller, can be overwrite
            CB._currentController.onLoad(returnObj, args.controller);
        }
        CB.CurrentPage = args.controller;
        if (args.static) {
            CB._staticControllers.push(oldController);
        }
        CB._backAnimation = null;
        var currentView = CB._currentController.getView();
        currentView.name = args.controller;
        CB._mainContent.width = CB._contentWidth;
        currentView.width = CB._contentWidth;
        //CB._mainContent.add(currentView);
        //currentView.opacity = 0;
        switch (args.animation) {
            case CB.UI.AnimationStyle.FadeIn:
                CB._backAnimation = CB.UI.AnimationStyle.FadeIn;
                currentView.left = 0;
                currentView.opacity = 0;
                CB._mainContent.add(currentView);
                currentView.animate({
                    opacity: 1,
                    duration: args.duration
                }, function() {
                    CB.Debug.echo(CB._mainContent.children.length, 172, 'core.js=====');
                    CB.finishedPush(args, currentView, oldView, oldController);
                });
                break;
            case CB.UI.AnimationStyle.FadeOut:
                currentView.left = 0;
                currentView.opacity = 0;
                CB._mainContent.add(currentView);
                oldView.opacity = 1;
                oldView.animate({
                    opacity: 0,
                    duration: args.duration
                }, function() {
                    currentView.animate({
                        opacity: 1,
                        duration: args.duration
                    }, function() {
                        CB.finishedPush(args, currentView, oldView, oldController);
                    });
                });
                break;
            case CB.UI.AnimationStyle.NavLeft:
                CB._backAnimation = CB.UI.AnimationStyle.NavRight;
                currentView.left = CB._contentWidth;
                CB._mainContent.add(currentView);
                CB._mainContent.children[0].left = 0;
                CB._mainContent.children[0].width = CB._contentWidth;
                CB._mainContent.width = CB._mainContentwidth;
                CB._mainContent.left = 0;
                CB._mainContent.animate({
                    left: -currentView.left,
                    duration: args.duration
                }, function() {
                    currentView.left = 0;
                    CB._mainContent.left = 0;
                    CB._mainContent.width = CB._contentWidth;
                    CB.finishedPush(args, currentView, oldView, oldController);
                });
                break;
            case CB.UI.AnimationStyle.NavRight:
                //CB._mainContent.children[0].left = 0;
                CB._mainContent.width = CB._mainContentwidth;
                CB._mainContent.left = -CB._contentWidth;
                CB._mainContent.children[0].left = CB._contentWidth;
                currentView.left = 0;
                CB._mainContent.add(currentView);
                CB._mainContent.animate({
                    left: 0,
                    duration: args.duration
                }, function() {
                    CB._mainContent.left = 0;
                    CB._mainContent.width = CB._contentWidth;
                    CB.finishedPush(args, currentView, oldView, oldController);
                });
                break;
            case CB.UI.AnimationStyle.SlideLeft:
                CB._backAnimation = CB.UI.AnimationStyle.SlideRight;
                CB._mainContent.left = 0;
                currentView.left = CB._contentWidth;
                CB._mainContent.width = CB._contentWidth * 2;
                CB._mainContent.add(currentView);
                CB._mainContent.animate({
                    left: -CB._contentWidth,
                    duration: OS_ANDROID ? args.duration + 700 : args.duration
                }, function() {
                    currentView.left = 0;
                    CB.finishedPush(args, currentView, oldView, oldController);
                    CB._mainContent.left = 0;
                    CB._mainContent.width = CB._contentWidth;
                });
                break;
            case CB.UI.AnimationStyle.SlideRight:
                CB._mainContent.width = CB._contentWidth * 2;
                CB._mainContent.left = -CB._contentWidth;
                if (CB._mainContent.children[1]) {
                    CB._mainContent.children[1].left = CB._contentWidth;
                } else {
                    CB._mainContent.children[0].left = CB._contentWidth;
                }
                currentView.left = 0;
                CB._mainContent.add(currentView);
                CB._mainContent.animate({
                    left: 0,
                    duration: OS_ANDROID ? args.duration + 700 : args.duration
                }, function() {
                    CB.finishedPush(args, currentView, oldView, oldController);
                });
                break;
            case CB.UI.AnimationStyle.SlideUp:
                CB._backAnimation = CB.UI.AnimationStyle.SlideDown;
                currentView.top = Ti.Platform.displayCaps.platformHeight * 2;
                CB._mainContent.add(currentView);
                currentView.animate({
                    top: 0,
                    duration: args.duration
                }, function() {
                    CB.finishedPush(args, currentView, oldView, oldController);
                });
                break;
            case CB.UI.AnimationStyle.SlideDown:
                oldView.top = 0;
                oldView.zIndex = 100;
                CB._mainContent.add(currentView);
                oldView.animate({
                    top: Ti.Platform.displayCaps.platformHeight * 2,
                    duration: args.duration
                }, function() {
                    CB.finishedPush(args, currentView, oldView, oldController);
                });
                break;
            case CB.UI.AnimationStyle.None:
                CB._mainContent.add(currentView);
                CB.finishedPush(args, currentView, oldView, oldController);
                break;
            default:
                CB._mainContent.add(currentView);
                CB.finishedPush(args, currentView, oldView, oldController);
                break;
        }
    },

    /**
     * the private function after run when the pushController finished
     * @param  {[type]} args          [description]
     * @param  {[type]} currentView   [description]
     * @param  {[type]} oldView       [description]
     * @param  {[type]} oldController [description]
     * @return {[type]}               [description]
     */
    finishedPush : function(args, currentView, oldView, oldController) {

        if (Alloy.CFG.hasCustomTabs && !args.noTabs) {
            var tab = args.controller;
            if (args.currTab) {
                tab = args.currTab;
            }
            CB.Tabs.setTab(tab);
        }
        //keep the previous controller
        if (args.action && args.action == UI.NavAction.KeepBack) {
            CB._previousController = oldView.name;
            CB.Debug.echo(CB._previousController, 299, 'core======');
        }
        oldController.onClose();
        // if (Ti.Platform.name !== 'android') {
        //     CB._mainContent.remove(oldView);
        // }
        args.callback && args.callback(CB._currentController);
        oldController = null;

        if (CB._mainContent.children.length > 2) {
            CB._mainContent.remove(CB._mainContent.children[CB._mainContent.children.length - 2]);
            //CB._mainContent.width = CB._contentWidth;
        }
        oldView = null;

        if (args.showInd) {
            CB.Util.actInd.hide();
        }
        //handle difference mainContent
        if (args.useInnerContent && CB._innerContent) {
            CB._mainContent = CB._innerContent;
        } else {
            CB._mainContent = mainContent;
        }
    },

    /**
     * Show the remote webserver error by error code
     * @param {[type]} errCode [description]
     */
    ShowError : function(errCode) {
        var errorMsg = '';
        switch (errCode) {
            case 110:
                errorMsg = CB.Util.L('noCatID');
                break;
            case 120:
                errorMsg = 'There is no share event id!';
                break;
            case 130:
                errorMsg = CB.Util.L('noFileObject');
                break;
            case 140:
                errorMsg = CB.Util.L('noDefineLanguage');
                break;
            case 160:
                errorMsg = CB.Util.L('paramsRequire');
                break;
            case 900:
                errorMsg = CB.Util.L('noRecordFound');
                break;
            case -100:
                errorMsg = CB.Util.L('networkErr');
                break;
            default:
                errorMsg = CB.Util.L('unKnowError');
        }

        var alertDialog = Ti.UI.createAlertDialog({
            title: CB.Util.L('error'),
            message: errorMsg,
            buttonNames: ['OK']
        });
        alertDialog.show();
    },

    /**
     * Logs all console data
     * @param {String} _severity A severity type (debug, error, info, log, trace, warn)
     * @param {String} _text The text to log
     */
    log: function(_severity, _text) {
        switch(_severity.toLowerCase()) {
            case "debug":
                Ti.API.debug(_text);
                break;
            case "error":
                Ti.API.error(_text);
                break;
            case "info":
                Ti.API.info(_text);
                break;
            case "log":
                Ti.API.log(_text);
                break;
            case "trace":
                Ti.API.trace(_text);
                break;
            case "warn":
                Ti.API.warn(_text);
                break;
        }

        var db = Ti.Database.open("ChariTi");

        var time = new Date().getTime();
        var type = UTIL.escapeString(_severity);
        var message = UTIL.escapeString(_text);

        db.execute("UPDATE log SET time = " + time + ", type = " + type + ", message = " + message + " WHERE time = (SELECT min(time) FROM log);");
        db.close();
    },
    /**
     * Global network event handler
     * @param {Object} _event Standard Titanium event callback
     */
    networkObserver: function(_event) {
        CB.log("debug", "CB.networkObserver");

        CB.Network.type = _event.networkTypeName;
        CB.Network.online = _event.online;

        Ti.App.fireEvent("CB:networkChange");
    },
    /**
     * Exit event observer
     * @param {Object} _event Standard Titanium event callback
     */
    exitObserver: function(_event) {
        CB.log("debug", "CB.exitObserver");
    },
    /**
     * Resume event observer
     * @param {Object} _event Standard Titanium event callback
     */
    resumeObserver: function(_event) {
        CB.log("debug", "CB.resumeObserver");
    },
    /**
     * Back button observer
     * @param {Object} _event Standard Titanium event callback
     */
    backButtonObserver: function(_event) {
        CB.log("debug", "CB.backButtonObserver");

        if(CB.modalStack.length > 0) {
            CB.removeChild(true);

            return;
        } else {
            var stack;

            if(CB.Device.isHandheld || !CB.hasDetail) {
                stack = CB.controllerStacks[CB.currentStack];
            } else {
                stack = CB.detailStacks[CB.currentDetailStack];
            }

            if(stack.length > 1) {
                CB.removeChild();
            } else {
                CB.MainWindow.close();
            }
        }
    }
}
module.exports = CB;