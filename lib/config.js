'use strict';

var _ = require('underscore');
var handleBinaryData = function (value) {
    var ret = {
        "b64": value.toString("base64")
    };
    return JSON.stringify(ret);
}

var handleStringData = function (value) {
    return value.toString("UTF-8");
}

var config = [
    { regex : "bin_.*", handler : handleBinaryData },
    { regex : ".*", handler : handleStringData }
]

var getHandlerForKey = function (key) {
    var matcher = function (configObj) {
        var elem = configObj.regex;
        var pattern = new RegExp(elem);
        return pattern.test(key);
    };

    var configObj = _.find(config, matcher);
    return configObj.handler;
}

exports.redisValueToString = function (key, value) {
    var handlerCB = getHandlerForKey(key);
    return handlerCB(value);
}

//console.log(exports.redisValueToString("bin_foo", new Buffer("\x65")));
//console.log(exports.redisValueToString("str_foo", "abcdef"));