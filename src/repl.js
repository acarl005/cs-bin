window.onload = function() {

  window.editor = CodeMirror(document.getElementById("editor"), {
    lineNumbers: true,
    mode: "javascript",
    value: "",
    matchBrackets: true,
    autoCloseBrackets: true,
    keyMap: 'sublime'
  });

  var waiting;
  editor.on("change", () => {
    clearTimeout(waiting);
    waiting = setTimeout(updateErrors, 800);
  });

};

var errWidgets = [];

function checkForErrors() {
  return errWidgets.length;
}

function renderErr(lineNum, desc, colNum) {
  var msg = document.createElement("div");
  var icon = msg.appendChild(document.createElement("span"));
  icon.innerHTML = "!";
  icon.className = "lint-error-icon";
  msg.appendChild(document.createTextNode(desc));
  msg.className = "lint-error";
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
    var wrappedCode = `try{ ${code} } catch(err) { evalErr = err.stack }`;
    eval(wrappedCode);
    if (evalErr) {
      var errMessage = evalErr.match(/.*/)[0];
      var [__, lineNum, colNum] = evalErr.match(/<anonymous>:(\d+):(\d+)/);
      renderErr(lineNum, errMessage, colNum);
    }
  } catch (err) {
    renderErr(err.lineNumber, err.description, err.column);
  }

}

var execute = require('./exec');
execute(checkForErrors);