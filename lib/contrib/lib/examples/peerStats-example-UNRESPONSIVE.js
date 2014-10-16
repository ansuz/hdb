// If you don't pass it any arguments
// peerStats will simply print an array of peers
// with keys for each relevant statistic

// require("../peerStats.js")();

// you have the option of passing it a callback
// which the function will utilize instead of console.log

require("../peerStats.js")(function(stats){
  // we can print out a subset of all the peers
  // for instance: using the Array.filter method
  // we can select only the unresponsive peers

  console.log(stats.filter(function(p){
    return p.state=='UNRESPONSIVE'; 
  }));
});
