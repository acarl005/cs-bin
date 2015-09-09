(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/andrew/Desktop/production/codesmith-bin/src/exec.js":[function(require,module,exports){
module.exports = function (hasErrors) {
  $(document).ready(function () {

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
        return 'fuck you';
      }
      // make sure commandIndex stays in reasonable range
      commandIndex = Math.min(commandStack.length - 1, commandIndex);
      commandIndex = Math.max(-1, commandIndex);
      $('#console form input').val(commandStack[commandIndex]);
    });
  });

  setTimeout(execute, 1000);
  function execute() {
    if (hasErrors()) return alert('fix errors first');

    $('#console #output').empty();
    var code = editor.getValue();

    wrapLogOutput(function () {

      eval(code);

      $('#console form').off('submit');
      $('#console form').on('submit', function (e) {
        e.preventDefault();
        var code = $(e.target).find('input').val();
        commandStack.unshift(code);
        commandStack = commandStack.slice(0, 9);
        commandIndex = -1;
        wrapLogOutput(function () {
          $(e.target).find('input').val('');
          try {
            var output = eval(code);
            render('=> ' + output);
          } catch (err) {
            render('<span class="error">ERROR</span>');
          }
        });
      });
    });
  }
};

var commandStack = [];
var commandIndex = -1;

