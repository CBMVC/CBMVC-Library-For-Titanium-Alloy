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
    _ = require('alloy/underscore'),
    util = require('util');

/**
 * UI namespace
 */
var UI = function() {};

UI.viewScrollr = require("viewScrollr");

// Zoom a view and dissipate it
UI.zoom = function(view, callback) {
    var matrix = Ti.UI.create2DMatrix({
        scale: 1.5
    });

    view.animate({
        transform: matrix,
        opacity: 0.0,
        duration: 250
    }, function() {
        callback && callback();
    });
};

// undo the zoom effect
UI.unzoom = function(view, callback) {
    var matrix = Ti.UI.create2DMatrix({
        scale: 1
    });

    view.animate({
        transform: matrix,
        opacity: 1,
        duration: 250
    }, function() {
        callback && callback();
    });
};

UI.fauxShadow = function() {
    return Ti.UI.createView({
        bottom: 0,
        height: '1dp',
        backgroundColor: '#9a9a9a'
    });
};

/*
 * Create a reusable filter header for insertion into a view hierarchy Example:
 * var header = new ui.HeaderView({ title:'localizationIdString',
 * optionWidth:90, //converted to dp options: [ 'optionOneKey', 'optionTwoKey' ],
 * viewArgs: { //object properties for View proxy, if desired } });
 *
 * //e.selection contains the option key value that was selected by the user
 * header.addEventListener('change', function(e) {
 *  })
 *
 */
UI.HeaderView = function(options) {
    var self = Ti.UI.createView(_.extend({
        backgroundColor: 'transparent',
        height: '35dp'
    }, options.viewArgs || {}));

    var fauxShadow = new FauxShadow();
    self.add(fauxShadow);

    var indicator = Ti.UI.createView({
        top: 0,
        right: (options.optionWidth * (options.options.length - 1)) + 'dp',
        bottom: '1dp',
        width: options.optionWidth + 'dp',
        backgroundColor: '#ffce00'
    });
    self.add(indicator);

    if(options.hasTitle) {
        var title = Ti.UI.createLabel({
            text: options.title,
            color: '#373e47',
            left: '10dp',
            width: Ti.UI.SIZE,
            height: Ti.UI.SIZE,
            font: {
                fontFamily: 'Quicksand-Bold',
                fontSize: '14dp'
            }
        });

        self.add(title);
    }

    // Create a styled menu option

    function option(t, idx) {
        var rightOffset = (options.optionWidth * (Math.abs(idx - (options.options.length - 1)))) + 'dp';

        var v = Ti.UI.createView({
            width: options.optionWidth + 'dp',
            right: rightOffset
        });

        var l = Ti.UI.createLabel({
            text: L(t),
            color: '#fff',
            height: Ti.UI.SIZE,
            width: Ti.UI.SIZE,
            font: {
                fontFamily: 'Quicksand-Bold',
                fontSize: '14dp'
            }
        });
        v.add(l);

        // option selection
        v.addEventListener('click', function() {
            indicator.animate({
                right: rightOffset,
                duration: 250
            }, function() {
                self.fireEvent('change', {
                    selection: t
                });
            });
        });

        return v;
    }

    // Create menu options for each option requested
    for(var i = 0, l = options.options.length; i < l; i++) {
        self.add(option(options.options[i], i));
    }

    // Add common shortcut to addEventListener
    self.on = function(ev, cb) {
        self.addEventListener(ev, cb);
    };

    // Shift indicator to desired index
    self.goTo = function(idx) {
        var rightOffset = (options.optionWidth * (Math.abs(idx - (options.options.length - 1)))) + 'dp';
        indicator.right = rightOffset;
    };

    return self;
};

/**
 * Create and show a popup modal window
 * @param  {object} args [description]
 *      args.view, the view with popup window parameter and elements ect.
 *      args.winWidth, the popup window's width, default is 90% of platform width
 *      args.winHeight, the popup window's height, default is 90% of platform height
 *      args.borderRadius, set the popup window's border radius
 *      args.borderWidth, set the popup windows's border width
 */
