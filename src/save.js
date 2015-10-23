module.exports = function(editor) {

  var path = window.location.pathname;

  $('#save').on('click', e => {
    localStorage.setItem(path, editor.getValue());
    alertify.success('Progress saved.');
  });

  var saved = localStorage.getItem(path);
  if (saved) {
    replaceEditorText(saved);
  }

  $('#clear').on('click', e => {
    var msg = 'Are you sure? This will remove saved progress and restore the challenges to their former state.';
    alertify.confirm(msg, theySaidYes => {
      if (theySaidYes) {
        localStorage.removeItem(path);
        replaceEditorText($('#code-editor').val());
        alertify.error('Saved progress removed.');
      }
    });
  });

}