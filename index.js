var bot = require("./lib/hiabot.js");

bot.init(); // init the bot, duh

var express = require("express"),
    app = express(),
    options = {
      debug:true
      ,address:""
      ,port:8086
      ,alert:function(){console.log("Server listening on %s:%s",options.address,options.port)}
    };

app.get("/", function (req, res) {
  res.sendFile(__dirname+"/public/index.html");
});

app.listen(options.port, options.address, options.alert);
