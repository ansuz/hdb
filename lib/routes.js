var $$ = require("./collect.js");
var routes={};

var cache = {};
cache.peers={};
cache.dumpTable={};

routes.peers = function(req,res,next){
  // take note of the time now
  var timeNow=new Date().getTime();

  // if the cache is not initialized
  // or if it is out of date
  // you have to refresh it
  if(!cache.peers.last||cache.peers.last<=(timeNow - 60000)){
    console.log("peer cache is out of date, refreshing now");

    // this will grab the info and cache it
    $$.peerStats(function(stats){ 
      cache.peers.val=stats.map(function(peer){
        return peer.ipv6; // other stuff may be considered sensitive
      });
      // note the time
      cache.peers.last=timeNow;

      // send the response (time and value)
      res.send({
        peers:cache:peers.val
        ,time:timeNow
      });
    });
  }else{
    // if it's not expired, just send it
    res.send({
      peers:cache.peers.val
      ,time:cache.peers.last
    });
  }
};

routes.dumpTable = function(req,res,next){
  $$.dumpTable(function(table){
    res.send({table:table});
  });
}

module.exports = routes;
