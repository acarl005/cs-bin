(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/andy/Desktop/production/cs-bin/src/exec.js":[function(require,module,exports){
module.exports = function (hasErrors) {
  $(document).ready(function () {

    $('#console form').on('submit', repl);
    $('#execute').on('click', execute);
    $(window).on('keypress', function (e) {
      e.ctrlKey && e.keyCode && execute(); //execute if they press ctrl+b in chrome
    });

    $('#console form').on('keydown', function (e) {
      if (e.keyCode === 38) {
        //up arrow key
        commandIndex++;
      } else if (e.keyCode === 40) {
        //down arrow key
        commandIndex--;
      } else {
        return 'we can ignore this';
      }
      // make sure commandIndex stays in reasonable range
      commandIndex = Math.min(commandStack.length - 1, commandIndex);
      commandIndex = Math.max(-1, commandIndex);
      $('#console form input').val(commandStack[commandIndex]);
    });
  });

  function execute() {
    $('#console #output').empty();
    var errors = hasErrors();

    if (errors[0]) {
      return render(errors[0].node.innerText || $(errors[0].node).text(), // chrome || firefox
      { error: true });
    }

    var code = editor.getValue();

    wrapLogOutput(function () {

      eval(code);

      $('#console form').off('submit');
      $('#console form').on('submit', eval('(' + String(repl) + ')'));
      // this eval/String thing is pretty weird right? It's basically a hack that Rob and I devised to "clone" a function. It takes a func, converts to a string, then redefines it in an eval. This effectively achieves dynamic scoping. By redefining it in this scope, I can access the local variables here instead of the default lexical scoping behavior. The reason I want this is so the repl has access to the variables defined in the CodeMirror editor.
    });
  }
};

// allow user to access previously entered commands
var commandStack = [];
var commandIndex = -1;

function render(text) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  if (typeof text === 'object') {
    text = JSON.stringify(text, null, 4);
  } else {
    text = String(text);
  }

  // This particular err message is poor. Make it a bit more helpful
  text = text.replace(/Unexpected end of input/, 'Unexpected end of input: make sure your brackets match');

  if (options.arrow) text = '=> ' + text;
  if (options.error) text = '<span class="error">' + text + '</span>';
  $('#console #output').append('<p>' + text + '</p>');

  // scroll to bottom in order to show most recent
  var consoleDOM = document.getElementById('console');
  consoleDOM.scrollTop = consoleDOM.scrollHeight;
}

function repl(e) {
  e.preventDefault();
  var code = $(e.target).find('input').val();
  commandStack.unshift(code);
  commandStack = commandStack.slice(0, 9);
  commandIndex = -1;
  wrapLogOutput(function () {
    $(e.target).find('input').val('');
    var evalErr;
    var wrappedCode = 'try{ ' + code + '\n } catch(err) { evalErr = err }';
    try {
      var output = eval(wrappedCode);
    } catch (err) {
      evalErr = err;
    }
    if (evalErr) {

      render(evalErr.message, { error: true });
    } else {
      render(output, { arrow: true });
    }
  });
}

