var express = require('express');
var app = express();
var fs = require('fs');
var compress = require('compression');

app.get('/', function(req, res) {
  res.render('index', { challenges: 'none' });
});

app.get('/cs-admin', function(req, res) {
  res.render('admin', { views: getViews() });
});

app.use(compress());
var staticOptions = {};
if (process.env.NODE_ENV === 'production') {
  staticOptions.maxAge = 86400000; // one day
}
app.use(express.static('dest', staticOptions));

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
  console.log('running in', process.env.NODE_ENV);
  console.log("listening at http://localhost:" + port);
});
