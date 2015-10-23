onmessage = function(e) {
  var evalErr;
  var wrappedCode = 'try { ' + e.data + '\n } catch(err) { evalErr = err }';

  eval(wrappedCode);
  if (evalErr) {
    var stack = evalErr.stack;
    var errMessage = evalErr.message || stack.match(/.*/)[0];     // firefox || chrome
    var lineNum = evalErr.lineNumber || stack.match(/<anonymous>:(\d+):\d+/)[1];
    // var colNum = evalErr.columnNumber || stack.match(/<anonymous>:\d+:(\d+)/)[0];
    postMessage({ message: errMessage, lineNumber: lineNum });
  } else {
    postMessage({ message: null });
  }
}