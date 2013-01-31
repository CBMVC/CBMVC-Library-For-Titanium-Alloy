exports.baseController = "base";
$.onLoad = function() {
    $.text.text = 'This a stream page!';
};


$.back.on('click', function(e) {
    Alloy.Globals.CB.pushController({
        controller: 'home',
        animation: Alloy.Globals.CB.UI.AnimationStyle.SlideRight
    });
});