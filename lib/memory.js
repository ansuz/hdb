var level=require("level");
var ansuz=require("ansuz");

module.exports=function(db,en){
    var remember={
        db:db,
    };

// en holds your callbacks

// make sure callbacks that might get used are initialized
    [   'getError', // {msg,err,value,key}
        'getSuccess', // {msg,err,value,key}
        'putError', // {msg,err,value,key}
        'putSuccess', // {msg,err,value,key}
        'updateSuccess', // {msg,key,value}
        'undefinedUpdate', // {err,value}
        'newNode', // element
        'indexParseError', // 
        'nodeFetched', // Node
        ].forEach(function(e){
            en().place(e);
        });

// now you're free to set up new callbacks using
//  en('callbackName',function(arg){});

    var generic=remember.generic={};

    // key, msg, f(key,value,msg);
    generic.get=function(key,msg,f){
        db.get(key,function(e,value){
            if(e){
                en('getError')({
                    msg:msg,
                    err:e,
                    value:value,
                    key:key,
                });
                f(key,value,msg);
            }else{
                en('getSuccess')({
                    msg:msg,
                    err:e,
                    value:value,
                    key:key,
                });
                f(key,value,msg);
            }
        });
    };

    generic.put=function(key,value,msg){
        db.put(key,value,function(e,out){
            if(e){
                en('putError')({
                    msg:msg,
                    value:out,
                    err:e,
                    key:key,
                });
            }else{
                en('putSuccess')({
                    msg:msg,
                    value:out,
                    err:e,
                    key:key,
                });
            }
        });
    };

    // @param key (string)
    // @param New (value)
    // @param debug (message :string)
    // @param handler(old,new,save);

    generic.update=function(key,New,debug,handler){
        remember.generic.get(key,debug,function(k,old,msg){
            var save=function(value){
                if(typeof value != 'undefined'){
                    remember.generic.put(key,''+value,debug);
                    en('updateSuccess')({
                        key:key,
                        value:value,
                        msg:debug,
                    });
                }else{
                    en('undefinedUpdate')({
                        msg:debug,
                        key:key,
                        value:value,
                    });
                }
            };
            handler(old,New,save);
        });
    };

    // really high level
    remember.ips=function(ips,done){


        //generic.get=function(key,msg,f){


        generic.update('knownNodes',ips,'KNOWN IPS',function(Old,New,Save){
            if(typeof Old === 'undefined'){
                var a=[];
            }else{
                var a=JSON.parse(Old);
            }
            ips.forEach(function(ip){
                addIfAbsent(a,ip,en('newNode'));
            });
            Save(JSON.stringify(a));
            if(typeof done === 'function'){
                done(New);
            }
        });
    };

// FIXME what is using this?
    // just remember.node so far
    remember.integer=function(key,i){
        generic.put(key,''+i,"INTEGER");
    };

// FIXME what is using this?
    // remember.node
    remember.string=function(key,s){
        generic.put(key,s,"STRING");
    };

// FIXME Is this even necessary at this point?
    // remember.node 
    var oldNodeSchema={
        versions:'array',
        firstSeen:'integer',
        lastSeen:'integer',
        key:'string',
    };

// FIXME remember.node is by far the messiest part of the codebase
// factor like crazy.
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
            generic.put(makeKey('versions'),JSON.stringify(New.versions),"VERSIONS");
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

    // FIXME use generic.get
        var getOldData=function(){
            Object.keys(oldNodeSchema)
                .forEach(function(key){
                    var scheme=oldNodeSchema[key];
                    // get the data
                    var name=IP+'\\\\'+key;
                    db.get(name,function(e,out){
                        if(e){
                            // FIXME en('get ????
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

    // key, msg, f(key,value,msg);
    remember.knownNodes=function(callback){
        generic.get('knownNodes','KNOWN NODES', function(key,value,msg){
            if(value){
                try{
                    callback(JSON.parse(value));
                }catch(err){
                    en('indexParseError')({
                        err:err,
                        value:value,
                    });
                }
            }else{
                callback([]);
            }
        });
    };

    remember.commit=function(Node){
        /*  'Node' is an object. We can't do anything with the information
         *  unless it has an 'ip' attribute. (at this point I don't want to
         *  get into converting public keys into ipv6s, though I could).
         */

        // ip => ipv6
        if(typeof Node.ip != 'undefined'){
//            remember.ips([Node.ip]);
            generic.update('knownNodes',Node.ip,'KNOWN IPS',function(Old,New,Save){
                var a=JSON.parse(Old);
                addIfAbsent(a,New,en('newNode'));//,hooks.newNode);
                Save(JSON.stringify(a));
            });

            var prefix=Node.ip+'\\\\';

            // versions => erray
            if(typeof Node.versions != 'undefined'){
                generic.update(prefix+'versions',Node.versions, 'VERSIONS', function(Old,New,Save){
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
                generic.put(prefix+'key',Node.key,'PUBLIC KEY');
            }

            // firstSeen => int
            // generic.update=function(key,New,debug,handler){
            if(typeof Node.firstSeen != 'undefined'){
                generic.update(prefix+'firstSeen',Node.lastSeen, 'LAST SEEN', function(Old,New,Save){
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
                generic.update(prefix+'lastSeen', Node.lastSeen, 'LAST SEEN', function(Old,New,Save){
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
                    // FIXME getNode attribute error
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
                    en('nodeFetched')(result);
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
        // FIXME badDate filtered callback?
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
        // FIXME undefined versions, initializing... (callback)
        return [];
    }
};
