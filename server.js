var express = require('express');
var app = express();

app.get('/', function(req, res) {
  res.render('index', { challenges: 'test'});
});

app.use(express.static('dest'));

app.set('view engine', 'ejs');
app.set('views', './views');

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("listening on port " + port);
});