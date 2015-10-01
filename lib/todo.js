function todo(AA,f,done){
    // AA is an argument array
    // make a clone of it
    var A=AA.slice(0);

    // f is the callback that gets executed once for each element
    // in the argument array
    // it must take an argument and a callback

    function next(){
        var L=A.length;
        if(L){
            var top=A.pop();
        }else{
            return done();
        }

        f(top,next);
    };
    return next;
};

module.exports=todo;
