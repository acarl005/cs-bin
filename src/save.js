module.exports = function(editor) {

  var path = window.location.pathname;

  $('#save').on('click', e => {
    localStorage.setItem(path, editor.getValue());
    alert('Progress saved.')
  });

  var saved = localStorage.getItem(path);
  if (saved) {
    editor.replaceRange(
      saved,
      CodeMirror.Pos(editor.firstLine()-1),
      CodeMirror.Pos(editor.lastLine())
    );
  }

  $('#clear').on('click', e => {
    if (confirm('Are you sure? This will remove saved progress.')) {
      localStorage.removeItem(path);
      window.location.reload();
    }
  });

}