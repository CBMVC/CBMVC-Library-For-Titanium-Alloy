//Tabs are 20% of screen width for handheld
var tabWidth = Ti.Platform.displayCaps.platformWidth/5;
//Ti.API.info('=======platformWidth:'+Ti.Platform.displayCaps.platformWidth);
//Ti.API.info('=======tabWidth:'+tabWidth);
/*var tabPositions = {
	home:0,
	agenda:tabWidth,
	post:tabWidth*2,
	stream:tabWidth*3,
	venue:tabWidth*4
};*/

var tabPositions = {
	home:0,
	agenda:'20%',
	post:'40%',
	stream:'60%',
	venue:'80%'
};


//set tab positions
$.home.left = tabPositions.home;
$.agenda.left = tabPositions.agenda;
$.post.left = tabPositions.post;
$.stream.left = tabPositions.stream;
$.venue.left = tabPositions.venue;

//add tab behavior
function doTab(name,offset,noEvent) {
	_.each(['home', 'agenda', 'post', 'stream', 'venue'], function(item) {
		if (item !== 'post') {
			if (name === item) {
				$[item+'Icon'].image = WPATH('/btn-'+item+'-pressed.png');
			}
			else {
				$[item+'Icon'].image = WPATH('/btn-'+item+'-default.png');
			}
		}
	});

	noEvent || ($.trigger('change',{
		name:name
	}));
}

$.home.on('click', function() {
	doTab('home', tabPositions.home);
});

$.agenda.on('click', function() {
    doTab('agenda', tabPositions.agenda);
});

//post is special, just fire event
$.postIcon.on('click', function() {
	$.trigger('change', {
		name:'post'
	});
});

$.stream.on('click', function() {
	doTab('stream', tabPositions.stream);
});

$.venue.on('click', function() {
	doTab('venue', tabPositions.venue);
});

//Public API to manually set navigation state
$.setTab = function(name) {
	doTab(name,tabPositions[name],true);
};


