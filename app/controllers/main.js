exports.baseController = "base";

$.onLoad = function() {

    //init the Activity Indicator
    Alloy.Globals.CB.Util.actInd.init($.container);

    var firstController = Alloy.Globals.CB.getCurrentController();
    $.content.add(firstController.getView());

    $.container.animate({
        opacity: 1,
        duration: 250
    }, function() {
        firstController.onLoad();
    });
};

// Ti.App.addEventListener("tabChange", function(e) {
//      Alloy.Globals.CB.Debug.dump($.tabs., line, 'filename');
// });

Alloy.Globals.Tabs = $.tabs;
$.tabs && ($.tabs.on('change', function(e) {
    var ani = Alloy.Globals.CB.UI.AnimationStyle.FadeIn;
    var ac = null;
    var currTab = e.name;
    var isStatic = false;
    if(e.name == 'post') {
        ani = Alloy.Globals.CB.UI.AnimationStyle.SlideUp;
        ac = Alloy.Globals.CB.UI.NavAction.KeepBack;
        currTab = '';
        isStatic = true;
    }

    Alloy.Globals.CB.pushController({
        controller: e.name,
        action: ac,
        currTab: currTab,
        animation: ani,
        static: isStatic
    });
}));