UI.createPopupWin = function(args) {
    if(!args.winHeight) {
        args.winHeight = Ti.Platform.displayCaps.platformHeight * 0.90;
    }
    if(!args.winWidth) {
        args.winWidth = Ti.Platform.displayCaps.platformWidth * 0.90;
    }

    args.view.popBgView = Titanium.UI.createView({
        backgroundColor: '#000',
        height: args.view.height,
        width: args.view.width,
        opacity: 0.8
    });
    args.view.add(args.view.popBgView);

    args.view.popWin = Titanium.UI.createWindow({
        // backgroundColor : '#fff',
        // opacity : 0.8
    });

    args.view.popWin.popView = Titanium.UI.createView({
        // borderWidth : 8,
        borderColor: '#999',
        height: args.winHeight,
        width: args.winWidth,
        // borderRadius : 10,
        backgroundColor: '#fff'
    });

    if(args.borderRadius) {
        args.view.popWin.popView.borderRadius = args.borderRadius;
    }

    if(args.borderWidth) {
        args.view.popWin.popView.borderWidth = args.borderWidth;
    }

    if(util.isAndroid) {
        args.view.popWin.add(args.view.popWin.popView);
        args.view.popWin.open({
            animate: true
        });
        args.view.popWin.popView.addEventListener('postlayout', function(e) {
            createCloseButton(args.view);
        });
    } else {
        var t = Titanium.UI.create2DMatrix();
        t = t.scale(0);

        args.view.popWin.transform = t;

        // create first transform to go beyond normal size
        var t1 = Titanium.UI.create2DMatrix();
        t1 = t1.scale(1.1);
        var a = Titanium.UI.createAnimation();
        a.transform = t1;
        a.duration = 300;

        // when this animation completes, scale to normal size
        a.addEventListener('complete', function() {
            // Titanium.API.info('here in complete');
            var t2 = Titanium.UI.create2DMatrix();
            t2 = t2.scale(1.0);
            args.view.popWin.animate({
                transform: t2,
                duration: 300
            });

            createCloseButton(args.view);
        });

        args.view.popWin.add(args.view.popWin.popView);
        args.view.popWin.open(a);

    }

    createCloseButton = function(view) {
        view.popWin.popCloseBtn = Ti.UI.createButton({
            top: '3%',
            right: '5%',
            width: 30,
            height: 30,
            zIndex: 100,
            backgroundImage: 'btn-close.png'
        });

        // Ti.API.info(view.popWin.popView.rect.height);
        view.popWin.popView.removeEventListener('postlayout', function() {});
        // view.popWin.popCloseBtn.center =
        // {x:(CB.screenWidth-view.popWin.popView.width)/2,y:(CB.screenHeight-view.popWin.popView.rect.height)/2};
        /*
         * view.popWin.popCloseBtn.center = { x : view.popWin.popView.rect.x, y :
         * view.popWin.popView.rect.y + Ti.Platform.displayCaps.platformHeight *
         * 0.01 };
         */

        view.popWin.popCloseBtn.addEventListener('click', function() {
            closePopupWin(view);
        });
        view.popWin.add(view.popWin.popCloseBtn);
    };
    closePopupWin = function(view) {
        view.remove(view.popBgView);
        if(util.isAndroid) {
            view.popWin.popCloseBtn.hide();
            view.popWin.close({
                animate: true
            });
        } else {
            var t3 = Titanium.UI.create2DMatrix();
            t3 = t3.scale(0);
            view.popWin.close({
                transform: t3,
                duration: 300
            });
        }
    };
    return args.view.popWin.popView;
};
/**
 * Create a dropdown list within a web view
 * @param {Object} view, which view need to add the dropdown list object
 *
 * view.ddlArgs = {
 *  id : ddl object id,
 *  innerFontSize: webview ddl font size(default is 12),
 *  top: ddl top,
 *  left: ddl left,
 *  width: ddl width,
 *  height: ddl height,
 *  items :[
 *      //'the ddl option items'
 *      {text:'test', value:1}
 *  ],
 *  callback : the call back function
 * }
 */
