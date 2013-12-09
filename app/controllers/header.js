$.switchLang.addEventListener('click', function(e) {
	var lang = Alloy.Globals.CB.Util.loadObject('lang');
	if(lang == 'en') {
		Alloy.Globals.CB.Util.switchLang('zh');
	} else {
		Alloy.Globals.CB.Util.switchLang('en');
	}
	Alloy.Globals.CB.Util.actInd.setMessage(Alloy.Globals.CB.Util.L('loading'));
	Alloy.Globals.CB.pushController({
		//controller: 'home',
		animation: Alloy.Globals.CB.UI.AnimationStyle.None
	});
});