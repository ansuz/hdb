var os = require("os");

var myfc = function(){
  // remember everything about your network interfaces
  var ips = os.networkInterfaces();

  // create an accumulator for your address(es)
  // dat extensability ;)
  var myfcs = [];

  // like a 'for-each'
  // probably wlan, eth, tun, etc..
  Object.keys(ips).map(function(x){ 
    ips[x].map(function(y){ // for each attribute of each element..
      if(y.address.match(/^fc/)){ // regex for a cjdns ip
        myfcs.push(y.address); // add to accumulator
      }
    });
  });
  return myfcs; // return an array of cjdns ips..
};

console.log(myfc());

module.exports = myfc;