UI.createDropDownList = function(ddlArgs) {
    var html = "<html><head>" + "<meta name='viewport' content='user-scalable=0, initial-scale=1, maximum-scale=1, minimum-scale=1'>" + "</head><body style='background-color:transparent ;margin:0;padding:0'>";
    html += "<select id='{0}' style='width:100%; height:100%;font-size: {1}px; '>";
    for(var itemIndex in ddlArgs.items) {
        html += util.format("<option value='{0}' {1}><span style='font-size:8px'>{2}</span></option>",[ddlArgs.items[itemIndex].value, ddlArgs.items[itemIndex].selected, ddlArgs.items[itemIndex].text]);
    }
    html += "</select>";
    html += "<script type='text/javascript'>";
    html += "document.getElementById('{0}').onchange = function(){ Titanium.App.fireEvent('app:set{0}',{value:this.value}); };";
    html += "</script>";
    html += "</body></html>";

    html = util.format(html, [ddlArgs.id, ddlArgs.innerFontSize === undefined ? '12' : ddlArgs.innerFontSize]);
    if(ddlArgs.top === undefined && util.isAndroid) {
        ddlArgs.top = '10dp';
    }

    if(ddlArgs.height === undefined) {
         ddlArgs.height = Ti.Platform.displayCaps.platformHeight * 0.055;
    }
    var ddlObj = Ti.UI.createWebView({
        top: ddlArgs.top,
        left: ddlArgs.left,
        width: ddlArgs.width,
        height: Ti.Platform.displayCaps.platformHeight * 0.055,
        scalesPageToFit: true,
        html: html
    });

    Ti.App.addEventListener("app:set" + ddlArgs.id, function(e) {
        ddlArgs.callback(e);
    });

    ddlObj.close = function(){
        Ti.App.removeEventListener("app:set" + ddlArgs.id, function(e) {
            ddlArgs.callback(e);
        });
    };
    return ddlObj;
};


/**
 * [createSettingView create the setting view]
 * @param {view object} [arg.container] [the container need to be add the rows, null will create a new one]
 * @param {string} arg.top , the top of setting view
 * @param  {settingRow object} arg.rows     the rows data need to add
 * @return {[type]}     [description]
 */
UI.createSettingView = function(arg) {
    var container;
    if (arg.container) {
        container = arg.container;
    } else {
        //create a new one if there is no define the container
        container = Ti.UI.createView({
            bottom: arg.bottom?arg.bottom:'10dp',
            backgroundColor: '#fff',
            borderRadius: 10,
            left: '20dp',
            right: '20dp',
            height: Ti.UI.SIZE,
            layout: 'vertical'
        });
    }
    //add the rows inot the view
    var index = 1;
    _.each(arg.rows, function(row) {
        Alloy.Globals.CB.Debug.dump(row, 97, 'setting');
        container.add(row);
        //add a line
        if (index < arg.rows.length) {
            var lineView = Ti.UI.createView({
                width: Ti.UI.FILL,
                height: '1dp',
                backgroundColor: '#ccc'
            });
            container.add(lineView);
        }
    });

    return container;
};

/**
 * [createSettingRow create the setting row]
 * @param  {[string]} arg.text.title ,the text in row
 * @param  {[string]} arg.text.subtitle ,the sub title in row
 * @param {string} arg.backgroundColor , the backgroundColor of the row, default is '#fff'
 * @param {string} arg.text.top , the top of the text, default is '5dp'
 * @param {string} arg.text.left , the left of the text, default is '10dp'
 * @param {string} arg.text.color , the color of the text, default is '#000'
 * @param {string} arg.text.fontSize , the fontSize of the text, default is '16dp'
 * @param {string} arg.text.subtop , the top of the sub title, default is '10dp'
 * @param {string} arg.text.subright , the right of the sub title, default is '28dp'
 * @param {string} arg.text.subcolor , the color of the sub title, default is '#000'
 * @param {string} arg.text.subfontSize , the fontSize of the sub title, default is '14dp'
 * @param {string} arg.data , the data need to pass to the next page
 * @param {string} arg.hasChild, it will show the arrow button if that true
 * @param {string} arg.hasCheckBox, it will show the hasCheckBox button if that true
 * @param {string} arg.checkBoxValue, the checkBox default value
 * @param {string} arg.checkBoxChange, checkBox change callback event
 * @param {string} arg.pushController , the next controller need to show when click the row
 */
