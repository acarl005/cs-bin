var socket = io(location.pathname);
window.onload = function() {
  editor.on('change', function(codeEditor, change) {
    if (change.origin !== 'socket') {
      socket.emit('typing', change);
    }
  });
};

alertify.prompt("What should we call you?", function(e, name) {
  socket.name = name || "User " + Math.ceil(Math.random() * 100); // default name in case they enter blank
});

socket.emit('join', getQueryVariable('pair'));
socket.on('typing', function(change) {
  editor.replaceRange(change.text.join('\n'), change.from, change.to, 'socket');
});


socket.on('getCode', function(recipient) {
  socket.emit('sync', { code: editor.getValue(), recipient: recipient });
});

socket.on('sync', function(code) {
  editor.replaceRange(
    code,
    CodeMirror.Pos(editor.firstLine()-1),
    CodeMirror.Pos(editor.lastLine()),
    'socket'
  );
});

$('#execute').on('click', emitExec);

//runs the code from the editor if ctrl+s is pressed
$(window).on('keydown', e => {
  if (e.ctrlKey && e.keyCode === 83) {
    e.preventDefault();
    emitExec();
  }
});

function emitExec() {
  socket.emit('exec', socket.name);
}

socket.on('exec', function(name) {
  showConsole();
  execute(name);
});

function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split('&');
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=');
    if (decodeURIComponent(pair[0]) === variable) {
      return decodeURIComponent(pair[1]);
    }
  }
  return undefined;
}
