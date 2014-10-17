var ajest = function(url, callback){  // a tiny little ajax function
  var xmlHTTP = window.XMLHttpRequest?
    new XMLHttpRequest():
    new ActiveXObject("MicrosoftXMLHTTP");
  xmlHTTP.onreadystatechange = function(){
    if(this.readyState == 4 && this.status == 200)
      callback(this.responseText);
  }
  xmlHTTP.open("GET", url, true);
  xmlHTTP.send();
};

$(function() {
  ajest('http://uc.transitiontech.ca:8086/dumpTable',function(k){
    var K=JSON.parse(k);
    document.writeln(
      "<ol>PEW</ol>".replace("PEW",
      K.table.map(function(x){
        return "<li>"+x.ip+"</li>";
      }).join("")))
    });
});
