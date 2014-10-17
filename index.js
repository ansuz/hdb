//var bot = require("./lib/hiabot.js");

//bot.init(); // init the bot, duh

var $$=require("./lib/collect.js"); // I'm really lazy
var routes = require("./lib/routes.js");

var address=$$.fixIPV6($$.myFC()[0]);

var express = require("express"),
    app = express(),
    options = {
      debug:true
      ,address:address
      ,port:8086
      ,alert:function(){console.log("Server listening on http://[%s]:%s",options.address,options.port)}
    };

app.all('*', function(req, res, next) {
  // set headers for cross-origin resource sharing
  res.header("Access-Control-Allow-Origin", "*");

  // allow just GET and POST for now
  res.header("Access-Control-Allow-Methods","GET,POST");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  if(options.debug){
    console.log("x-forwarded-for: %s\nconnection address: %s\nurl: %s"
      ,req.headers['x-forwarded-for']||""
      ,req.connection.remoteAddress
      ,req.url)
  }
  next();
});

// lists all peers, ignoring current status
app.get(/^\/peers/,routes.peers); 
app.get(/^\/dumpTable/,routes.dumpTable);

app.get(/.*/, function (req, res) { // all get calls
  res.sendFile(__dirname+"/public/index.html");
});

app.post(/.*/,function(req,res){ // all post calls
  var posted =  JSON.parse(req.body);
  console.log(posted);
  res.send("hey thanks bud");
});

app.listen(options.port, options.address, options.alert);
