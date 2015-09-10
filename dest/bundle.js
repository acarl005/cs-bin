(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/andrew/Desktop/production/codesmith-bin/src/exec.js":[function(require,module,exports){
module.exports = function (hasErrors) {
  $(document).ready(function () {

    $('#console form').on('submit', repl);
    $('#execute').on('click', execute);
    $(window).on('keypress', function (e) {
      e.ctrlKey && e.keyCode && execute(); //execute if they press ctrl+b
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
    if (hasErrors()) return render('<span class="error">There are errors in the editor. Fix them before executing.</span>');

    var code = editor.getValue();

    wrapLogOutput(function () {

      eval(code);

      $('#console form').off('submit');
      $('#console form').on('submit', eval('(' + String(repl) + ')'));
      // this eval/String thing is pretty weird right? It's basically a hack that Rob and I devised to "clone" a function. It takes a func, converts to a string, then redefines it in an eval. This effectively achieves dynamic scoping. By redefining it in this scope, I can access the local variables here instead of the default lexical scoping behavior. The reason I want this is so the repl has access to the variables defined in the CodeMirror editor.
    });
  }
};

//allow user to access previously entered commands
var commandStack = [];
var commandIndex = -1;

function render(text) {
  $('#console #output').append('<p>' + text + '</p>');
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
    var wrappedCode = 'try{ ' + code + ' } catch(err) { evalErr = err.stack }';
    var output = eval(wrappedCode);
    if (evalErr) {
      var errMessage = evalErr.match(/.*/)[0];
      render('<span class="error">' + errMessage + '</span>');
    } else {
      render('=> ' + output);
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

},{}],"/home/andrew/Desktop/production/codesmith-bin/src/repl.js":[function(require,module,exports){
var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

window.onload = function () {

  window.editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
    lineNumbers: true,
    mode: "javascript",
    matchBrackets: true,
    autoCloseBrackets: true,
    keyMap: 'sublime'
  });

  var waiting;
  editor.on("change", function () {
    clearTimeout(waiting);
    waiting = setTimeout(updateErrors, 800);
  });
};

var errWidgets = [];

function checkForErrors() {
  return errWidgets.length;
}

function renderErr(lineNum, desc, colNum) {
  var msg = $("<div class=\"lint-error\"><span class=\"lint-error-icon\">!</span>" + desc + "</div>")[0];
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
    var wrappedCode = "try{ " + code + " } catch(err) { evalErr = err.stack }";
    eval(wrappedCode);
    if (evalErr) {
      var errMessage = evalErr.match(/.*/)[0];

      var _evalErr$match = evalErr.match(/<anonymous>:(\d+):(\d+)/);

      var _evalErr$match2 = _slicedToArray(_evalErr$match, 3);

      var __ = _evalErr$match2[0];
      var lineNum = _evalErr$match2[1];
      var colNum = _evalErr$match2[2];

      renderErr(lineNum, errMessage, colNum);
    }
  } catch (err) {
    renderErr(err.lineNumber, err.description, err.column);
  }
}

var execute = require('./exec');
execute(checkForErrors);

},{"./exec":"/home/andrew/Desktop/production/codesmith-bin/src/exec.js"}]},{},["/home/andrew/Desktop/production/codesmith-bin/src/repl.js"])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9hbmRyZXcvRGVza3RvcC9wcm9kdWN0aW9uL2NvZGVzbWl0aC1iaW4vc3JjL2V4ZWMuanMiLCIvaG9tZS9hbmRyZXcvRGVza3RvcC9wcm9kdWN0aW9uL2NvZGVzbWl0aC1iaW4vc3JjL3JlcGwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVMsU0FBUyxFQUFFO0FBQ25DLEdBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUMsWUFBTTs7QUFFdEIsS0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDdEMsS0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDbkMsS0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsVUFBQSxDQUFDLEVBQUk7QUFDNUIsT0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUMsT0FBTyxJQUFJLE9BQU8sRUFBRSxDQUFDO0tBQ3JDLENBQUMsQ0FBQzs7QUFFSCxLQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxVQUFBLENBQUMsRUFBSTtBQUNwQyxVQUFJLENBQUMsQ0FBQyxPQUFPLEtBQUssRUFBRSxFQUFFOztBQUNwQixvQkFBWSxFQUFFLENBQUM7T0FDaEIsTUFBTSxJQUFJLENBQUMsQ0FBQyxPQUFPLEtBQUssRUFBRSxFQUFFOztBQUMzQixvQkFBWSxFQUFFLENBQUM7T0FDaEIsTUFBTTtBQUNMLGVBQU8sb0JBQW9CLENBQUM7T0FDN0I7O0FBRUQsa0JBQVksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxF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QUFJO0FBQ3hCLFVBQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztHQUM5QixDQUFDLENBQUM7QUFDSCxZQUFVLEdBQUcsRUFBRSxDQUFDOztBQUVoQixNQUFJO0FBQ0YsUUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDOztBQUVoRSxRQUFJLE9BQU8sQ0FBQztBQUNaLFFBQUksV0FBVyxhQUFXLElBQUksMENBQXVDLENBQUM7QUFDdEUsUUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ2xCLFFBQUksT0FBTyxFQUFFO0FBQ1gsVUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7MkJBQ1osT0FBTyxDQUFDLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQzs7OztVQUEvRCxFQUFFO1VBQUUsT0FBTztVQUFFLE1BQU07O0FBQ3hCLGVBQVMsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0tBQ3hDO0dBQ0YsQ0FBQyxPQUFPLEdBQUcsRUFBRTtBQUNaLGFBQVMsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0dBQ3hEO0NBRUY7O0FBRUQsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ2hDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGhhc0Vycm9ycykge1xuICAkKGRvY3VtZW50KS5yZWFkeSgoKSA9PiB7XG5cbiAgICAkKCcjY29uc29sZSBmb3JtJykub24oJ3N1Ym1pdCcsIHJlcGwpO1xuICAgICQoJyNleGVjdXRlJykub24oJ2NsaWNrJywgZXhlY3V0ZSk7XG4gICAgJCh3aW5kb3cpLm9uKCdrZXlwcmVzcycsIGUgPT4ge1xuICAgICAgZS5jdHJsS2V5ICYmIGUua2V5Q29kZSAmJiBleGVjdXRlKCk7ICAgLy9leGVjdXRlIGlmIHRoZXkgcHJlc3MgY3RybCtiXG4gICAgfSk7XG5cbiAgICAkKCcjY29uc29sZSBmb3JtJykub24oJ2tleWRvd24nLCBlID0+IHtcbiAgICAgIGlmIChlLmtleUNvZGUgPT09IDM4KSB7ICAvL3VwIGFycm93IGtleVxuICAgICAgICBjb21tYW5kSW5kZXgrKztcbiAgICAgIH0gZWxzZSBpZiAoZS5rZXlDb2RlID09PSA0MCkgeyAgLy9kb3duIGFycm93IGtleVxuICAgICAgICBjb21tYW5kSW5kZXgtLTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAnd2UgY2FuIGlnbm9yZSB0aGlzJztcbiAgICAgIH1cbiAgICAgIC8vIG1ha2Ugc3VyZSBjb21tYW5kSW5kZXggc3RheXMgaW4gcmVhc29uYWJsZSByYW5nZVxuICAgICAgY29tbWFuZEluZGV4ID0gTWF0aC5taW4oY29tbWFuZFN0YWNrLmxlbmd0aCAtIDEsIGNvbW1hbmRJbmRleCk7XG4gICAgICBjb21tYW5kSW5kZXggPSBNYXRoLm1heCgtMSwgY29tbWFuZEluZGV4KTtcbiAgICAgICQoJyNjb25zb2xlIGZvcm0gaW5wdXQnKS52YWwoY29tbWFuZFN0YWNrW2NvbW1hbmRJbmRleF0pO1xuICAgIH0pO1xuICB9KTtcblxuICBmdW5jdGlvbiBleGVjdXRlKCkge1xuICAgICQoJyNjb25zb2xlICNvdXRwdXQnKS5lbXB0eSgpO1xuICAgIGlmIChoYXNFcnJvcnMoKSlcbiAgICAgIHJldHVybiByZW5kZXIoJzxzcGFuIGNsYXNzPVwiZXJyb3JcIj5UaGVyZSBhcmUgZXJyb3JzIGluIHRoZSBlZGl0b3IuIEZpeCB0aGVtIGJlZm9yZSBleGVjdXRpbmcuPC9zcGFuPicpO1xuXG4gICAgdmFyIGNvZGUgPSBlZGl0b3IuZ2V0VmFsdWUoKTtcblxuICAgIHdyYXBMb2dPdXRwdXQoKCkgPT4ge1xuXG4gICAgICBldmFsKGNvZGUpO1xuXG4gICAgICAkKCcjY29uc29sZSBmb3JtJykub2ZmKCdzdWJtaXQnKTtcbiAgICAgICQoJyNjb25zb2xlIGZvcm0nKS5vbignc3VibWl0JywgZXZhbCgnKCcrU3RyaW5nKHJlcGwpKycpJykpO1xuICAgICAgLy8gdGhpcyBldmFsL1N0cmluZyB0aGluZyBpcyBwcmV0dHkgd2VpcmQgcmlnaHQ/IEl0J3MgYmFzaWNhbGx5IGEgaGFjayB0aGF0IFJvYiBhbmQgSSBkZXZpc2VkIHRvIFwiY2xvbmVcIiBhIGZ1bmN0aW9uLiBJdCB0YWtlcyBhIGZ1bmMsIGNvbnZlcnRzIHRvIGEgc3RyaW5nLCB0aGVuIHJlZGVmaW5lcyBpdCBpbiBhbiBldmFsLiBUaGlzIGVmZmVjdGl2ZWx5IGFjaGlldmVzIGR5bmFtaWMgc2NvcGluZy4gQnkgcmVkZWZpbmluZyBpdCBpbiB0aGlzIHNjb3BlLCBJIGNhbiBhY2Nlc3MgdGhlIGxvY2FsIHZhcmlhYmxlcyBoZXJlIGluc3RlYWQgb2YgdGhlIGRlZmF1bHQgbGV4aWNhbCBzY29waW5nIGJlaGF2aW9yLiBUaGUgcmVhc29uIEkgd2FudCB0aGlzIGlzIHNvIHRoZSByZXBsIGhhcyBhY2Nlc3MgdG8gdGhlIHZhcmlhYmxlcyBkZWZpbmVkIGluIHRoZSBDb2RlTWlycm9yIGVkaXRvci5cblxuICAgIH0pO1xuXG4gIH1cbn1cblxuLy9hbGxvdyB1c2VyIHRvIGFjY2VzcyBwcmV2aW91c2x5IGVudGVyZWQgY29tbWFuZHNcbnZhciBjb21tYW5kU3RhY2sgPSBbXTtcbnZhciBjb21tYW5kSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gcmVuZGVyKHRleHQpIHtcbiAgJCgnI2NvbnNvbGUgI291dHB1dCcpLmFwcGVuZChgPHA+JHt0ZXh0fTwvcD5gKTtcbn1cblxuZnVuY3Rpb24gcmVwbChlKSB7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbiAgdmFyIGNvZGUgPSAkKGUudGFyZ2V0KS5maW5kKCdpbnB1dCcpLnZhbCgpO1xuICBjb21tYW5kU3RhY2sudW5zaGlmdChjb2RlKTtcbiAgY29tbWFuZFN0YWNrID0gY29tbWFuZFN0YWNrLnNsaWNlKDAsIDkpO1xuICBjb21tYW5kSW5kZXggPSAtMTtcbiAgd3JhcExvZ091dHB1dCgoKSA9PiB7XG4gICAgJChlLnRhcmdldCkuZmluZCgnaW5wdXQnKS52YWwoJycpO1xuICAgIHZhciBldmFsRXJyO1xuICAgIHZhciB3cmFwcGVkQ29kZSA9IGB0cnl7ICR7Y29kZX0gfSBjYXRjaChlcnIpIHsgZXZhbEVyciA9IGVyci5zdGFjayB9YDtcbiAgICB2YXIgb3V0cHV0ID0gZXZhbCh3cmFwcGVkQ29kZSk7XG4gICAgaWYgKGV2YWxFcnIpIHtcbiAgICAgIHZhciBlcnJNZXNzYWdlID0gZXZhbEVyci5tYXRjaCgvLiovKVswXTtcbiAgICAgIHJlbmRlcihgPHNwYW4gY2xhc3M9XCJlcnJvclwiPiR7ZXJyTWVzc2FnZX08L3NwYW4+YCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlbmRlcihgPT4gJHtvdXRwdXR9YCk7XG4gICAgfVxuICB9KTtcbn1cblxuLy8gZXhlY3V0ZXMgYSBmdW5jdGlvbiBpbiBhIGNvbnRleHQgd2hlcmUgYWxsIGNhbGxzIHRvIGNvbnNvbGUubG9nIHdpbGwgcmVuZGVyIHRvIHRoZSBET01cbmZ1bmN0aW9uIHdyYXBMb2dPdXRwdXQoZnVuYykge1xuICBjb25zb2xlLm5hdGl2ZUxvZyA9IGNvbnNvbGUubG9nO1xuICBjb25zb2xlLmxvZyA9IGZ1bmN0aW9uKCkge1xuICAgIFtdLmZvckVhY2guY2FsbChhcmd1bWVudHMsIGxpbmUgPT4ge1xuICAgICAgcmVuZGVyKGxpbmUpO1xuICAgIH0pO1xuICAgIGNvbnNvbGUubmF0aXZlTG9nKC4uLmFyZ3VtZW50cyk7XG4gIH1cbiAgZnVuYygpO1xuICBjb25zb2xlLmxvZyA9IGNvbnNvbGUubmF0aXZlTG9nO1xufVxuXG5cblxuXG4iLCJ3aW5kb3cub25sb2FkID0gZnVuY3Rpb24oKSB7XG5cbiAgd2luZG93LmVkaXRvciA9IENvZGVNaXJyb3IuZnJvbVRleHRBcmVhKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZWRpdG9yXCIpLCB7XG4gICAgbGluZU51bWJlcnM6IHRydWUsXG4gICAgbW9kZTogXCJqYXZhc2NyaXB0XCIsXG4gICAgbWF0Y2hCcmFja2V0czogdHJ1ZSxcbiAgICBhdXRvQ2xvc2VCcmFja2V0czogdHJ1ZSxcbiAgICBrZXlNYXA6ICdzdWJsaW1lJ1xuICB9KTtcblxuICB2YXIgd2FpdGluZztcbiAgZWRpdG9yLm9uKFwiY2hhbmdlXCIsICgpID0+IHtcbiAgICBjbGVhclRpbWVvdXQod2FpdGluZyk7XG4gICAgd2FpdGluZyA9IHNldFRpbWVvdXQodXBkYXRlRXJyb3JzLCA4MDApO1xuICB9KTtcblxufTtcblxudmFyIGVycldpZGdldHMgPSBbXTtcblxuZnVuY3Rpb24gY2hlY2tGb3JFcnJvcnMoKSB7XG4gIHJldHVybiBlcnJXaWRnZXRzLmxlbmd0aDtcbn1cblxuZnVuY3Rpb24gcmVuZGVyRXJyKGxpbmVOdW0sIGRlc2MsIGNvbE51bSkge1xuICB2YXIgbXNnID0gJChgPGRpdiBjbGFzcz1cImxpbnQtZXJyb3JcIj48c3BhbiBjbGFzcz1cImxpbnQtZXJyb3ItaWNvblwiPiE8L3NwYW4+JHtkZXNjfTwvZGl2PmApWzBdO1xuICBlcnJXaWRnZXRzLnB1c2goXG4gICAgZWRpdG9yLmFkZExpbmVXaWRnZXQobGluZU51bSAtIDEsIG1zZywgeyBjb3Zlckd1dHRlcjogZmFsc2UsIG5vSFNjcm9sbDogdHJ1ZSB9KVxuICApO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVFcnJvcnMoKSB7XG4gIHZhciBjb2RlID0gZWRpdG9yLmdldFZhbHVlKCk7XG5cbiAgZXJyV2lkZ2V0cy5mb3JFYWNoKGVyciA9PiB7XG4gICAgZWRpdG9yLnJlbW92ZUxpbmVXaWRnZXQoZXJyKTtcbiAgfSk7XG4gIGVycldpZGdldHMgPSBbXTtcblxuICB0cnkge1xuICAgIHZhciBzeW50YXggPSBlc3ByaW1hLnBhcnNlKGNvZGUsIHsgdG9sZXJhbnQ6IHRydWUsIGxvYzogdHJ1ZSB9KTtcblxuICAgIHZhciBldmFsRXJyO1xuICAgIHZhciB3cmFwcGVkQ29kZSA9IGB0cnl7ICR7Y29kZX0gfSBjYXRjaChlcnIpIHsgZXZhbEVyciA9IGVyci5zdGFjayB9YDtcbiAgICBldmFsKHdyYXBwZWRDb2RlKTtcbiAgICBpZiAoZXZhbEVycikge1xuICAgICAgdmFyIGVyck1lc3NhZ2UgPSBldmFsRXJyLm1hdGNoKC8uKi8pWzBdO1xuICAgICAgdmFyIFtfXywgbGluZU51bSwgY29sTnVtXSA9IGV2YWxFcnIubWF0Y2goLzxhbm9ueW1vdXM+OihcXGQrKTooXFxkKykvKTtcbiAgICAgIHJlbmRlckVycihsaW5lTnVtLCBlcnJNZXNzYWdlLCBjb2xOdW0pO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgcmVuZGVyRXJyKGVyci5saW5lTnVtYmVyLCBlcnIuZGVzY3JpcHRpb24sIGVyci5jb2x1bW4pO1xuICB9XG5cbn1cblxudmFyIGV4ZWN1dGUgPSByZXF1aXJlKCcuL2V4ZWMnKTtcbmV4ZWN1dGUoY2hlY2tGb3JFcnJvcnMpOyJdfQ==
