/**
 * @file overview This file contains the core framework class CBMVC_Alloy.
 * @author Winson  winsonet@gmail.com
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
    debug = require('debug'),
    loading = Alloy.createWidget('loading', 'widget'),
    indexContainer, langObj;


/**
 * Utility namespace
 */
var Utility = function() {};

Utility.init = function(iContainer) {
    indexContainer = iContainer;
    var lang = this.loadObject('lang');
    if(lang === null) {
        lang = Alloy.CFG.defaultLanguage;
        this.saveObject('lang', lang);
    }
    langObj = require('langs/' + lang);
};


/**
 * show the alert dialog box
 * @param {String} message, alert message
 * @param {String} title, alert box title
 */
Utility.alert = function(message, title) {
    var dialog = Ti.UI.createAlertDialog({
        ok: 'Ok',
        //cancel: 1,
        //buttonNames: ['Confirm', 'Cancel', 'Help'],
        message: message,
        title: title === undefined ? this.L('alert') : title
    }).show();
};

/**
 * show the alert dialog box
 * @param {String} message, alert message
 * @param {String} title, alert box title
 * @param {Object} callback function after click yes
 */
Utility.confirm = function(message, title, callback) {
    var dialog = Ti.UI.createAlertDialog({
        buttonNames: [this.L('yes'), this.L('no')],
        message: message,
        cancel: 1,
        title: title === undefined ? this.L('confirm') : title
    });

    dialog.addEventListener('click', function(e) {
        if(e.cancel === e.index || e.cancel === true) {
            return;
        }
        callback();
    });

    dialog.show();
};

/**
 * Trim string
 * @param {String} str
 * @returns a trim string
 */
Utility.trim = function(str) {
    str = str.replace(/^\s\s*/, ''), ws = /\s/, i = str.length;
    while(ws.test(str.charAt(--i)));
    return str.slice(0, i + 1);
};

/**
 * Uppercase first letter in string
 * @param {String} str
 * @returns an ucfirst string
 */
Utility.ucFirst = function(str) {
    str += '';
    var f = str.charAt(0).toUpperCase();
    return f + str.substr(1);
};

/**
 * switch cuttent language
 */
Utility.switchLang = function(lang) {
    this.saveObject('lang', lang);
    langObj = require('langs/' + lang);
    Ti.API.info('switch language:==========' + lang);
};

/*
 * get language with key
 */
Utility.L = function(key) {
    try {
        text = langObj[key];
        //Ti.API.info('text:==========' + text);
        if(text) {
            return text;
        }
        return key;
    } catch(e) {
        alert(e);
    }
};

/**
 * Check whether has the property by key
 *
 * @param {string}
 *            key, property's key
 * @returns a bool
 */
Utility.hasProperty = function( /* String */ key) {
    return Ti.App.Properties.hasProperty(key);
};
/**
 * Save the property
 *
 * @param {string}
 *            key, property's key
 * @param {Object}
 *            val, property's value(JSON format object)
 */
Utility.saveObject = function( /* String */ key, /* Object */ val) {
    Ti.App.Properties.setString(key, JSON.stringify(val));
};
/**
 * Gets property by key
 *
 * @param {String}
 *            property's key
 * @returns JSON format object
 */
Utility.loadObject = function( /* String */ key) {
    var value = Ti.App.Properties.getString(key);
    try {
        return JSON.parse(value);
    } catch(e) {
        return value;
    }
};

/**
 * Remove the property
 *
 * @param {string}
 *            key, property's key
 */
Utility.removeObject = function( /* String */ key) {
    Ti.App.Properties.removeProperty(key);
};


/*
 * Get absolute measurements
 * Reference :
 * http://docs.appcelerator.com/titanium/2.0/index.html#!/guide/Layouts,_Positioning,_and_the_View_Hierarchy
 */
Utility.px = function(dip) {

    var screen_density = Ti.Platform.displayCaps.getDpi();
    var actual_pixels = dip * screen_density / (this.isAndroid ? 160 : 163);

    //CB.Debug.echo(screen_density, 54);
    if(this.isTablet) {
        if(this.isAndroid) {
            actual_pixels = actual_pixels * 2;
        } else {
            actual_pixels = actual_pixels * 5;
        }
        //CB.Debug.echo('===is large screen after === ' + actual_pixels);
    }

    return actual_pixels;
};

