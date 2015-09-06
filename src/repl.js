window.onload = function() {

  window.editor = CodeMirror(document.getElementById("editor"), {
    lineNumbers: true,
    mode: "javascript",
    value: ""
  });

  var waiting;
  editor.on("change", () => {
    clearTimeout(waiting);
    waiting = setTimeout(updateErrors, 500);
  });

};

var errWidgets = [];

function renderErr(lineNum, desc) {
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

  try {
    for (var i = 0; i < errWidgets.length; ++i)
      editor.removeLineWidget(errWidgets[i]);
    errWidgets.length = 0;

    var syntax = esprima.parse(code, { tolerant: true, loc: true });
    // var errors = syntax.errors;
    var evalErr;
    var wrappedCode = `try{ ${code} } catch(err) { evalErr = err.stack }`;
    eval(wrappedCode);
    if (evalErr) {
      var errMessage = evalErr.match(/.*/)[0];
      var [__, lineNum, colNum] = evalErr.match(/<anonymous>:(\d+):(\d+)/);
      renderErr(lineNum, errMessage);
    }
  } catch (err) {
    // err -> {lineNumber: 2, description: "Unexpected end of input", index: 42, column: 10}
    renderErr(err.lineNumber, err.description);
  }

}
