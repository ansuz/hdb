var cjdns=require("cjdnsjs");

var census={};

var poll=census.poll=function(callback){
    // grab some useful information about your node.
    // pathfinder tree otherwise ignores information about you
    cjdns.whoami(function(my){
        census.me=my; 

        var myinfo={
            // pathFinderTree uses 'key'
            key: my.publicKey,
            // pft uses 'protocolVersion, a string
            protocolVersion: my.version,
            // 'ip' is consistent across functions
            // cjdns returns it already zeropadded
            ip: my.ip,
        };

        // what then? PATHFINDERTREE!
        var parser=treeParser(function(result){
            (callback||console.log)(result);
        },myinfo);

        cjdns.pathFinderTree(parser);
    });
};

var verify=function(result){
    var ips=result.ips;
    var islands=ips.filter(function(ip){
        return result.nodes[ip].peers.length == 0;
    });
//    console.log("Found %s islands:\n%s",islands.length,islands);
};

var treeParser=function(done,myinfo){
    return function(tree){
        // SETUP
        ////////////////////
        var nodes={},
            ips=[];
        var result={
            count:1,
            ips:ips,
            nodes:nodes,
            date: new Date().getTime(),
        };

// HELPERS
///////////////////////////////////

        var finished=false;
        var finish=function(){
            if(!finished){
                finished=true;
                done(result);
            }
        };

        var continuing=1;

        var more=function (){ result.count+=1; continuing+=1; };

        var less=function(){
            if(!continuing){
                finish(result);
            }else{
                continuing--;
            }
        };

        var handleBranch=function(link,parent){
            if(link.peers.length){
                link.peers.forEach(function(peer){
                    var ip=peer.ip;
                    ips.push(ip);
                    nodes[ip]={
                        key:peer.key,
                        ip:ip,
                        protocolVersion:peer.protocolVersion,
                        // peers reported by pathFinderTree are not reliable
                        // use some other API call
                        peers:[],
                    };

                    more();
                    handleBranch(peer,link.ip);
                });
            }
            less();
        };
///////////////////////////////////

// BUSINESS
///////////////////////////////////

        // assimilate your own info
        ips.push(myinfo.ip);
        nodes[myinfo.ip]={};

        Object.keys(myinfo).forEach(function(attr){
            nodes[myinfo.ip][attr]=myinfo[attr];
        });
        nodes[myinfo.ip].peers=[];

        if(tree.next.length){
            tree.next.forEach(function(next){
                handleBranch(next,tree.ip);
            });
        }
    };
};

census.schedulePoll=function(F,ms){
    var interval=setInterval(function(){
        census.poll(F);
    },ms);
    return function(){
        clearInterval(interval);
    };
};

module.exports=census;
