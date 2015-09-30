var agml=require("agml");
var kad =require("kad");
var cjdns=require("cjdnsjs");

var hdb={
    myfc:cjdns.myfc
};

try{
    hdb.nodeinfojson=require("./.nodeinfo.json");
}catch(err){
    console.log(err);
    hdb.nodeinfojson={};
}

// helpers

hdb.page=function(){/*<!DOCTYPE html>
<html>
<body>
<ul>
*/}.toString().slice(14,-3);

// set the content header to json
function asJSON(res){
    res.setHeader('Content-Type','application/json');
};

// a common callback to use across all different admin functions
function pretty(res,f){
    f(function(j){
        res.end(JSON.stringify(j,null,2));
    });
};

// actual routes here

function index(req,res){
    res.setHeader('Content-Type','text/html;charset=UTF-8');
    res.end(hdb.page);
};

function nodeinfojson(req,res){
    asJSON(res);
    res.end(JSON.stringify(hdb.nodeinfojson,null,2));
};

function peerStats(req,res){
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
    peerStats:peerStats,
    dumpTable:dumpTable,
    'nodeinfo.json':nodeinfojson,
};

Object.keys(api)
    .filter(function(x){return x;})
    .forEach(function(key){
        hdb.page+='<li><a href="/'+key+'">'+key+'</a></li>\n';
    });

module.exports=hdb;
