exports.baseController = "base";

$.onLoad = function() {
	var data = $.getData();
	Alloy.Globals.CB.Debug.dump(data.test, 4, 'agenda');
	var tbl_data = [
        {
		title: 'Row 1'
	},
        {
		title: 'Row 2'
	},
        {
		title: 'Row 3'
	}
    ];

	$.table.setData(tbl_data);
	Alloy.Globals.CB.Debug.echo('===agenda loadig====', 13, 'agenda.js');
};

$.back.addEventListener('click', function(e) {
	Alloy.Globals.CB.pushController({
		controller: 'home',
		animation: Alloy.Globals.CB.UI.AnimationStyle.SlideRight,
		data: []
	});
});

$.table.addEventListener('click', function(ev) {
	Alloy.Globals.CB.pushController({
		controller: 'post',
		static: true,
		animation: Alloy.Globals.CB.UI.AnimationStyle.NavLeft
	});
});