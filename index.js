var agml=require("agml");
var kad =require("kad");
var cjdns=require("cjdnsjs");

function getPeers(req,res){
    cjdns.peerStats(function(peers){
        res.setHeader('Content-Type','application/json');
        res.end(JSON.stringify(peers,null,2));
    });
};

module.exports={
    getPeers:getPeers,
    myfc:cjdns.myfc,
};
