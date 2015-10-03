var level=require("level");
var ansuz=require("ansuz");

module.exports=function(db){
    var remember={
        db:db,
    };

/*
 * set up hooks
 * bind to them with `remember.on('hook',function(msg,index){ console.log(msg); });`
 * 
 * what hooks?
 *  - get error
 *  - put error
 *  - update success
 *  - newNode
 *  - undefinedUpdate
 *  - indexParseError
 */

    var hooks={};
    var stacks={};

    remember.on=function(hook,callback){
        if(typeof callback == 'undefined'){
            if(hook && stacks[hook]){
                return hooks[hook];
            }else{
                return false;
            }
        }else{
            // set up a stack and push the callback to it.
            stacks[hook]=[];
            stacks[hook].push(callback);
            hooks[hook]=function(arg){ stacks[hook].forEach(function(cb,i){
                    cb(arg,i);
                });
                return hooks[hook];
            };
        }
    };

    remember.log={
        errors:true,
        puts:false,
        gets:false,
        parse:true,
        ips:true,
    };

    remember.generic={};

    remember.generic.get=function(key,msg,f){
        db.get(key,function(e,value){
            if(e){
                if(remember.log.errors){
                    console.error("[REMEMBER.%s GET ERROR]: %s",msg,e);
                }
                f(key,value,msg);
            }else{
                if(remember.log.puts){
                    console.log("[REMEMBER.%s GET SUCCESS]: %s",msg,key);                
                }
                f(key,value);
            }
        });
    };

    remember.generic.put=function(key,value,msg){
        db.put(key,value,function(e,out){
            if(e){
                if(remember.log.errors){
                    console.error("[REMEMBER.%s PUT ERROR]: %s",msg,e);
                }
            }else{
                if(remember.log.puts){
                    console.log("[REMEMBER.%s PUT SUCCESS]: %s",msg,key);
                }
            }
        });
    };

    // @param key (string)
    // @param New (value)
    // @param debug (message :string)
    // @param handler(old,new,save);
    remember.generic.update=function(key,New,debug,handler){
        remember.generic.get(key,debug,function(k,old,msg){
            var save=function(value){
                if(typeof value != 'undefined'){
                    remember.generic.put(key,''+value,debug);
                }else{
                    if(hooks.undefinedUpdate){
                        hooks.undefinedUpdate(key);
                    }
                }
            };
            handler(old,New,save);
        });
    };

    // really high level
    remember.ips=function(ips,done){
        remember.generic.update('knownNodes',ips,'KNOWN IPS',function(Old,New,Save){
            if(typeof Old === 'undefined'){
                var a=[];
            }else{
                var a=JSON.parse(Old);
            }
            ips.forEach(function(ip){
                addIfAbsent(a,ip,hooks.newNode);
            });
            Save(JSON.stringify(a));
            if(typeof done === 'function'){
                done(New);
            }
        });
    };

    remember.integer=function(key,i){
        remember.generic.put(key,''+i,"INTEGER");
    };

    remember.string=function(key,s){
        remember.generic.put(key,s,"STRING");
    };

    var oldNodeSchema={
        versions:'array',
        firstSeen:'integer',
        lastSeen:'integer',
        key:'string',
    };

    remember.node=function(node){
        // ip : 39 chars, useless ✓
        // versions : array of ints
        // key : publicKey string ✓
        // firstSeen : intString ✓
        // lastSeen : intString ✓

        // all new nodes are guaranteed to have:
            // ip: a zeropadded cjdns ipv6
            // protocolVersion:
            // key: a cjdns public key
            // date

        var IP=node.ip;

        var Old={};
        var New={};
        var Done={};

        var makeKey=function(attr){
            return IP+'\\\\'+attr;
        };

        var writeAssimilatedData=function(){
            // New should be guaranteed to include:
                // versions (an array of integers)
                // firstSeen (an integer)
                // lastSeen (an integer)
                // key (a string)

            // first and last seen
            ['firstSeen','lastSeen']
                .forEach(function(attr){
                    remember.integer(makeKey(attr),''+New[attr]);
                });
            // the key
            remember.string(makeKey('key'),node.key);

            // versions
            remember.generic.put(makeKey('versions'),JSON.stringify(New.versions),"VERSIONS");
        };

        
        var prepareData=function(){
            if(Old.versions){
                if(typeof Old.versions == 'string'){
                    Old.versions=JSON.parse(Old.versions);
                }
                Old.versions=parseVersions(Old.versions);
                addIfAbsent(Old.versions,parseInt(node.protocolVersion),function(v){
                    console.log("%s upgraded to a new version: %s",node.ip,v);
                });
                New.versions=Old.versions;
            }else{
                New.versions=[node.protocolVersion];
            }
            New.lastSeen=node.lastSeen;

            // firstSeen: int
            New.firstSeen=oldestDate([Old.lastSeen,Old.firstSeen,New.lastSeen,New.firstSeen,node.lastSeen]);
            if(typeof New.firstSeen == 'string'){
                New.firstSeen = parseInt(New.firstSeen);
            }
            
            New.key=Old.key||New.key;
            writeAssimilatedData();
        };
        
        var doneGettingOld=function(){
            if(Object.keys(Done).length == 4){
                prepareData();
            }
        };

        var getOldData=function(){
            Object.keys(oldNodeSchema)
                .forEach(function(key){
                    var scheme=oldNodeSchema[key];
                    // get the data
                    var name=IP+'\\\\'+key;
                    db.get(name,function(e,out){
                        if(e){
    //                        console.log("No value found for %s",name);
                        }else{
                            Old[key]=out;
                        }
                        Done[key]=true;
                        doneGettingOld();
                    });
                });
        };

        getOldData();
    };

    remember.knownNodes=function(callback){
        db.get('knownNodes',function(e,out){
            if(out){
                var R;
                try{
                    R=JSON.parse(out);
                }catch(err){
                    if(hooks.indexParseError){
                        hooks.indexParseError(err);
                    }
                }
                callback(R);
            }else{
                callback([]);
            }
        });
    };

    remember.commit=function(Node){
        /*  'Node' is an object. We can't do anything with the information
         *  unless it has an 'ip' attribute. (at this point I don't want to
         *  get into converting public keys into ipv6s, though I could).
         *
         *  
         *
         */

        // ip => ipv6
        if(typeof Node.ip != 'undefined'){
//            remember.ips([Node.ip]);
            remember.generic.update('knownNodes',Node.ip,'KNOWN IPS',function(Old,New,Save){
                var a=JSON.parse(Old);
                addIfAbsent(a,New);//,hooks.newNode);
                Save(JSON.stringify(a));
            });


            var prefix=Node.ip+'\\\\';

            // versions => erray
            if(typeof Node.versions != 'undefined'){
                remember.generic.update(prefix+'versions',Node.versions, 'VERSIONS', function(Old,New,Save){
                    return Save(JSON.stringify([]));

                    var a,b;

                    if(typeof Old != 'undefined'){
                        // Old exists, so...
                        try{
                            a=JSON.parse(Old);                            
                        }catch(err){
                            console.log(err);
                     //       Save();
                            a=[];
                        }
                    }

                    //remove invalid entries
                    a=a.filter(function(v){
                        return !(ansuz.isArray(v));
                    });

                    a=parseVersions(a);

                    if(b){
                        try{
                            b=JSON.parse(New);
                        }catch(err){
                            console.log("VERSION PARSE ERROR: %s => %s",err,New);


                            try{
                                b=parseInt(New);
                                addIfAbsent(a,b);
                                return Save(JSON.stringify(a));
                            }catch(err){
                                console.log("VERSION INT PARSE ERROR %s",New);
                                console.log(err);
                                return Save(JSON.stringify(a));
                            }
                        }
                    }
                });
            }

            // key => 'string'
            if(typeof Node.key != 'undefined'){
                remember.generic.put(prefix+'key',Node.key,'PUBLIC KEY');
            }

            // firstSeen => int
            // remember.generic.update=function(key,New,debug,handler){
            if(typeof Node.firstSeen != 'undefined'){
                remember.generic.update(prefix+'firstSeen',Node.lastSeen, 'LAST SEEN', function(Old,New,Save){
                    var a=parseInt(Old),
                        b=parseInt(New);
                    if(isNaN(a)){
                        if(isNaN(b)){
                            return Save();
                        }else{
                            return Save(b);
                        }
                    }
                    Save(oldestDate([a,b]));
                });
            }

            // lastSeen => int
            if(typeof Node.lastSeen != 'undefined'){
                remember.generic.update(prefix+'lastSeen', Node.lastSeen, 'LAST SEEN', function(Old,New,Save){
                    var a=parseInt(Old),
                        b=parseInt(New);

                    if(isNaN(a)){
                        if(isNaN(b)){
                            return Save();
                        }else{
                            return Save(b);
                        }
                    }
                    if(a > b){
                        return Save(a);
                    }else if (a == b){
                        return Save(b);
                    }else if (a < b){
                        return Save(b);
                    }else{
                        return Save();
                    }                   
               });
            }
        }
    };

    remember.getNode=function(paddedIP,callback){
        var result={};
        var count=0;

        ['versions','key','firstSeen','lastSeen'].forEach(function(attr){
            var name=paddedIP+'\\\\'+attr;

            db.get(name,function(e,out){
                if(e){
                    result[attr]=e;
                    //console.log(e);
                }else{
                    switch(attr){
                        case 'versions':
                            if(typeof result.versions == 'string'){
                                result.versions=JSON.parse(result.versions);
                            }
                            break;
                        case 'firstSeen':
                            result.firstSeen=parseInt(result.firstSeen);
                            break;
                        case 'lastSeen':
                            result.lastSeen=parseInt(result.lastSeen);
                            break;
                        case 'key':
                            break;
                    }
                    result[attr]=out;
                }
                count++;
                if(count == 4){
                    callback(result);
                }
            });
        });
    };
    return remember;
};

// expects an array and an element
// optionally takes a callback if the element will be added.
function addIfAbsent(A,e,f){
    if(A && A.indexOf(e) == -1){
        if(f){
            f(e);
        }
        A.push(e);
    }
};

// expects an array, returns the smallest valid number
function oldestDate(A){
    return A.filter(function(x){
        return !isNaN(parseInt(x));
    }).reduce(function(a,b){
        return Math.min(a,b);
    });
};

function parseVersions(versions){
    if(ansuz.isArray(versions)){
        return versions.map(function(v){
            return (typeof v == 'number')?v:parseInt(v);
        });
    }else{
        return [];
    }
};
