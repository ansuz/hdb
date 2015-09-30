var unmon=require("unmon");
var http=require("http");
var hdb=require("./index");

var address=hdb.myfc()[0];
var port=0xfc00;

// load all routes from the hdb api
Object.keys(hdb.api)
    .forEach(function(key){
        unmon.route(new RegExp('^/'+key+'$'),hdb.api[key]);
    });

unmon.route(/.*/,function(req,res){
    res.statusCode=404;
    res.end('404');    
});

var server=http.createServer(unmon.makeRouter(unmon.routes));

server.listen(port,address,function(){
    console.log("Server listening on http://[%s]:%s",address,port);
});
