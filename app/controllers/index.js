// $.main = Alloy.createController('main');

// Alloy.Globals.CB.init({
//     index: $.index,
//     main: $.main.getView("content")
// });

// $.index.add($.main.getView());

// $.main.onLoad();

// $.index.open();

$.button.addEventListener('click',function(e){
    openBlueWindow();
})

Alloy.Globals.NavWin = $.index;

var openBlueWindow = function(e) {
    var win3 = Alloy.createController('navwin1').getView();
    $.index.openWindow(win3, {
        animated: true,
        displayHomeAsUp: true
    });
}



// $.index.open();



var ABH, actionBarHelper;

function doopen(e) {
    if (OS_ANDROID) {
        // we set the library only when the activity is available
        ABH = require('actionbarhelper').actionBarHelper;
        actionBarHelper = new ABH($.win1);
        actionBarHelper.reloadMenu(); // this forces the actionbar to show menu options from XML
        actionBarHelper.setTitle('I dare you to change me');
    }
}

function changeTitle() {
    actionBarHelper.setTitle('This is the new title');
}

function setUpButtonUp() {
    actionBarHelper.setUpAction(function() {
        alert('Hey, stop clicking!');
    })
}

function setUpButtonDn() {
    actionBarHelper.setUpAction();
}

function setIcon() {
    actionBarHelper.setIcon('/appicon2.png');
}

function setBackground() {
    actionBarHelper.setBackgroundImage('/appicon2.png');
}

function show() {
    actionBarHelper.show();
}

function hide() {
    actionBarHelper.hide();
}

function onsaveclick(e) {
    alert('Clicked save');
}

function onimageclick(e) {
    alert('Clicked Image');
}

function onaboutclick(e) {
    alert('Clicked about');
}

function oncreditsclick(e) {
    alert('Clicked credits');
}

function opennewwin() {
    Alloy.createController('win2').getView().open();
}

$.index.open();