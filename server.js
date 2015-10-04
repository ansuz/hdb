// http. duh.
var http=require("http");

// for making an app
var unmon=require("unmon");

// Hyperboria Database
var hdb=require("./index");

// listen on your ipv6
var address=hdb.myfc()[0];

// 64512, in case you don't know how to read
var port=0xfc00;

// report whenever someone visits
unmon.route(/.*/,function(req,res,next){
    hdb.en('visitor')({
        ip:req.connection.remoteAddress,
        url:req.url,
    });
    next();
}); 

// make a home route (human readable, listing the available functions
unmon.route(/^\/$/,hdb.api.index);

// load all routes from the hdb api
Object.keys(hdb.api)
    .forEach(function(key){
        unmon.route(new RegExp('^/'+key),hdb.api[key]);
    });

// provide a 404 that serves no matter what.
unmon.route(/.*/,function(req,res,next){
    res.statusCode=404;
    res.end('404');    
});

// construct the server
var server=http.createServer(unmon.makeRouter(unmon.routes));

// tell it to listen
server.listen(port,address,function(){
    console.log("Server listening on http://[%s]:%s",address,port);
});
