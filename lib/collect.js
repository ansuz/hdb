var collect = {};

// bundle functions from contrib

var p = "./contrib/lib/"; // save repeating the path
  collect.peerStats   = require(p+"peerStats.js");
  collect.publicToIp6 = require(p+"publicToIp6.js");
  collect.dumpTable   = require(p+"dumptable.js");

// bundle my functions

  collect.fixIPV6     = require("./padip.js");
  collect.myFC        = require("./findMyFC.js");

module.exports = collect;
