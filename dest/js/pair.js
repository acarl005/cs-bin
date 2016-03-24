var socket = io(location.pathname);
window.onload = function() {
  editor.on('change', function(codeEditor, change) {
    if (change.origin !== 'socket') {
      socket.emit('typing', change);
    }
  });
};
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
