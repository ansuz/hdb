var agml=require("agml");
var kad =require("kad");
var cjdns=require("cjdnsjs");

var lib=require("./lib/"),
    processes=lib.processes,
    todo=lib.todo,
    memory=lib.memory;

var census=processes.census,
    scrape=processes.ping;

var level=require("level");

var mis=require("mis");

var en=mis();

var remember=memory(level("./test.db"),en);

// Set up your hooks
///////////////////////////////////////////////////////////////////////////////

// {msg,err,key,value}
    // getError
en('getError',function(res){
    console.error('[%s] [GET ERROR] %s :: %s',getDate(), res.key, res.err);
});

    // putError
en('putError',function(res){
    console.error('[%s] [PUT ERROR] %s :: %s',getDate(),res.key,res.err);
});
    // getSuccess
en('getSuccess',function(res){
//    console.log('[%s] [GET SUCCESS] %s',getDate(),res.key);
// FIXME only knownNodes is using this so far?
});

    // putSuccess

// {msg,key,value}
    // updateSuccess
// {err,value}
    // undefinedUpdate
// Node
    // nodeFetched

// element
en('newNode',function(ip){
    console.log("[%s] Found new ip: [%s]", getDate(),ip);
});

// visitor {ip, url}
en('visitor',function(vis){
    console.log("[%s] We have a visitor: %s:%s", getDate(),vis.ip,vis.url);
    // try pinging the user?
});

///////////////////////////////////////////////////////////////////////////////

process.on('uncaughtException',function(e){
    console.log(e);
});

var cancel=processes.census.schedulePoll(function(result){
//    console.log(Object.keys(result));
    remember.ips(result.ips,function(all){
        // done callback?
    });
    result.ips.forEach(function(ip){
        result.nodes[ip].lastSeen=result.date;
        remember.node(result.nodes[ip]);
    });
},5000);

var hdb={
    myfc:cjdns.myfc,
    en:en,
};

var fc=cjdns.myfc()[0];

try{
    hdb.nodeinfojson=require("./public/.nodeinfo.json");
}catch(err){
    console.log(err);
    hdb.nodeinfojson={};
}

// helpers

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

function index(req,res,next){
    res.setHeader('Content-Type','text/html;charset=UTF-8');
    fs.readFile('./public/index.html','utf-8',function(e,out){
        if(e){
            res.statusCode=404;
            next();
        }else{
            Object.keys(api)
                .filter(function(x){return x;})
                .forEach(function(key){
                    out+='\t<li><a href="/'+key+'">'+key+'</a></li>\n';
                });
            res.end(out+'</ul>');
        }
    });
    return;
};

function endPoints(req,res){
    asJSON(res);
    var result={endpoints:[]};
    Object.keys(hdb.api)
        .forEach(function(end){
            result.endpoints.push('http://['+fc+']:64512/'+end);
        });
    res.end(JSON.stringify(result,null,2));
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

function getNode(req,res){
    // see if the url resembles '/getNode/<ip>'
    var url=req.url;
    var parts=req.url.split('/');
    var ip=/fc[0-9a-f:]{10,37}/.test(parts[2])?
        cjdns.zeropad(parts[2]):
        cjdns.zeropad(req.connection.remoteAddress);

    remember.getNode(ip,function(result){
        asJSON(res);
        result.ip=ip;
        res.end(JSON.stringify(result,null,2));    
    });
};

function knownNodes(req,res){
    asJSON(res);
    pretty(res,remember.knownNodes);
};

function nodeCount(req,res){
    asJSON(res);
    remember.knownNodes(function(result){
        res.end(JSON.stringify({
            nodeCount:result.length
        },null,2));
    });
};

var api=hdb.api={
    index:index,
    peerStats:peerStats,
    dumpTable:dumpTable,
    'nodeinfo.json':nodeinfojson,
    getNode:getNode,
    knownNodes:knownNodes,
    nodeCount:nodeCount,
    endPoints:endPoints,
};

function getDate(){
    return new Date().toISOString();
};

module.exports=hdb;
