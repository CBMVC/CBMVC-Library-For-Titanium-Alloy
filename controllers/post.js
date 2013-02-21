exports.baseController = "base";

$.ddlObj = null;

$.onLoad = function() {
    $.postText.text = 'This a post page!';

    //define a dropdown list data array
    var ddlData = [];
    //push data into this array
    ddlData.push({
        text: 'Yes',
        value: 1
    }, {
        text: 'No',
        value: 0,
        selected: 'selected'
    });
    //setup the dropdown list data
    var ddlArgs = {
        id: 'test',
        top: '15%',
        left: '1%',
        width: '20%',
        height: '75%',
        items: ddlData,
        //pass the dropdown list data
        callback: function(ddlEvent) {
            //implement the callback function
            Alloy.Globals.CB.Debug.dump(ddlEvent, 26, 'post.js');
        }
    };
    //create a dropdown list
    $.ddlObj = Alloy.Globals.CB.UI.createDropDownList(ddlArgs);
    $.postContainer.add($.ddlObj);
};

$.getBlogData.addEventListener('click', function(e) {
    var xmlArgs = {
        method: 'wp.getPost',
        //method: 'wp.getComments',
        startLevel: 3,
        params:[
           {name:'blog_id', type:'int', value:'1'},
           {name:'username', type:'string', value:'username'},
           {name:'password', type:'string', value:'password'},
           {name:'post_id', type:'int', value:'1967'}
       ],
       callback:function(data){
            Alloy.Globals.CB.Debug.dump(data, 63, 'post');
       }
    };
     Alloy.Globals.CB.WP.xmlRPC(xmlArgs);

});

$.back.addEventListener('click', function(e) {
    Alloy.Globals.CB.pushController({
        action: Alloy.Globals.CB.UI.NavAction.Back,
        animation: Alloy.Globals.CB.UI.AnimationStyle.SlideDown,
        data: []
    });
});

$.onClose = function() {
    if($.ddlObj) {
        $.ddlObj.close();
    }
    Alloy.Globals.CB.Debug.echo('====on post close====', 45, 'post.js');
};