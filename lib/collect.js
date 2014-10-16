var collect = {};

var p = "./contrib/lib/";

collect.peerStats   = require(p+"peerStats.js");
collect.publicToIp6 = require(p+"publicToIp6.js");

module.exports = collect;
