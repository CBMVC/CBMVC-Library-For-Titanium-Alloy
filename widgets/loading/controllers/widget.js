$.loader.images = [
    WPATH('/load-cloud1.png'),
    WPATH('/load-cloud2.png'),
    WPATH('/load-cloud3.png'),
    WPATH('/load-cloud4.png'),
    WPATH('/load-cloud5.png'),
    WPATH('/load-cloud6.png'),
    WPATH('/load-cloud7.png'),
    WPATH('/load-cloud8.png'),
    WPATH('/load-cloud9.png')
];

exports.start = function() {
    $.loader.start();
};

exports.stop = function() {
    $.loader.stop();
};

exports.setMessage = function(key) {
    $.message.text = key;
};
