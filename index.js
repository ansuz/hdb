var agml=require("agml");
var kad =require("kad");
var cjdns=require("cjdnsjs");
var unmon=require("unmon");
var http=require("http");

var server=http.createServer(function(req,res){
    cjdns.peerStats(function(peers){
        res.setHeader('Content-Type','application/json');
        res.end(JSON.stringify(peers,null,2));
    });
});

server.listen(8004,cjdns.myfc()[0]);
