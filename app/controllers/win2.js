function closeWindow(){
    $.win2.close({animated: true});
}

$.btnClose.addEventListener('click',function(e){
    $.win2.close();
})