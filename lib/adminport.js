var dgram=require("dgram"),
    bencode=require("bencode"),
    util=require("util"), // formerly sys
    crypto=require("crypto"),
    path=require("path"),
    fs=require("fs");

/*  This module is a rewrite of the current nodejs cjdns admin api
    It will implement the same methods, but use saner techniques to do so.
    If all goes well it will be a swappable alternative to the existing library
    oh, and documentation is a huge priority
    since we obviously accomplish very little without it.   */

var gen=require("./ansuzjs/lib/gen.js");
var van=require("./ansuzjs/lib/van.js");

var CJDNS=function(config){
  var admin={
    password:"" // get password from config
    ,oldconf:"" // the original config at time of launch
    ,config:"" // current config
  };  
  // send method
  // parseConfig
  // saveConfig
  // sendAuth
  // subscribe
  // unsubscribe  
};
