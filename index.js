var agml=require("agml");
var kad =require("kad");
var cjdns=require("cjdnsjs");

var hdb={
    myfc:cjdns.myfc
};

hdb.page=function(){/*<!DOCTYPE html>
<html>
<body>
<ul>
*/}.toString().slice(14,-3);

function asJSON(res){
    res.setHeader('Content-Type','application/json');
};

function pretty(res,f){
    f(function(j){
        res.end(JSON.stringify(j,null,2));
    });
};

function index(req,res){
    res.setHeader('Content-Type','text/html;charset=UTF-8');
    res.end(hdb.page);
};

function getPeers(req,res){
    asJSON(res);
    pretty(res,cjdns.peerStats);
};

function dumpTable(req,res){
    asJSON(res);
    pretty(res,cjdns.dumpTable);
};

var api=hdb.api={
    "":index,
    index:index,
    getPeers:getPeers,
    dumpTable:dumpTable,
};

Object.keys(api)
    .filter(function(x){return x;})
    .forEach(function(key){
        hdb.page+='<li><a href="/'+key+'">'+key+'</a></li>\n';
    });

module.exports=hdb;
