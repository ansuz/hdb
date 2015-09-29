var agml=require("agml");
var kad =require("kad");
var cjdns=require("cjdnsjs");

var hdb={

};

hdb.page=function(){/*<!DOCTYPE html>
<html>
<body>
<ul>
*/}.toString().slice(14,-3);

function index(req,res){
    res.setHeader('Content-Type','text/html;charset=UTF-8');
    res.end(hdb.page);
};

function getPeers(req,res){
    cjdns.peerStats(function(peers){
        res.setHeader('Content-Type','application/json');
        res.end(JSON.stringify(peers,null,2));
    });
};

var api={
    "":index,
    index:index,
    getPeers:getPeers,
};

Object.keys(api)
    .filter(function(x){return x;})
    .forEach(function(key){
        hdb.page+='<li><a href="/'+key+'">'+key+'</a></li>\n';
    });

module.exports={
    api:api,
    myfc:cjdns.myfc,
};
