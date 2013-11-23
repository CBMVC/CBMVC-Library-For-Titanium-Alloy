exports.baseController = "base";

$.onLoad = function() {
    Alloy.Globals.CB.Debug.echo('===home loadig====', 4, 'home.js');
    $.text.text = Alloy.Globals.CB.Util.format(Alloy.Globals.CB.Util.L('text'),['just for test','==ok==']);
};

$.goNext.addEventListener('click', function(e) {
    Alloy.Globals.CB.pushController({
        controller: 'agenda',
        animation: Alloy.Globals.CB.UI.AnimationStyle.SlideLeft,
        //pass data to next controller
        data: [{
            'test': '123123123'
        }, {
            'test2': this
        }],
        showInd: false
    });
});

$.goN2.addEventListener('click', function(e) {
    Alloy.Globals.CB.Util.startLoading();
    Alloy.Globals.CB.pushController({
        controller: 'agenda',
        animation: Alloy.Globals.CB.UI.AnimationStyle.SlideUp,
        duration: 2000,
        callback:function(nextController){
            var nextview = nextController.getView();
            Alloy.Globals.CB.Util.stopLoading();
        }
    });
});

$.popup.addEventListener('click', function(e) {

    //clean download folder at first
    Alloy.Globals.CB.Util.cleanDownloadFolder();

    //***********************
    //download batch file
    //***********************
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
        //show the latest pdf file in popup window with webview, just for ios
        //android need to open in google doc online
        if (OS_IOS) {
            Alloy.Globals.CB.UI.createPopupWin({
                view: $.container,
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
            Alloy.Globals.CB.Debug.dump(downloadedFiles[2], 71, 'home.js');
            var file = Ti.Filesystem.getFile(downloadedFiles[2]);
            popView.content.setData(file);
            popView.add(popView.content);
        }
    });

    //***********************
    //download a single file
    //***********************
    //set progress bar total records
    /*Alloy.Globals.CB.Util.progressBar.show({ total: 1 });
    Alloy.Globals.CB.Net.downloadRemoteFile({
        url: 'http://www.coderblog.in/coderblogin.pdf',
        filename: 'coderblogin04.pdf',
        updateProgress: function(progressValue){
            Alloy.Globals.CB.Util.progressBar.setValue(progressValue);
        },
        complete: function(filename) {
            Alloy.Globals.CB.Util.progressBar.hide();
            Alloy.Globals.CB.UI.createPopupWin({
                view: $.container,
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
            Alloy.Globals.CB.Debug.echo(filename, 100, 'home.js');
            var file = Ti.Filesystem.getFile(filename);
            popView.content.setData(file);
            popView.add(popView.content);
        }
    });*/
});
