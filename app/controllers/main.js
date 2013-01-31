exports.baseController = "base";

$.onLoad = function() {

    //init the Activity Indicator
    Alloy.Globals.CB.Util.actInd.init($.container);

    var firstController = Alloy.createController(Alloy.CFG.firstController);
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
    if(e.name == 'post') {
        ani = Alloy.Globals.CB.UI.AnimationStyle.SlideUp;
        ac = Alloy.Globals.CB.UI.NavAction.KeepBack;
    }

    Alloy.Globals.CB.pushController({
        controller: e.name,
        action: ac,
        noTabs: true,
        animation: ani
    });
}));