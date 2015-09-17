module.exports = function(editor) {

  var path = window.location.pathname;

  $('#save').on('click', e => {
    localStorage.setItem(path, editor.getValue());
    alert('Progress saved.')
  });

  var saved = localStorage.getItem(path);
  if (saved) {
    replaceEditorText(saved);
  }

  $('#clear').on('click', e => {
    if (confirm('Are you sure? This will remove saved progress.')) {
      localStorage.removeItem(path);
      replaceEditorText($('#code-editor').val());
    }
  });

}