function closeWindow(){
    $.win3.close({animated: true});
}

$.btnClose.addEventListener('click',function(e){
    var win2 = Alloy.createController('win2').getView();
    Alloy.Globals.NavWin.openWindow(win2);
})