'use strict';

var _ = require('underscore');

var valToStrBin = function(value) {
    return value.toString("base64");
}

var valToStrDefault = function(value) {
    return value.toString("UTF-8");
}

var handleData = function (type, value, converter) {
    console.log("using handler");

    if (type == 'hash') {
        _.map(Object.keys(value), function (elem, idx, list) {
            value[elem] = converter(value[elem]);
        });
        return value;
    } else if (type == 'zset' || type == 'list') {
        _.map(value, function (elem, idx, list) {
            elem.value = converter(elem.value);
        });
        return value;
    } else if (type == 'set') {
        return _.map(value, function (elem, idx, list) {
            return converter(elem);
        });
    }

    return JSON.stringify(converter(value));
}

var config = [
    { regex : "bin_.*", handler : function(type, value) { return handleData(type, value, valToStrBin); } },
    { regex : ".*", handler : function(type, value) { return handleData(type, value, valToStrDefault); } }
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

exports.redisValueToString = function (details) {
    var key = details.key;
    var value = details.value;
    var type = details.type;

    var handlerCB = getHandlerForKey(key);
    return handlerCB(type, value);
}

//console.log(exports.redisValueToString("bin_foo", new Buffer("\x65")));
//console.log(exports.redisValueToString("str_foo", "abcdef"));