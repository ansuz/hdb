// I don't like ipv6s with the extra zeroes taken out
// let's put them back in

var fixIPV6 = function(id){
    return id.split(":").map( // work on the sections between colons
        function(x){
            var rem = 4-x.length, // if there's any extra space
                pad = "";
            for(i=0;i<rem;i++){ // make something to fill it
                pad += "0";
            }
            return pad+x; // then tack on the original data
        }
    ).join(":"); // put the ipv6 back together
};

// :D

module.exports = fixIPV6;
