var $$ = require("./collect.js");
var routes={};

routes.peers = function(req,res,next){
  var cache={};
  var lastCached=new Date().getTime();
  console.log(lastCached);
  $$.peerStats(function(stats){
    res.send(stats.map(function(peer){
      return peer.ipv6; 
      }));
  });
};

routes.dumpTable = function(req,res,next){
  $$.dumpTable(function(table){
    res.send({table:table});
  });
}

module.exports = routes;
