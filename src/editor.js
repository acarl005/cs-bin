var TIMEOUT = 800;
var ps;
spawnWorker();

window.onload = function() {

  // initialize the editor
  window.editor = CodeMirror.fromTextArea(document.getElementById("code-editor"), {
    lineNumbers: true,
    mode: "javascript",
    matchBrackets: true,
    autoCloseBrackets: true,
    keyMap: 'sublime',
    tabSize: 2,
    theme: 'ttcn'
  });

  // checks for errors if the editor changes. waits TIMEOUT ms after they finish typing
  var waiting;
  editor.on("change", () => {
    clearTimeout(waiting);
    waiting = setTimeout(updateErrors, TIMEOUT);
  });

  // adds the save feature
  var save = require('./save');
  save(editor);

};

// adds resizing feature
require('./resize');


// this will hold the error objects, if any
var errWidgets = [];

function checkForErrors() {
  return errWidgets;
}

// display the error message in the editor
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

// do another check for errors
function updateErrors() {
  var code = editor.getValue();

  errWidgets.forEach(err => {
    editor.removeLineWidget(err);
  });
  errWidgets = [];

  try {
    // let esprima check for syntax errors
    var syntax = esprima.parse(code, { tolerant: false, loc: true });

    //send code to the web worker to execute and check for errors
    webWorker.postMessage(code);
    ps = setTimeout(killWorker, TIMEOUT);


  } catch (err) {

    renderErr(
      err.lineNumber || err.line,
      err.description || err.message,
      err.column
    );
  }

}

window.replaceEditorText = function(text) {
  editor.replaceRange(
    text,
    CodeMirror.Pos(editor.firstLine()-1),
    CodeMirror.Pos(editor.lastLine())
  );
};

function killWorker() {
  webWorker.terminate();
  renderErr(1, 'The code is taking a while. You might have an infinite loop.');
  spawnWorker();
}

function spawnWorker() {
  window.webWorker = new Worker('worker.js');
  webWorker.onmessage = e => {
    if (e.data.message) {
      renderErr(e.data.lineNumber, e.data.message);
    }
    clearTimeout(ps);
  };
}

var execute = require('./exec');
execute(checkForErrors);
