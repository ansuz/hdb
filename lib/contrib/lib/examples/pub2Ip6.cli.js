var convert = require("../publicToIp6.js");

try{
  process.argv.slice(2)
    .map(function(x){
      console.log("%s :: %s",x,convert(x));
  });
}catch(err){
  console.log("you need to pass at least one command line argument.\n\
Try: `pub2Ip6.cli.js <cjdnsPubKey>`");
};