Utility.cleanSpecialChars = function(str) {
    if(str === null) {
        return '';
    }
    if(typeof str === 'string') {
        return str.replace(/&quot;/g, '"').replace(/\&amp\;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#039;/g, "'");
    }
    return '';
};

/**
 * Show the activity indicator with cross platform
 */
Utility.actInd = {
    actIndWin: undefined,
    init: function(win) {
        win.actInd = Titanium.UI.createActivityIndicator({
            height: Ti.UI.FILL,
            width: Ti.UI.FILL,
            zIndex: 100
            //font : {fontFamily:'Helvetica Neue', fontSize:15,fontWeight:'bold'}
        });

        win.actInd.hide();
        win.actInd.isHide = true;

        if(this.isAndroid) {
            win.actInd.message = Utility.L('loading');
            win.add(win.actInd);
        } else {
            win.actInd.top = '-15%';

            win.actIndContainer = Ti.UI.createView({
                height: Ti.UI.FILL,
                width: Ti.UI.FILL
            });
            win.add(win.actIndContainer);

            win.actIndContainer.mainBg = Ti.UI.createView({
                height: Ti.UI.FILL,
                width: Ti.UI.FILL,
                backgroundColor: '#333',
                opacity: 0.8
            });
            win.actIndContainer.add(win.actIndContainer.mainBg);

            win.actIndContainer.actIndBg = Ti.UI.createView({
                backgroundColor: '#000',
                center: {
                    x: Ti.Platform.displayCaps.platformWidth / 2,
                    y: Ti.Platform.displayCaps.platformHeight / 2
                },
                width: 150,
                height: 100,
                borderRadius: 10
            });
            win.actIndContainer.add(win.actIndContainer.actIndBg);

            win.actIndContainer.actIndBg.loading = Ti.UI.createLabel({
                text: Utility.L('loading'),
                color: '#fff',
                left: '30%',
                bottom: '25%'
            });
            win.actIndContainer.actIndBg.add(win.actIndContainer.actIndBg.loading);

            win.actIndContainer.hide();

            win.actIndContainer.actIndBg.add(win.actInd);
            if(!this.isAndroid) {
                win.actInd.style = Titanium.UI.iPhone.ActivityIndicatorStyle.DARK;
            }
        }

        Utility.actInd.actIndWin = win;
    },
    show: function(message) {
        if(message) {
            if(!this.android) {
                Utility.actInd.actIndWin.actIndContainer.actIndBg.loading.text = message;
            } else {
                Utility.actInd.actIndWin.actInd.message = message;
            }
        }
        if(Utility.actInd.actIndWin && Utility.actInd.actIndWin.actInd.isHide) {
            Utility.actInd.actIndWin.actInd.isHide = false;
            Utility.actInd.actIndWin.actInd.show();
            if(!this.android) {
                Utility.actInd.actIndWin.actIndContainer.show();
            }
        }
    },
    setMessage: function(message) {
        if(!this.android) {
            Utility.actInd.actIndWin.actIndContainer.actIndBg.loading.text = message;
        } else {
            Utility.actInd.actIndWin.actInd.message = message;
        }
    },
    hide: function() {
        if(Utility.actInd.actIndWin && !Utility.actInd.actIndWin.actInd.isHide) {
            Utility.actInd.actIndWin.actInd.isHide = true;
            Utility.actInd.actIndWin.actInd.hide();
            if(!this.android) {
                Utility.actInd.actIndWin.actIndContainer.hide();
            }
        }
    }
};

/**
 * Progress bar
 * @type {Object}
 */
Utility.progressBar = {
    pbar: undefined,
    counter: 0,
    //files counter for batch download
    total: 1,
    //total items need to be progress
    show: function(args) {
        if(args === undefined) {
            args = {};
        }
        Utility.progressBar.message = args.msg || Alloy.Globals.CB.Util.L('progressMsg');
        Utility.progressBar.total = args.total || 1;
        var msg = Utility.format(Utility.progressBar.message, [1, Utility.progressBar.total]);
        if(Utility.isAndroid && parseFloat(Ti.version) < 3.0) {
            Utility.progressBar.pbar = Ti.UI.createActivityIndicator({
                location: Titanium.UI.ActivityIndicator.DIALOG,
                type: Titanium.UI.ActivityIndicator.DETERMINANT,
                message: msg,
                min: 0,
                max: args.max || 100,
                value: 1,
                zIndex: 100
            });
        } else {
            Utility.progressBar.pbar = Titanium.UI.createProgressBar({
                width: args.width || '80%',
                min: 0,
                max: args.max || 100,
                value: 1,
                height: args.height || 60,
                message: msg,
                top: args.top || '50%',
                color: args.color || '#fff',
                zIndex: 100
            });

            if(args.style) {
                Utility.progressBar.pbar.style = args.style;
            }

            if(args.font) {
                Utility.progressBar.pbar.font = args.font;
            } else {
                Utility.progressBar.pbar.font = {
                    fontSize: 14,
                    fontWeight: 'bold'
                };
            }
        }
        indexContainer.pview = Ti.UI.createView({
            width: Ti.UI.FILL,
            height: Ti.UI.FILL,
            opacity: 0.75,
            backgroundColor: '#232323'
        });
        indexContainer.pview.add(Utility.progressBar.pbar);
        indexContainer.add(indexContainer.pview);
        Utility.progressBar.pbar.show();
    },
    setCounter: function(counter) {
        Utility.progressBar.counter += counter;
        var msg = Utility.format(Utility.L('progressMsg'), [Utility.progressBar.counter, Utility.progressBar.total]);
        Utility.progressBar.pbar.message = msg;

    },
    setValue: function(val) {
        Utility.progressBar.pbar.value = val;
    },
    hide: function() {
        Utility.progressBar.pbar.hide();
        indexContainer.remove(indexContainer.pview);
        indexContainer.pview = null;
    }
};

/**
 * Delete all files under download folder
 * @return {bool} true for success, false for fail
 */
Utility.cleanDownloadFolder = function() {
    var directory = Ti.Filesystem.getFile(this.getAppDataDirectory(), Alloy.CFG.downloadFolder);
    if(directory.exists()) {
        directory.deleteDirectory(true);
        //debug.echo('==clean directory===' + directory.deleteDirectory(truetrue), 299, 'util.js');
    }
};
/**
 * Get the app's data directory
 * @return {string} app data directory
 */
Utility.getAppDataDirectory = function() {
    if(Utility.isAndroid) {
        if(Ti.Filesystem.isExternalStoragePresent()) {
            return Ti.Filesystem.externalStorageDirectory;
        } else {
            return Ti.Filesystem.tempDirectory;
        }
    }
    return Ti.Filesystem.applicationDataDirectory;
};

/**
 * Start loading
 * @param {string} message   ,loading message, default is "Loading...."
 */
Utility.startLoading = function(message) {
    indexContainer.add(loading.getView());
    if(message) {
        loading.setMessage(message);
    }
    loading.start();
};
/**
 * Stop loading
 */
Utility.stopLoading = function() {
    debug.echo('stop loading==========', 413, 'util');
    loading.stop();
    indexContainer.remove(loading.getView());
};

//=========string handler functions============
/**
 * Format the string with {0}{1} format
 */
Utility.format = function(formatted, args) {
    //var formatted = this;
    for(var i = 0; i < args.length; i++) {
        var regexp = new RegExp('\\{' + i + '\\}', 'gi');
        formatted = formatted.replace(regexp, args[i]);
    }
    return formatted;
};

/**
 * trimming space from both side of the string
 */
Utility.trim = function(str) {
    return str.replace(/^\s+|\s+$/g, "");
};

/**
 * trimming space from left side of the string
 */
Utility.ltrim = function(str) {
    return str.replace(/^\s+/, "");
};

/**
 * trimming space from right side of the string
 */
Utility.rtrim = function(str) {
    return str.replace(/\s+$/, "");
};
/**
 * pads left
 */
Utility.lpad = function(str, padString, length) {
    while(str.length < length) {
        str = padString + str;
    }
    return str;
};

/**
 * pads right
 */
Utility.rpad = function(str, padString, length) {
    while(str.length < length) {
        str = str + padString;
    }
    return str;
};
/**
 * [reverse the string]
 * @return {[type]} [description]
 */
Utility.reverse = function(str) {
    return str.split("").reverse().join("");
};

Utility.isTablet = Math.min(Ti.Platform.displayCaps.platformHeight, Ti.Platform.displayCaps.platformWidth) > 600;
Utility.isAndroid = Ti.Platform.osname == 'android';
Utility.osname = Ti.Platform.osname;

module.exports = Utility;