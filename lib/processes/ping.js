// libs
var childProcess=require("child_process");
var exec=childProcess.exec;

var todo=require("../todo");

// to export
var ping={
    count:8,
};

var pingsix = ping.six=function ping6(ip,f){
    exec('ping6 -c '+ping.count+' '+ip,function(err,out){
        if(err){
            console.log(err);
            f();
        }else{
            f(out);
        }
    });
};

var pingall = ping.all = function(A,f,d){
    f=f||console.log;
    d=d||function(){ console.log("Done!");};
    var callback=function(i){
        pingsix(i,f);
    };
    todo(A,callback,d)();
};

var pingParse = ping.parse = function(out){
    if(out){
        return out
            .split('\n')
            .filter(function(x){return x;})
            .filter(function(line){
                return /64 bytes from /.test(line);
            }).map(function(result){
                return result.replace(/.*time=/,'').split(' ')[0];
            });
    } else{
        return false;
    }
};


module.exports=ping;