function render(text) {
  $('#console #output').append('<p>' + text + '</p>');
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

  window.editor = CodeMirror(document.getElementById("editor"), {
    lineNumbers: true,
    mode: "javascript",
    value: "",
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
  var msg = document.createElement("div");
  var icon = msg.appendChild(document.createElement("span"));
  icon.innerHTML = "!";
  icon.className = "lint-error-icon";
  msg.appendChild(document.createTextNode(desc));
  msg.className = "lint-error";
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9hbmRyZXcvRGVza3RvcC9wcm9kdWN0aW9uL2NvZGVzbWl0aC1iaW4vc3JjL2V4ZWMuanMiLCIvaG9tZS9hbmRyZXcvRGVza3RvcC9wcm9kdWN0aW9uL2NvZGVzbWl0aC1iaW4vc3JjL3JlcGwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVMsU0FBUyxFQUFFO0FBQ25DLEdBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUMsWUFBTTs7QUFFdEIsS0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDbkMsS0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsVUFBQSxDQUFDLEVBQUk7QUFDNUIsT0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUMsT0FBTyxJQUFJLE9BQU8sRUFBRSxDQUFDO0tBQ3JDLENBQUMsQ0FBQzs7QUFFSCxLQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxVQUFBLENBQUMsRUFBSTtBQUNwQyxVQUFJLENBQUMsQ0FBQyxPQUFPLEtBQUssRUFBRSxFQUFFOztBQUNwQixvQkFBWSxFQUFFLENBQUM7T0FDaEIsTUFBTSxJQUFJLENBQUMsQ0FBQyxPQUFPLEtBQUssRUFBRSxFQUFFOztBQUMzQixvQkFBWSxFQUFFLENBQUM7T0FDaEIsTUFBTTtBQUNMLGVBQU8sVUFBVSxDQUFDO09BQ25COztBQUVELGtCQUFZLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxZQUFZLENBQUMsQ0FBQztBQUMvRCxrQkFBWSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVB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Q0FBQzs7QUFFN0IsWUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFBLEdBQUcsRUFBSTtBQUN4QixVQUFNLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUM7R0FDOUIsQ0FBQyxDQUFDO0FBQ0gsWUFBVSxHQUFHLEVBQUUsQ0FBQzs7QUFFaEIsTUFBSTtBQUNGLFFBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQzs7QUFFaEUsUUFBSSxPQUFPLENBQUM7QUFDWixRQUFJLFdBQVcsYUFBVyxJQUFJLDBDQUF1QyxDQUFDO0FBQ3RFLFFBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNsQixRQUFJLE9BQU8sRUFBRTtBQUNYLFVBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7OzJCQUNaLE9BQU8sQ0FBQyxLQUFLLENBQUMseUJBQXlCLENBQUM7Ozs7VUFBL0QsRUFBRTtVQUFFLE9BQU87VUFBRSxNQUFNOztBQUN4QixlQUFTLENBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztLQUN4QztHQUNGLENBQUMsT0FBTyxHQUFHLEVBQUU7QUFDWixhQUFTLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztHQUN4RDtDQUVGOztBQUVELElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNoQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihoYXNFcnJvcnMpIHtcbiAgJChkb2N1bWVudCkucmVhZHkoKCkgPT4ge1xuXG4gICAgJCgnI2V4ZWN1dGUnKS5vbignY2xpY2snLCBleGVjdXRlKTtcbiAgICAkKHdpbmRvdykub24oJ2tleXByZXNzJywgZSA9PiB7XG4gICAgICBlLmN0cmxLZXkgJiYgZS5rZXlDb2RlICYmIGV4ZWN1dGUoKTsgICAvL2V4ZWN1dGUgaWYgdGhleSBwcmVzcyBjdHJsK2JcbiAgICB9KTtcblxuICAgICQoJyNjb25zb2xlIGZvcm0nKS5vbigna2V5ZG93bicsIGUgPT4ge1xuICAgICAgaWYgKGUua2V5Q29kZSA9PT0gMzgpIHsgIC8vdXAgYXJyb3cga2V5XG4gICAgICAgIGNvbW1hbmRJbmRleCsrO1xuICAgICAgfSBlbHNlIGlmIChlLmtleUNvZGUgPT09IDQwKSB7ICAvL2Rvd24gYXJyb3cga2V5XG4gICAgICAgIGNvbW1hbmRJbmRleC0tO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuICdmdWNrIHlvdSc7XG4gICAgICB9XG4gICAgICAvLyBtYWtlIHN1cmUgY29tbWFuZEluZGV4IHN0YXlzIGluIHJlYXNvbmFibGUgcmFuZ2VcbiAgICAgIGNvbW1hbmRJbmRleCA9IE1hdGgubWluKGNvbW1hbmRTdGFjay5sZW5ndGggLSAxLCBjb21tYW5kSW5kZXgpO1xuICAgICAgY29tbWFuZEluZGV4ID0gTWF0aC5tYXgoLTEsIGNvbW1hbmRJbmRleCk7XG4gICAgICAkKCcjY29uc29sZSBmb3JtIGlucHV0JykudmFsKGNvbW1hbmRTdGFja1tjb21tYW5kSW5kZXhdKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgc2V0VGltZW91dChleGVjdXRlLCAxMDAwKTtcbiAgZnVuY3Rpb24gZXhlY3V0ZSgpIHtcbiAgICBpZiAoaGFzRXJyb3JzKCkpIHJldHVybiBhbGVydCgnZml4IGVycm9ycyBmaXJzdCcpO1xuXG4gICAgJCgnI2NvbnNvbGUgI291dHB1dCcpLmVtcHR5KCk7XG4gICAgdmFyIGNvZGUgPSBlZGl0b3IuZ2V0VmFsdWUoKTtcblxuICAgIHdyYXBMb2dPdXRwdXQoKCkgPT4ge1xuXG4gICAgICBldmFsKGNvZGUpO1xuXG4gICAgICAkKCcjY29uc29sZSBmb3JtJykub2ZmKCdzdWJtaXQnKTtcbiAgICAgICQoJyNjb25zb2xlIGZvcm0nKS5vbignc3VibWl0JywgZSA9PiB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdmFyIGNvZGUgPSAkKGUudGFyZ2V0KS5maW5kKCdpbnB1dCcpLnZhbCgpO1xuICAgICAgICBjb21tYW5kU3RhY2sudW5zaGlmdChjb2RlKTtcbiAgICAgICAgY29tbWFuZFN0YWNrID0gY29tbWFuZFN0YWNrLnNsaWNlKDAsIDkpO1xuICAgICAgICBjb21tYW5kSW5kZXggPSAtMTtcbiAgICAgICAgd3JhcExvZ091dHB1dCgoKSA9PiB7XG4gICAgICAgICAgJChlLnRhcmdldCkuZmluZCgnaW5wdXQnKS52YWwoJycpO1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICB2YXIgb3V0cHV0ID0gZXZhbChjb2RlKTtcbiAgICAgICAgICAgIHJlbmRlcihgPT4gJHtvdXRwdXR9YCk7XG4gICAgICAgICAgfSBjYXRjaChlcnIpIHtcbiAgICAgICAgICAgIHJlbmRlcignPHNwYW4gY2xhc3M9XCJlcnJvclwiPkVSUk9SPC9zcGFuPicpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgIH0pO1xuXG4gIH1cbn1cblxudmFyIGNvbW1hbmRTdGFjayA9IFtdO1xudmFyIGNvbW1hbmRJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiByZW5kZXIodGV4dCkge1xuICAkKCcjY29uc29sZSAjb3V0cHV0JykuYXBwZW5kKGA8cD4ke3RleHR9PC9wPmApO1xufVxuXG4vLyBleGVjdXRlcyBhIGZ1bmN0aW9uIGluIGEgY29udGV4dCB3aGVyZSBhbGwgY2FsbHMgdG8gY29uc29sZS5sb2cgd2lsbCByZW5kZXIgdG8gdGhlIERPTVxuZnVuY3Rpb24gd3JhcExvZ091dHB1dChmdW5jKSB7XG4gIGNvbnNvbGUubmF0aXZlTG9nID0gY29uc29sZS5sb2c7XG4gIGNvbnNvbGUubG9nID0gZnVuY3Rpb24oKSB7XG4gICAgW10uZm9yRWFjaC5jYWxsKGFyZ3VtZW50cywgbGluZSA9PiB7XG4gICAgICByZW5kZXIobGluZSk7XG4gICAgfSk7XG4gICAgY29uc29sZS5uYXRpdmVMb2coLi4uYXJndW1lbnRzKTtcbiAgfVxuICBmdW5jKCk7XG4gIGNvbnNvbGUubG9nID0gY29uc29sZS5uYXRpdmVMb2c7XG59XG5cblxuXG5cbiIsIndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbigpIHtcblxuICB3aW5kb3cuZWRpdG9yID0gQ29kZU1pcnJvcihkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImVkaXRvclwiKSwge1xuICAgIGxpbmVOdW1iZXJzOiB0cnVlLFxuICAgIG1vZGU6IFwiamF2YXNjcmlwdFwiLFxuICAgIHZhbHVlOiBcIlwiLFxuICAgIG1hdGNoQnJhY2tldHM6IHRydWUsXG4gICAgYXV0b0Nsb3NlQnJhY2tldHM6IHRydWUsXG4gICAga2V5TWFwOiAnc3VibGltZSdcbiAgfSk7XG5cbiAgdmFyIHdhaXRpbmc7XG4gIGVkaXRvci5vbihcImNoYW5nZVwiLCAoKSA9PiB7XG4gICAgY2xlYXJUaW1lb3V0KHdhaXRpbmcpO1xuICAgIHdhaXRpbmcgPSBzZXRUaW1lb3V0KHVwZGF0ZUVycm9ycywgODAwKTtcbiAgfSk7XG5cbn07XG5cbnZhciBlcnJXaWRnZXRzID0gW107XG5cbmZ1bmN0aW9uIGNoZWNrRm9yRXJyb3JzKCkge1xuICByZXR1cm4gZXJyV2lkZ2V0cy5sZW5ndGg7XG59XG5cbmZ1bmN0aW9uIHJlbmRlckVycihsaW5lTnVtLCBkZXNjLCBjb2xOdW0pIHtcbiAgdmFyIG1zZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gIHZhciBpY29uID0gbXNnLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpKTtcbiAgaWNvbi5pbm5lckhUTUwgPSBcIiFcIjtcbiAgaWNvbi5jbGFzc05hbWUgPSBcImxpbnQtZXJyb3ItaWNvblwiO1xuICBtc2cuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoZGVzYykpO1xuICBtc2cuY2xhc3NOYW1lID0gXCJsaW50LWVycm9yXCI7XG4gIGVycldpZGdldHMucHVzaChcbiAgICBlZGl0b3IuYWRkTGluZVdpZGdldChsaW5lTnVtIC0gMSwgbXNnLCB7IGNvdmVyR3V0dGVyOiBmYWxzZSwgbm9IU2Nyb2xsOiB0cnVlIH0pXG4gICk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUVycm9ycygpIHtcbiAgdmFyIGNvZGUgPSBlZGl0b3IuZ2V0VmFsdWUoKTtcblxuICBlcnJXaWRnZXRzLmZvckVhY2goZXJyID0+IHtcbiAgICBlZGl0b3IucmVtb3ZlTGluZVdpZGdldChlcnIpO1xuICB9KTtcbiAgZXJyV2lkZ2V0cyA9IFtdO1xuXG4gIHRyeSB7XG4gICAgdmFyIHN5bnRheCA9IGVzcHJpbWEucGFyc2UoY29kZSwgeyB0b2xlcmFudDogdHJ1ZSwgbG9jOiB0cnVlIH0pO1xuXG4gICAgdmFyIGV2YWxFcnI7XG4gICAgdmFyIHdyYXBwZWRDb2RlID0gYHRyeXsgJHtjb2RlfSB9IGNhdGNoKGVycikgeyBldmFsRXJyID0gZXJyLnN0YWNrIH1gO1xuICAgIGV2YWwod3JhcHBlZENvZGUpO1xuICAgIGlmIChldmFsRXJyKSB7XG4gICAgICB2YXIgZXJyTWVzc2FnZSA9IGV2YWxFcnIubWF0Y2goLy4qLylbMF07XG4gICAgICB2YXIgW19fLCBsaW5lTnVtLCBjb2xOdW1dID0gZXZhbEVyci5tYXRjaCgvPGFub255bW91cz46KFxcZCspOihcXGQrKS8pO1xuICAgICAgcmVuZGVyRXJyKGxpbmVOdW0sIGVyck1lc3NhZ2UsIGNvbE51bSk7XG4gICAgfVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICByZW5kZXJFcnIoZXJyLmxpbmVOdW1iZXIsIGVyci5kZXNjcmlwdGlvbiwgZXJyLmNvbHVtbik7XG4gIH1cblxufVxuXG52YXIgZXhlY3V0ZSA9IHJlcXVpcmUoJy4vZXhlYycpO1xuZXhlY3V0ZShjaGVja0ZvckVycm9ycyk7Il19
