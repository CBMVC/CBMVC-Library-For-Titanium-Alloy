exports.baseController = "base";

$.onLoad = function() {
    var data = $.getData();
    Alloy.Globals.CB.Debug.dump(data.test, 4, 'agenda');
};

$.back.addEventListener('click', function(e) {
    Alloy.Globals.CB.pushController({
        controller: 'home',
        animation: Alloy.Globals.CB.UI.AnimationStyle.NavRight,
        data: []
    });
});