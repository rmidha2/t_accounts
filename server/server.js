var express = require('express')
var app = express()
app.use(express.static(__dirname + './../app/'));

app.listen(8080, function(){
console.log("Listening on Port 8080, Stop with Ctrl+C");
});