UI.createSettingRow = function(arg) {
    var row = Ti.UI.createView({
        //id: arg.id,
        isRow: true,
        width: Ti.UI.FILL,
        height: arg.height?arg.height:'40dp',
        backgroundColor: arg.backgroundColor ? arg.backgroundColor : '#fff',
        data: arg.data
    });

    if (arg.text) {
        var title = Ti.UI.createLabel({
            text: arg.text.title,
            top: arg.text.top ? arg.text.top : '5dp',
            left: arg.text.left ? arg.text.left : '10dp',
            color: arg.text.color ? arg.text.color : '#000',
            font: {
                fontSize: arg.text.fontSize ? arg.text.fontSize : '16dp'
            }
        });
        row.add(title);

        if (arg.text.subtitle) {
            var subtitle = Ti.UI.createLabel({
                text: arg.text.subtitle,
                top: arg.text.subtop ? arg.text.subtop : '10dp',
                right: arg.text.subleft ? arg.text.subleft : '28dp',
                color: arg.text.subcolor ? arg.text.subcolor : '#000',
                font: {
                    fontSize: arg.text.subfontSize ? arg.text.subfontSize : '14dp'
                }
            });
            row.add(subtitle);
        }
    }

    if (arg.hasChild) {
        var btnArrow = Ti.UI.createButton({
            right: '10dp',
            top: '15dp',
            width: '12dp',
            height: '15dp',
            backgroundImage: '/images/arrow.png'
        });
        row.add(btnArrow);
    }

    if (arg.hasCheckBox) {
        var checkBox = Ti.UI.createSwitch({
            value: arg.checkBoxValue,
            right: '10dp'
        });

        if (OS_ANDROID) {
            checkBox.style = Ti.UI.Android.SWITCH_STYLE_CHECKBOX;
        }

        checkBox.addEventListener('change', function(e) {
            arg.checkBoxChange && arg.checkBoxChange(e);
        });

        row.add(checkBox);
    }

    row.addEventListener('click', function(e) {
        //change the bg color only start with row
        if (e.source.isRow) {
            e.source.animate({
                backgroundColor: 'blue',
                duration: 100
            }, function() {
                e.source.backgroundColor = 'blue';
                e.source.animate({
                    backgroundColor: '#fff',
                    duration: 100
                }, function() {
                    e.source.backgroundColor = '#fff';
                })
            });
        }

        if (arg.pushController) {
            Alloy.Globals.CB.pushController({
                controller: arg.pushController,
                animation: Alloy.Globals.CB.UI.AnimationStyle.NavLeft,
                data: e.source.data
            });
        }
    });

    return row;
};

/*
 * Animation style
 * all animations are support ios and android
 */
UI.AnimationStyle = {
    //no animation
    None: 0,
    //fade in animation
    FadeIn: 1,
    //fade out animation
    FadeOut: 2,
    //navigate with left animation, it's same with ios navigation group animation
    NavLeft: 3,
    //navigate with right animation, it's same with ios navigation group animation
    NavRight: 4,
    //slide with left animation
    SlideLeft: 5,
    //slide with right animation
    SlideRight: 6,
    //slide with up animation, just like a popup modle windows
    SlideUp: 7,
    //slide with down animation, just like close a modle windows
    SlideDown: 8
};
/**
 * Navigation action, just for pushController method
 */
UI.NavAction = {
    //no action
    None: 0,
    //keep the previous controller
    KeepBack: 1,
    //just back to previous controller
    Back: 2
};


module.exports = UI;