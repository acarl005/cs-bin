var express = require('express');
var app = express();
var fs = require('fs');

app.get('/', function(req, res) {
  res.render('index', { challenges: 'none' });
});

app.get('/cs-admin', function(req, res) {
  var folders = getViews();
  res.render('admin', { views: folders });
});

app.use(express.static('dest'));

fixTypos(['/callback'], '/callbacks');
fixTypos(['/object', '/objects', '/classes'], '/oop');
fixTypos(['/closure', '/scope'], '/closures');

app.get('/:challenge', function(req, res) {
  var folders = getViews();
  var view = {};
  if (folders.indexOf(req.params.challenge) === -1)
    view.challenges = 'error';
  else 
    view.challenges = req.params.challenge;
  res.render('index', view);
});

app.set('view engine', 'ejs');
app.set('views', './views');


function fixTypos(errors, correct) {
  errors.forEach(function(error) {
    app.get(error, function(req, res) {
      res.redirect(correct);
    });
  });
}

function getViews() {
  return fs.readdirSync('views').filter(function(name) {
    return !name.match(/\.ejs$/);
  });
}

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("listening at http://localhost:" + port);
});

