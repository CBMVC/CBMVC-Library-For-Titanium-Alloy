# CBMVC_Alloy - A Common Library for Titanium Alloy

# Overview
This is a library for Titanium Alloy. The CB is mean CodeBlog, this is my website(www.coderblog.in).
and it's base on commonJS structure.

The example project here shows you how to build navigate betweens pages (with animation), and how to use the helper functions.

With this library, please update your titanium sdk to 3.0. (it's seem there is a animation issue with ios if you use 3.1 sdk)

# Feature

1. Base on Alloy, use a namespace for the structure, it can avoid the memeory leak.
2. The switch page animation can support fade in, fade out; navigation left,right; slide left, right, up and down direction，it's support IOS & Android.
3. Support create a html dropdown list component and a popup window
4. Support multiple languages. You can change the language immediately within the app.
5. Support an common activity indicator for ios and android
6. Support download a single remote file and batch remote files
7. Support a progress bar for show the file download status
8. Support to use a comstom loading widget
9. Support the object debug, can set the debug message show in which line and file
10. Support the top, center and bottom layout (reference to [Codestrong](https://github.com/appcelerator/Codestrong))
11. Support comstom tabs (reference to [Codestrong](https://github.com/appcelerator/Codestrong))
12. (ver1.1) Support wordpress xml-rpc

# Version 1.5
1. new function for create setting view
2. add datejs lib
3. add viewScrollr lib
4. add youtube player lib
5. other bugs fixed

# Version 1.2

fixed SlideDown and None Animation style cannot show the page
add a feature to support a `static page`:

### What's static page?

The static page will save the previous page status, because in the CBMVC, it will create a new controller when you push to the page each time, so you have to init the data in `onLoad` function every time, but if you have a table listing page and detail page, you should not want to load the data every time in listing page when it back from detail page, so you can use a statice page for keep the previous page status just for turn back it.

### How to use static page?

You can pass a parameter `static` and set is `true` to next page use the `Alloy.Globals.CB.pushController` function, for example, the page A is listing page, it need to push to page B for show the detail, and B will back to A without `onLoad` function:

page A push to B :

    Alloy.Globals.CB.pushController({
        controller: 'B',
        animation: Alloy.Globals.CB.UI.AnimationStyle.NavLeft,
        static: true
    });

Page B go back function:

    Alloy.Globals.CB.pushController({
        action: Alloy.Globals.CB.UI.NavAction.Back,
        animation: Alloy.Globals.CB.UI.AnimationStyle.NavRight
    });

The difference with `KeepBack` just it don't need to run the `onLoad` init function again.

You can find the detail example within `agenda` table list push to `post` controller in the source code.


# Version 1.1.221

support Alloy 1.0 ([Alloy 1.0 changed](https://github.com/appcelerator/alloy/blob/master/CHANGELOG.md#backbone-events-api-removed-from-view-proxies-and-controllers))

# Version 1.1

1. add: support wordpress xml-rpc format, the detail example please take a look the `/app/controllers/post.js` line 38
2. bug fixed:

    1) Activity Indicator always load on android ([issue#1](https://github.com/CBMVC/CBMVC-Library-For-Titanium-Alloy/issues/1))

    2) There is a blink issue when switch controller on android ([issue#2](https://github.com/CBMVC/CBMVC-Library-For-Titanium-Alloy/issues/2))

    3) The first controller will load twice when first time start the app ([issue#3](https://github.com/CBMVC/CBMVC-Library-For-Titanium-Alloy/issues/3))

# How it work

CBMVC_Alloy is base on Alloy and commonJS, there is only one namespace in the structure, all library files are in the `app/lib` folder.

The following is a list of directories and files that can be found in a CBMVC_Alloy:

1. `app/lib/core.js`    it's a core file that include all CBMVC_Alloy namespace
2. `app/lib/debug.js`   it's a debug helper , you can call dump or echo within this file
3. `app/lib/net.js`     it's a network helper , you can call http request and file download function in this file
4. `app/lib/ui.js`      it's a ui helper , you can generate the ui component within this file
5. `app/lib/util.js`    it's a utility helper , you can use many useful functions in this file

All helper functions are require in core.js file, and the namespace is under the Alloy.Globals, you can find the following code in the `app/alloy.js`:

    Alloy.Globals.CB = require('core');

So when you use the CBMVC_Alloy functions, just call `Alloy.Globals.CB.Namespace.function`, for example, following is call an `echo` function within `Debug` namespace:

    Alloy.Globals.CB.Debug.echo('just for testing', 10, 'index.js');

There are 4 namespaces in the library:

1. **CB.Debug**,    the debug helper namespace
2. **CB.Net**,      the network helper namespace
3. **CB.UI**,       the ui helper namespace
4. **CB.Util**,     the utility helper namespace

**for each controller, you must inherit the base controller**, for example in the home controller, there is a code should be like following:

`exports.baseController = "base";`

Because there is a `onLoad()` and `onClose()` function in the base controller, you can over write or just ignore them, after that, you can use `$.getData();` for get the data from previous controller:

    //over write the onLoad function and get the data
    $.onLoad = function() {
        var data = $.getData();
    };

# Usage

1. Switch between the controllers:
---
You can easy switch the controller with `CB.pushController` method, there are 7 parameters in an array with this method:

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
     * @param  {enum} args.static           , set the static page
     */
    CB.pushController = function(args);

#### How to use the parameters:
1.`{string} args.controller`, just a controller name within Alloy, etc. "agenda"

2.`{enum} args.animation`, the animation type, this is an enum object defined in UI namespace:

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

3.`{int} args.duration`, set the animation duration, by default, it's set in `config.json`:

`"animationDuration": 500`

4.`{JSON} args.data`, pass data to next controller, it's a JSON format:

    Alloy.Globals.CB.pushController({
        controller: 'agenda',
        animation: Alloy.Globals.CB.UI.AnimationStyle.NavLeft,
        //pass data to next controller
        data: [{
            'test': '123123123'
        }, {
            'test2': this
        }]
    });

Get the data within next controller:

    $.onLoad = function() {
        var data = $.getData();
        Alloy.Globals.CB.Debug.dump(data.test, 4, 'agenda');
    };

5.`{Function} args.callback`, a callback function after switch to next controller

6.`{bool} args.noTabs`, if you use the tabs widget, then you need to use this to handle the tabs. you can set this default in the `config.json` file:

`"hasCustomTabs":true`

If set `hasCustomTabs` to `true` in config.json file, it will run the `setTab()` method within the tabs widget, that's means when you push to next controller, it will auto set current tab and its name same with the controller name, for example, the tab name is `home`, and the current controller is `home` too, the after switch to `home`, the home tab will be highlight and set to current.

But in some situation, you may not want to set the current tab, then just set `args.noTabs:true` is ok.

7.`{string} args.currTab`, set the current tab by tab's name

8.`{bool} args.showInd`, whether need to show an activity indicator when switch to next controller

9.`{enum} args.action`, this is an enum object to set the push action, you can remember the previous one and just back to it:

        /*
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

For example, there are 5 tabs: A,B,C,D,E, when you click C will use `SlideUp` to open a controller, and you need to use `SlideDown` to close it, suppose it need to return the previous tab when it close, so you need to keep the previous in this situation:

    //current tab is B, then when click C , should be keep B information:
    $.C.on('click',function(e){
        Alloy.Globals.CB.pushController({
            controller: 'popup',
            action: Alloy.Globals.CB.UI.NavAction.KeepBack, //need to keep the previous one
            noTabs: true, //don't need to set tab, because it's a slide up animation
            animation: Alloy.Globals.CB.UI.AnimationStyle.SlideUp
        });
    });

In the popup controller close event:

    $.btnClose.on('click',function(e){
        Alloy.Globals.CB.pushController({
            action: Alloy.Globals.CB.UI.NavAction.Back, //it's will auto back to the previous one
            animation: Alloy.Globals.CB.UI.AnimationStyle.SlideDown
        });
    });


2. How to use the **[Debug]** helper:
---

There are 2 debug methods in the library:

1.Alloy.Globals.CB.Debug.echo:

It's just echo the message or simple variable, you can pass the current line and page in it, this is useful for track where's the debug code when you set many debug points in multiple pages

2.Alloy.Globals.CB.Debug.dump:

    /**
     * General dump the object
     * @param {Object} o, dump object
     * @param {int} line, the line of debug object
     * @param {String} page, the page  which debug message show
     * @param {String} type, debug type, support Titanium debug type:
     *       info: display message with [INFO] style in console
     *       warn: display message with [WARN] style in console (default)
     *       error: display message with [ERROR] style in console
     */
    Debug.dump = function(o, line, page, type);`

This dump is very useful to show the js object, even a view,windows or other Ti object.

By default, the debug method only work in development environment, you can set it in the `config.json`:

    "env:development": {
        "isDebug": true
    }

3. How to use the **[Net]** helper
---
There are 3 methods in the **[Net]** helper:

1.Alloy.Globals.CB.Net.request:

    /**
     * Standard HTTP Request
     * @param {Object} opts
     * @example The following are valid options to pass through:
     *  opts.timeout    : int Timeout request
     *  opts.type       : string GET/POST
     *  opts.data       : mixed The data to pass
     *  opts.url        : string The url source to call
     *  opts.onerror    : funtion A function to execute when there is an XHR error
     *  opts.onload     : callback function in onload event
     */
    Net.request = function(opts);

You can create a http request with this method, following is a simple to get data from server:

    var requestObj = {
        url: 'http://www.coderblog.in/api/login',
        data:{
            'userId':'001',
            'pwd':'123456'
        }
        onerror: function(d) {
            alert(d);
        },
        onload: function(data) {
            if(data.success){
                //redirect to success login page
                Alloy.Globals.CB.pushController({
                    controller: 'home',
                    animation: Alloy.Globals.CB.UI.AnimationStyle.FadeIn
                });
            }else{
                alert('User Id or Password is incorrect!');
            }
        }
    };
    Net.request(requestObj);

2.Alloy.Globals.CB.Net.downloadRemoteFile:

        /*
         * download a remote file
         * fileInfo.url              : url for download the remote file
         * fileInfo.filename         : file name for saved
         * fileInfo.updateProgress   : update download progressbar
         * fileInfo.complete         : complete function after download
         */
        Net.downloadRemoteFile = function(fileInfo);

This method only for download a remote file. You need to set the default download folder in `config.json`:

`"downloadFolder":"download"`

For ios, it's will save the file into application Data Directory (`Ti.Filesystem.applicationDataDirectory`), for android, it's will save the file into external Storage Directory (`Ti.Filesystem.externalStorageDirectory`).

Following to show how to download a file:

    //init and show the progress bar at first, set the total download files
    Alloy.Globals.CB.Util.progressBar.show({ total: 1 });

    //start download the file
    Alloy.Globals.CB.Net.downloadRemoteFile({
        url: 'http://www.coderblog.in/coderblogin.pdf',
        filename: 'coderblogin01.pdf',
        updateProgress: function(progressValue) {
            //update the progress bar
            Alloy.Globals.CB.Util.progressBar.setValue(progressValue);
        },
        complete: function(filename) {
            //hide the progress bar after downloaded
            Alloy.Globals.CB.Util.progressBar.hide();

            //it's will return the full file path and name
            //to do something with the filename
        }
    });

3.Alloy.Globals.CB.Net.downloadBatchFiles:

        /**
         * Batch download files
         * @param  {Array} files ,
         * [
         *    {url: file url},
         *    {name: file name}
         * ]
         * @param  {Function} a callback function when download all files
         */
        Net.downloadBatchFiles = function(files, callback, downloadedFiles);

Of course you can just use the `Net.downloadBatchFiles` for batch download the files(even only download one file). Following to show how to use it:

    //set the batch files url and name
    var files = [{
        name: 'coderblogin01.pdf',
        url: 'http://www.coderblog.in/coderblogin.pdf'
    }, {
        name: 'coderblogin02.pdf',
        url: 'http://www.coderblog.in/coderblogin.pdf'
    }, {
        name: 'coderblogin03.pdf',
        url: 'http://www.coderblog.in/coderblogin.pdf'
    }];

    //set progress bar total records
    Alloy.Globals.CB.Util.progressBar.show({ total: files.length });

    Alloy.Globals.CB.Net.downloadBatchFiles(files,function(downloadedFiles){
        Alloy.Globals.CB.Util.progressBar.hide();
        //downloadedFiles is an array include all files full path,
        //you can do something with this
    });

You can find the download function's deatil demo in `app/controller/home.js`.

4. How to use the **[UI]** helper
---

1.Create a popup window:

You can use `Alloy.Globals.CB.UI.createPopupWin` for easy create a popup window:

        /**
         * Create and show a popup modal window
         * @param  {object} args [description]
         *      args.view, the view with popup window parameter and elements ect.
         *      args.winWidth, the popup window's width, default is 90% of platform width
         *      args.winHeight, the popup window's height, default is 90% of platform height
         *      args.borderRadius, set the popup window's border radius
         *      args.borderWidth, set the popup windows's border width
         */
        UI.createPopupWin = function(args);

Following is a sample:

    Alloy.Globals.CB.UI.createPopupWin({
        view: $.container,  //the current view container
        borderRadius: 10,
        borderWidth: 8
    });
    var popView = $.container.popWin.popView;
    popView.content = Ti.UI.createWebView({
        top: Ti.Platform.displayCaps.platformHeight * 0.03,
        left: Ti.Platform.displayCaps.platformHeight * 0.03,
        width: '90%',
        height: '85%'
    });

    popView.content.html = "<html><body>Hello world!</body></html>"
    popView.add(popView.content);

Of course you can use any elements to show in the popup window, I just use a webview for demo. And you can find the detail demo in the `app/controller/home.js`

2.Create a dropdown list within a webview:

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
        UI.createDropDownList = function(ddlArgs);

You can use `Alloy.Globals.CB.UI.createDropDownList` for easy create a dropdown list element, it's base on a webview, so it can support android and ios.

Following is a sample:

    //define a dropdown list data array
    var ddlData = [];
    //push data into this array
    ddlData.push({
        text : 'Yes',
        value : 1
    }, {
        text : 'No',
        value : 0,
        selected : 'selected'
    });
    //setup the dropdown list data
    var ddlArgs = {
        id : 'test',
        top : '15%',
        left : '1%',
        width : '20%',
        height : '75%',
        items : ddlData,    //pass the dropdown list data
        callback : function(ddlEvent) {
            //implement the callback function
            Alloy.Globals.CB.Debug.dump(ddlEvent, 26, 'post.js');
        }
    };
    //create a dropdown list
    $.ddlObj = Alloy.Globals.CB.UI.createDropDownList(ddlArgs);
    $.postContainer.add($.ddlObj);

You can find the detail demo in `app/controller/post.js`

5. How to use the **[Util]** helper
---

There are many useful functions in the **[Util]** helper and most of them are very simple, you just take a look the `app/lib/util.js` file and should be fine, so I just show you how to use the `Alloy.Globals.CB.Util.actInd` and `Alloy.Globals.CB.progressBar` in this document:

1.Alloy.Globals.CB.Util.actInd

To create an activity indicator, you need to init it in your first startup controller at first:

    //in the main.js controller
    Alloy.Globals.CB.Util.actInd.init($.container);

After that, you can use `Alloy.Globals.CB.Util.actInd.show();` in anywhere, and call `Alloy.Globals.CB.Util.actInd.hide();` for hide the activity indicator. Of course you can use `Alloy.Globals.CB.Util.actInd.setMessage('Loading...')` for set the message, default is `Utility.L('loading')` get from the `app/lib/langs/en.js` .

2.Alloy.Globals.CB.Util.processBar

You can use the progress bar to show file download status

a. set the total records need to be handle:

    `Alloy.Globals.CB.Util.progressBar.show({ total: 10 });`

b. update the progress value when it's progressing:

    `Alloy.Globals.CB.Util.progressBar.setValue(progressValue);`

c. hide the progress bar after the event is done:

    `Alloy.Globals.CB.Util.progressBar.hide();`

That's all, you can find the detail demo in `app/controller/home.js` and `app/lib/net.js`.

6. How to use multiple languages
---

All of the languages file are put into `app/lib/langs` folder, and it use a JSON format for the language key + value:

For example in the `app/lib/langs/en.js` file:

    Languages = {
        loading : 'Loading...'
    }

You can use `Alloy.Globals.CB.Util.L('loading');` for get the value. Following to show how to use it:

a. set the default language in the `config.json`:

`"defaultLanguage": "en"`

b. use `Alloy.Globals.CB.Util.switchLang('cn');` to switch or set the current language, and the language code name must be same with your language file name under the `app/lib/langs` folder

c. use `Alloy.Globals.CB.Util.loadObject('lang');` get current lang.

You can find the detail demo in the `app/controller/header.js`

7. How to config the library function:
---

As you can see, there are some setting need to set in the `config.json`, following is the setting description:

    "global": {
        "firstController": "home",  //set the main controller
        "mainController": "main",
        "hasCustomTabs":true,       //whether use custom tabs widget
        "defaultLanguage": "en",    //default language
        "animationDuration": 800,   //the default animation duration
        "downloadFolder":"download",//the default download file save folder
        "msgType": "info"           //the default debug message tye
    },
    "env:development": {
        "isDebug": true             //whether is debug mode
    },

That's all, hople you will like this library, and I will keep to improve it when I have time :)

And welcome to my blog :

CoderBlog : [http://www.CoderBlog.in](http://www.CoderBlog.in)


License
------------------------------------------

MIT License http://www.opensource.org/licenses/mit-license.php

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.


