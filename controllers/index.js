$.main = Alloy.createController('main');

Alloy.Globals.CB.init({
    index: $.index,
    main: $.main.getView("content")
});

$.index.add($.main.getView());

$.main.onLoad();

$.index.open();
