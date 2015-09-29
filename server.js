var unmon=require("unmon");
var http=require("http");
var hdb=require("./index");

var server=http.createServer(hdb.getPeers);

var address=hdb.myfc()[0];
var port=0xfc00;

server.listen(port,address,function(){
    console.log("Server listening on http://[%s]:%s",address,port);
});
