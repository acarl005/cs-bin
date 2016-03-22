var express = require('express');
var app = express();
var fs = require('fs');
var compress = require('compression');
var http = require('http');
var server = http.Server(app);
var io = require('socket.io')(server);

var namespaces = [
  io.of('/callbacks'),
  io.of('/oop'),
  io.of('/closures'),
];
function setUpSocket(socket) {
  socket.on('typing', function(data) {
    socket.broadcast.emit('typing', data);
  });
  socket.on('error', err => {
    console.error(err);
    socket.disconnect();
  });
}
namespaces.forEach(function(nsp) {
  nsp.on('connection', setUpSocket);
});
io.on('connection', setUpSocket);

app.get('/', function(req, res) {
  var view = { challenges: 'none', pair: false };
  if (req.query.pair) {
    view.pair = req.query.pair;
  }
  res.render('index', view);
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
app.get('/socket.io.js', function(req, res) {
  res.sendFile(__dirname + '/node_modules/socket.io-client/socket.io.js');
});

fixTypos(['/callback'], '/callbacks');
fixTypos(['/object', '/objects', '/classes'], '/oop');
fixTypos(['/closure', '/scope'], '/closures');

app.get('/:challenge', function(req, res) {
  var folders = getViews();
  var view = { pair: false };
  if (folders.indexOf(req.params.challenge) === -1)
    view.challenges = 'error';
  else
    view.challenges = req.params.challenge;
  if (req.query.pair) {
    view.pair = req.query.pair;
  }
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
server.listen(port, function() {
  console.log('running in', process.env.NODE_ENV);
  console.log("listening at http://localhost:" + port);
});
