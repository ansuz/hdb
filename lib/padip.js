// I don't like ipv6s with the extra zeroes taken out
// let's put them back in

var fixIPV6 = function(id){
    return id.split(":").map(
        function(x){
            var rem = 4-x.length,
                pad = "";
            for(i=0;i<rem;i++){
                pad += "0";
            }
            return pad+x;
        }
    ).join(":");
};

module.exports = fixIPV6;
