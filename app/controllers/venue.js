exports.baseController = "base";
$.onLoad = function() {
    $.text.text = 'This a venue page!';
};


$.back.addEventListener('click', function(e) {
    Alloy.Globals.CB.pushController({
        controller: 'home',
        animation: Alloy.Globals.CB.UI.AnimationStyle.SlideLeft
    });
});