// executes a function in a context where all calls to console.log will render to the DOM
function wrapLogOutput(func) {
  console.nativeLog = console.log;
  console.log = function () {
    [].forEach.call(arguments, function (line) {
      render(line);
    });
    console.nativeLog.apply(console, arguments);
  };
  func();
  console.log = console.nativeLog;
}

},{}],"/home/andy/Desktop/production/cs-bin/src/repl.js":[function(require,module,exports){
window.onload = function () {

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
  editor.on("change", function () {
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
  var msg = $("\n    <div class=\"lint-error\">\n      <span class=\"lint-error-icon\">!</span>\n      " + desc + "\n    </div>\n  ")[0];
  errWidgets.push(editor.addLineWidget(lineNum - 1, msg, { coverGutter: false, noHScroll: true }));
}

function updateErrors() {
  var code = editor.getValue();

  errWidgets.forEach(function (err) {
    editor.removeLineWidget(err);
  });
  errWidgets = [];

  try {
    var syntax = esprima.parse(code, { tolerant: true, loc: true });
    var evalErr;
    var wrappedCode = "try{ " + code + "\n } catch(err) { evalErr = err }";

    eval(wrappedCode);
    if (evalErr) {
      var stack = evalErr.stack;
      var errMessage = evalErr.message || stack.match(/.*/)[0]; // firefox || chrome
      var lineNum = evalErr.lineNumber || stack.match(/<anonymous>:(\d+):\d+/)[0];
      // var colNum = evalErr.columnNumber || stack.match(/<anonymous>:\d+:(\d+)/)[0];
      renderErr(lineNum, errMessage);
    }
  } catch (err) {
    renderErr(err.lineNumber, err.description, err.column);
  }
}

window.replaceEditorText = function (text) {
  editor.replaceRange(text, CodeMirror.Pos(editor.firstLine() - 1), CodeMirror.Pos(editor.lastLine()));
};

var execute = require('./exec');
execute(checkForErrors);

},{"./exec":"/home/andy/Desktop/production/cs-bin/src/exec.js","./save":"/home/andy/Desktop/production/cs-bin/src/save.js"}],"/home/andy/Desktop/production/cs-bin/src/save.js":[function(require,module,exports){
module.exports = function (editor) {

  var path = window.location.pathname;

  $('#save').on('click', function (e) {
    localStorage.setItem(path, editor.getValue());
    alert('Progress saved.');
  });

  var saved = localStorage.getItem(path);
  if (saved) {
    replaceEditorText(saved);
  }

  $('#clear').on('click', function (e) {
    if (confirm('Are you sure? This will remove saved progress.')) {
      localStorage.removeItem(path);
      window.location.reload();
    }
  });
};

},{}]},{},["/home/andy/Desktop/production/cs-bin/src/repl.js"])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9hbmR5L0Rlc2t0b3AvcHJvZHVjdGlvbi9jcy1iaW4vc3JjL2V4ZWMuanMiLCIvaG9tZS9hbmR5L0Rlc2t0b3AvcHJvZHVjdGlvbi9jcy1iaW4vc3JjL3JlcGwuanMiLCIvaG9tZS9hbmR5L0Rlc2t0b3AvcHJvZHVjdGlvbi9jcy1iaW4vc3JjL3NhdmUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVMsU0FBUyxFQUFFO0FBQ25DLEdBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUMsWUFBTTs7QUFFdEIsS0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDdEMsS0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDbkMsS0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsVUFBQSxDQUFDLEVBQUk7QUFDNUIsT0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUMsT0FBTyxJQUFJLE9BQU8sRUFBRSxDQUFDO0tBQ3JDLENBQUMsQ0FBQzs7QUFFSCxLQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxVQUFBLENBQUMsRUFBSTtBQUNwQyxVQUFJLENBQUMsQ0FBQyxPQUFPLEtBQUssRUFBRSxFQUFFOztBQUNwQixvQkFBWSxFQUFFLENBQUM7T0FDaEIsTUFBTSxJQUFJLENBQUMsQ0FBQyxPQUFPLEtBQUssRUFBRSxFQUFFOztBQUMzQixvQkFBWSxFQUFFLENBQUM7T0FDaEIsTUFBTTtBQUNMLGVBQU8sb0JBQW9CLENBQUM7T0FDN0I7O0FBRUQsa0JBQVksR0FBRyxJQUFJLENBQUMsR0FB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RUFBRSxDQUFDLENBQ2xDLENBQUM7Q0FDSCxDQUFBOztBQUVELElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNoQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7OztBQzlFeEIsTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUFTLE1BQU0sRUFBRTs7QUFFaEMsTUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUM7O0FBRXBDLEdBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLFVBQUEsQ0FBQyxFQUFJO0FBQzFCLGdCQUFZLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztBQUM5QyxTQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQTtHQUN6QixDQUFDLENBQUM7O0FBRUgsTUFBSSxLQUFLLEdBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN2QyxNQUFJLEtBQUssRUFBRTtBQUNULHFCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFDO0dBQzFCOztBQUVELEdBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLFVBQUEsQ0FBQyxFQUFJO0FBQzNCLFFBQUksT0FBTyxDQUFDLGdEQUFnRCxDQUFDLEVBQUU7QUFDN0Qsa0JBQVksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDOUIsWUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQztLQUMxQjtHQUNGLENBQUMsQ0FBQztDQUVKLENBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihoYXNFcnJvcnMpIHtcbiAgJChkb2N1bWVudCkucmVhZHkoKCkgPT4ge1xuXG4gICAgJCgnI2NvbnNvbGUgZm9ybScpLm9uKCdzdWJtaXQnLCByZXBsKTtcbiAgICAkKCcjZXhlY3V0ZScpLm9uKCdjbGljaycsIGV4ZWN1dGUpO1xuICAgICQod2luZG93KS5vbigna2V5cHJlc3MnLCBlID0+IHtcbiAgICAgIGUuY3RybEtleSAmJiBlLmtleUNvZGUgJiYgZXhlY3V0ZSgpOyAgIC8vZXhlY3V0ZSBpZiB0aGV5IHByZXNzIGN0cmwrYiBpbiBjaHJvbWVcbiAgICB9KTtcblxuICAgICQoJyNjb25zb2xlIGZvcm0nKS5vbigna2V5ZG93bicsIGUgPT4ge1xuICAgICAgaWYgKGUua2V5Q29kZSA9PT0gMzgpIHsgIC8vdXAgYXJyb3cga2V5XG4gICAgICAgIGNvbW1hbmRJbmRleCsrO1xuICAgICAgfSBlbHNlIGlmIChlLmtleUNvZGUgPT09IDQwKSB7ICAvL2Rvd24gYXJyb3cga2V5XG4gICAgICAgIGNvbW1hbmRJbmRleC0tO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuICd3ZSBjYW4gaWdub3JlIHRoaXMnO1xuICAgICAgfVxuICAgICAgLy8gbWFrZSBzdXJlIGNvbW1hbmRJbmRleCBzdGF5cyBpbiByZWFzb25hYmxlIHJhbmdlXG4gICAgICBjb21tYW5kSW5kZXggPSBNYXRoLm1pbihjb21tYW5kU3RhY2subGVuZ3RoIC0gMSwgY29tbWFuZEluZGV4KTtcbiAgICAgIGNvbW1hbmRJbmRleCA9IE1hdGgubWF4KC0xLCBjb21tYW5kSW5kZXgpO1xuICAgICAgJCgnI2NvbnNvbGUgZm9ybSBpbnB1dCcpLnZhbChjb21tYW5kU3RhY2tbY29tbWFuZEluZGV4XSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIGV4ZWN1dGUoKSB7XG4gICAgJCgnI2NvbnNvbGUgI291dHB1dCcpLmVtcHR5KCk7XG4gICAgdmFyIGVycm9ycyA9IGhhc0Vycm9ycygpO1xuXG4gICAgaWYgKGVycm9yc1swXSl7XG4gICAgICByZXR1cm4gcmVuZGVyKFxuICAgICAgICBlcnJvcnNbMF0ubm9kZS5pbm5lclRleHQgfHwgJChlcnJvcnNbMF0ubm9kZSkudGV4dCgpLCAgICAvLyBjaHJvbWUgfHwgZmlyZWZveFxuICAgICAgICB7IGVycm9yOiB0cnVlIH1cbiAgICAgICk7XG4gICAgfVxuXG4gICAgdmFyIGNvZGUgPSBlZGl0b3IuZ2V0VmFsdWUoKTtcblxuICAgIHdyYXBMb2dPdXRwdXQoKCkgPT4ge1xuXG4gICAgICBldmFsKGNvZGUpO1xuXG4gICAgICAkKCcjY29uc29sZSBmb3JtJykub2ZmKCdzdWJtaXQnKTtcbiAgICAgICQoJyNjb25zb2xlIGZvcm0nKS5vbignc3VibWl0JywgZXZhbCgnKCcrU3RyaW5nKHJlcGwpKycpJykpO1xuICAgICAgLy8gdGhpcyBldmFsL1N0cmluZyB0aGluZyBpcyBwcmV0dHkgd2VpcmQgcmlnaHQ/IEl0J3MgYmFzaWNhbGx5IGEgaGFjayB0aGF0IFJvYiBhbmQgSSBkZXZpc2VkIHRvIFwiY2xvbmVcIiBhIGZ1bmN0aW9uLiBJdCB0YWtlcyBhIGZ1bmMsIGNvbnZlcnRzIHRvIGEgc3RyaW5nLCB0aGVuIHJlZGVmaW5lcyBpdCBpbiBhbiBldmFsLiBUaGlzIGVmZmVjdGl2ZWx5IGFjaGlldmVzIGR5bmFtaWMgc2NvcGluZy4gQnkgcmVkZWZpbmluZyBpdCBpbiB0aGlzIHNjb3BlLCBJIGNhbiBhY2Nlc3MgdGhlIGxvY2FsIHZhcmlhYmxlcyBoZXJlIGluc3RlYWQgb2YgdGhlIGRlZmF1bHQgbGV4aWNhbCBzY29waW5nIGJlaGF2aW9yLiBUaGUgcmVhc29uIEkgd2FudCB0aGlzIGlzIHNvIHRoZSByZXBsIGhhcyBhY2Nlc3MgdG8gdGhlIHZhcmlhYmxlcyBkZWZpbmVkIGluIHRoZSBDb2RlTWlycm9yIGVkaXRvci5cblxuICAgIH0pO1xuXG4gIH1cbn1cblxuLy8gYWxsb3cgdXNlciB0byBhY2Nlc3MgcHJldmlvdXNseSBlbnRlcmVkIGNvbW1hbmRzXG52YXIgY29tbWFuZFN0YWNrID0gW107XG52YXIgY29tbWFuZEluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIHJlbmRlcih0ZXh0LCBvcHRpb25zPXt9KSB7XG4gIGlmICh0eXBlb2YgdGV4dCA9PT0gJ29iamVjdCcpIHtcbiAgICB0ZXh0ID0gSlNPTi5zdHJpbmdpZnkodGV4dCwgbnVsbCwgNCk7XG4gIH0gZWxzZSB7XG4gICAgdGV4dCA9IFN0cmluZyh0ZXh0KTtcbiAgfVxuXG4gIC8vIFRoaXMgcGFydGljdWxhciBlcnIgbWVzc2FnZSBpcyBwb29yLiBNYWtlIGl0IGEgYml0IG1vcmUgaGVscGZ1bFxuICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC9VbmV4cGVjdGVkIGVuZCBvZiBpbnB1dC8sICdVbmV4cGVjdGVkIGVuZCBvZiBpbnB1dDogbWFrZSBzdXJlIHlvdXIgYnJhY2tldHMgbWF0Y2gnKVxuXG4gIGlmIChvcHRpb25zLmFycm93KVxuICAgIHRleHQgPSBgPT4gJHt0ZXh0fWA7XG4gIGlmIChvcHRpb25zLmVycm9yKVxuICAgIHRleHQgPSBgPHNwYW4gY2xhc3M9XCJlcnJvclwiPiR7dGV4dH08L3NwYW4+YDtcbiAgJCgnI2NvbnNvbGUgI291dHB1dCcpLmFwcGVuZChgPHA+JHt0ZXh0fTwvcD5gKTtcblxuICAvLyBzY3JvbGwgdG8gYm90dG9tIGluIG9yZGVyIHRvIHNob3cgbW9zdCByZWNlbnRcbiAgdmFyIGNvbnNvbGVET00gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29uc29sZScpO1xuICBjb25zb2xlRE9NLnNjcm9sbFRvcCA9IGNvbnNvbGVET00uc2Nyb2xsSGVpZ2h0O1xufVxuXG5mdW5jdGlvbiByZXBsKGUpIHtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICB2YXIgY29kZSA9ICQoZS50YXJnZXQpLmZpbmQoJ2lucHV0JykudmFsKCk7XG4gIGNvbW1hbmRTdGFjay51bnNoaWZ0KGNvZGUpO1xuICBjb21tYW5kU3RhY2sgPSBjb21tYW5kU3RhY2suc2xpY2UoMCwgOSk7XG4gIGNvbW1hbmRJbmRleCA9IC0xO1xuICB3cmFwTG9nT3V0cHV0KCgpID0+IHtcbiAgICAkKGUudGFyZ2V0KS5maW5kKCdpbnB1dCcpLnZhbCgnJyk7XG4gICAgdmFyIGV2YWxFcnI7XG4gICAgdmFyIHdyYXBwZWRDb2RlID0gYHRyeXsgJHtjb2RlfVxcbiB9IGNhdGNoKGVycikgeyBldmFsRXJyID0gZXJyIH1gO1xuICAgIHRyeSB7XG4gICAgICB2YXIgb3V0cHV0ID0gZXZhbCh3cmFwcGVkQ29kZSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBldmFsRXJyID0gZXJyO1xuICAgIH1cbiAgICBpZiAoZXZhbEVycikge1xuXG4gICAgICByZW5kZXIoZXZhbEVyci5tZXNzYWdlLCB7IGVycm9yOiB0cnVlIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZW5kZXIob3V0cHV0LCB7IGFycm93OiB0cnVlIH0pO1xuICAgIH1cbiAgfSk7XG59XG5cbi8vIGV4ZWN1dGVzIGEgZnVuY3Rpb24gaW4gYSBjb250ZXh0IHdoZXJlIGFsbCBjYWxscyB0byBjb25zb2xlLmxvZyB3aWxsIHJlbmRlciB0byB0aGUgRE9NXG5mdW5jdGlvbiB3cmFwTG9nT3V0cHV0KGZ1bmMpIHtcbiAgY29uc29sZS5uYXRpdmVMb2cgPSBjb25zb2xlLmxvZztcbiAgY29uc29sZS5sb2cgPSBmdW5jdGlvbigpIHtcbiAgICBbXS5mb3JFYWNoLmNhbGwoYXJndW1lbnRzLCBsaW5lID0+IHtcbiAgICAgIHJlbmRlcihsaW5lKTtcbiAgICB9KTtcbiAgICBjb25zb2xlLm5hdGl2ZUxvZyguLi5hcmd1bWVudHMpO1xuICB9XG4gIGZ1bmMoKTtcbiAgY29uc29sZS5sb2cgPSBjb25zb2xlLm5hdGl2ZUxvZztcbn1cblxuXG5cblxuIiwid2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuXG4gIHdpbmRvdy5lZGl0b3IgPSBDb2RlTWlycm9yLmZyb21UZXh0QXJlYShkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvZGUtZWRpdG9yXCIpLCB7XG4gICAgbGluZU51bWJlcnM6IHRydWUsXG4gICAgbW9kZTogXCJqYXZhc2NyaXB0XCIsXG4gICAgbWF0Y2hCcmFja2V0czogdHJ1ZSxcbiAgICBhdXRvQ2xvc2VCcmFja2V0czogdHJ1ZSxcbiAgICBrZXlNYXA6ICdzdWJsaW1lJyxcbiAgICB0YWJTaXplOiAyLFxuICAgIHRoZW1lOiAndHRjbidcbiAgfSk7XG5cbiAgdmFyIHdhaXRpbmc7XG4gIGVkaXRvci5vbihcImNoYW5nZVwiLCAoKSA9PiB7XG4gICAgY2xlYXJUaW1lb3V0KHdhaXRpbmcpO1xuICAgIHdhaXRpbmcgPSBzZXRUaW1lb3V0KHVwZGF0ZUVycm9ycywgODAwKTtcbiAgfSk7XG5cbiAgdmFyIHNhdmUgPSByZXF1aXJlKCcuL3NhdmUnKTtcbiAgc2F2ZShlZGl0b3IpO1xuXG59O1xuXG52YXIgZXJyV2lkZ2V0cyA9IFtdO1xuXG5mdW5jdGlvbiBjaGVja0ZvckVycm9ycygpIHtcbiAgcmV0dXJuIGVycldpZGdldHM7XG59XG5cbmZ1bmN0aW9uIHJlbmRlckVycihsaW5lTnVtLCBkZXNjLCBjb2xOdW0pIHtcbiAgaWYgKCFsaW5lTnVtKSB0aHJvdyBuZXcgRXJyb3IoJ0xpbmUgbnVtYmVyIGZvciByZW5kZXJFcnIgbXVzdCBiZSBhIHZhbGlkIGludGVnZXIuJyk7XG4gIHZhciBtc2cgPSAkKGBcbiAgICA8ZGl2IGNsYXNzPVwibGludC1lcnJvclwiPlxuICAgICAgPHNwYW4gY2xhc3M9XCJsaW50LWVycm9yLWljb25cIj4hPC9zcGFuPlxuICAgICAgJHtkZXNjfVxuICAgIDwvZGl2PlxuICBgKVswXTtcbiAgZXJyV2lkZ2V0cy5wdXNoKFxuICAgIGVkaXRvci5hZGRMaW5lV2lkZ2V0KGxpbmVOdW0gLSAxLCBtc2csIHsgY292ZXJHdXR0ZXI6IGZhbHNlLCBub0hTY3JvbGw6IHRydWUgfSlcbiAgKTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlRXJyb3JzKCkge1xuICB2YXIgY29kZSA9IGVkaXRvci5nZXRWYWx1ZSgpO1xuXG4gIGVycldpZGdldHMuZm9yRWFjaChlcnIgPT4ge1xuICAgIGVkaXRvci5yZW1vdmVMaW5lV2lkZ2V0KGVycik7XG4gIH0pO1xuICBlcnJXaWRnZXRzID0gW107XG5cbiAgdHJ5IHtcbiAgICB2YXIgc3ludGF4ID0gZXNwcmltYS5wYXJzZShjb2RlLCB7IHRvbGVyYW50OiB0cnVlLCBsb2M6IHRydWUgfSk7XG4gICAgdmFyIGV2YWxFcnI7XG4gICAgdmFyIHdyYXBwZWRDb2RlID0gYHRyeXsgJHtjb2RlfVxcbiB9IGNhdGNoKGVycikgeyBldmFsRXJyID0gZXJyIH1gO1xuXG4gICAgZXZhbCh3cmFwcGVkQ29kZSk7XG4gICAgaWYgKGV2YWxFcnIpIHtcbiAgICAgIHZhciBzdGFjayA9IGV2YWxFcnIuc3RhY2s7XG4gICAgICB2YXIgZXJyTWVzc2FnZSA9IGV2YWxFcnIubWVzc2FnZSB8fCBzdGFjay5tYXRjaCgvLiovKVswXTsgICAgIC8vIGZpcmVmb3ggfHwgY2hyb21lXG4gICAgICB2YXIgbGluZU51bSA9IGV2YWxFcnIubGluZU51bWJlciB8fCBzdGFjay5tYXRjaCgvPGFub255bW91cz46KFxcZCspOlxcZCsvKVswXTtcbiAgICAgIC8vIHZhciBjb2xOdW0gPSBldmFsRXJyLmNvbHVtbk51bWJlciB8fCBzdGFjay5tYXRjaCgvPGFub255bW91cz46XFxkKzooXFxkKykvKVswXTtcbiAgICAgIHJlbmRlckVycihsaW5lTnVtLCBlcnJNZXNzYWdlKTtcbiAgICB9XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJlbmRlckVycihlcnIubGluZU51bWJlciwgZXJyLmRlc2NyaXB0aW9uLCBlcnIuY29sdW1uKTtcbiAgfVxuXG59XG5cbndpbmRvdy5yZXBsYWNlRWRpdG9yVGV4dCA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgZWRpdG9yLnJlcGxhY2VSYW5nZShcbiAgICB0ZXh0LFxuICAgIENvZGVNaXJyb3IuUG9zKGVkaXRvci5maXJzdExpbmUoKS0xKSxcbiAgICBDb2RlTWlycm9yLlBvcyhlZGl0b3IubGFzdExpbmUoKSlcbiAgKTtcbn1cblxudmFyIGV4ZWN1dGUgPSByZXF1aXJlKCcuL2V4ZWMnKTtcbmV4ZWN1dGUoY2hlY2tGb3JFcnJvcnMpOyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZWRpdG9yKSB7XG5cbiAgdmFyIHBhdGggPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWU7XG5cbiAgJCgnI3NhdmUnKS5vbignY2xpY2snLCBlID0+IHtcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShwYXRoLCBlZGl0b3IuZ2V0VmFsdWUoKSk7XG4gICAgYWxlcnQoJ1Byb2dyZXNzIHNhdmVkLicpXG4gIH0pO1xuXG4gIHZhciBzYXZlZCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKHBhdGgpO1xuICBpZiAoc2F2ZWQpIHtcbiAgICByZXBsYWNlRWRpdG9yVGV4dChzYXZlZCk7XG4gIH1cblxuICAkKCcjY2xlYXInKS5vbignY2xpY2snLCBlID0+IHtcbiAgICBpZiAoY29uZmlybSgnQXJlIHlvdSBzdXJlPyBUaGlzIHdpbGwgcmVtb3ZlIHNhdmVkIHByb2dyZXNzLicpKSB7XG4gICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShwYXRoKTtcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcbiAgICB9XG4gIH0pO1xuXG59Il19
