window.onload = function() {

  window.editor = CodeMirror.fromTextArea(document.getElementById("code-editor"), {
    lineNumbers: true,
    mode: "javascript",
    matchBrackets: true,
    autoCloseBrackets: true,
    keyMap: 'sublime',
    tabSize: 2,
    theme: 'ttcn'
  });

  var waiting;
  editor.on("change", () => {
    clearTimeout(waiting);
    waiting = setTimeout(updateErrors, 800);
  });

  var save = require('./save');
  save(editor);

};

var errWidgets = [];

function checkForErrors() {
  return errWidgets;
}

function renderErr(lineNum, desc, colNum) {
  if (!lineNum) throw new Error('Line number for renderErr must be a valid integer.');
  var msg = $(`
    <div class="lint-error">
      <span class="lint-error-icon">!</span>
      ${desc}
    </div>
  `)[0];
  errWidgets.push(
    editor.addLineWidget(lineNum - 1, msg, { coverGutter: false, noHScroll: true })
  );
}

function updateErrors() {
  var code = editor.getValue();

  errWidgets.forEach(err => {
    editor.removeLineWidget(err);
  });
  errWidgets = [];

  try {
    var syntax = esprima.parse(code, { tolerant: true, loc: true });
    var evalErr;
    var wrappedCode = `try{ ${code}\n } catch(err) { evalErr = err }`;

    eval(wrappedCode);
    if (evalErr) {
      var stack = evalErr.stack;
      var errMessage = evalErr.message || stack.match(/.*/)[0];     // firefox || chrome
      var lineNum = evalErr.lineNumber || stack.match(/<anonymous>:(\d+):\d+/)[1];
      // var colNum = evalErr.columnNumber || stack.match(/<anonymous>:\d+:(\d+)/)[0];
      renderErr(lineNum, errMessage);
    }
  } catch (err) {
    renderErr(err.lineNumber, err.description, err.column);
  }

}

window.replaceEditorText = function(text) {
  editor.replaceRange(
    text,
    CodeMirror.Pos(editor.firstLine()-1),
    CodeMirror.Pos(editor.lastLine())
  );
}

var execute = require('./exec');
execute(checkForErrors);
require('./resize');