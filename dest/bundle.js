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
    keyMap: 'sublime',
    tabSize: 2,
    theme: 'ttcn'
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9hbmRyZXcvRGVza3RvcC9wcm9kdWN0aW9uL2NvZGVzbWl0aC1iaW4vc3JjL2V4ZWMuanMiLCIvaG9tZS9hbmRyZXcvRGVza3RvcC9wcm9kdWN0aW9uL2NvZGVzbWl0aC1iaW4vc3JjL3JlcGwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVMsU0FBUyxFQUFFO0FBQ25DLEdBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUMsWUFBTTs7QUFFdEIsS0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDdEMsS0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDbkMsS0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsVUFBQSxDQUFDLEVBQUk7QUFDNUIsT0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUMsT0FBTyxJQUFJLE9BQU8sRUFBRSxDQUFDO0tBQ3JDLENBQUMsQ0FBQzs7QUFFSCxLQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxVQUFBLENBQUMsRUFBSTtBQUNwQyxVQUFJLENBQUMsQ0FBQyxPQUFPLEtBQUssRUFBRSxFQUFFOztBQUNwQixvQkFBWSxFQUFFLENBQUM7T0FDaEIsTUFBTSxJQUFJLENBQUMsQ0FBQyxPQUFPLEtBQUssRUFBRSxFQUFFOztBQUMzQixvQkFBWSxFQUFFLENBQUM7T0FDaEIsTUFBTTtBQUNMLGVBQU8sb0JBQW9CLENBQUM7T0FDN0I7O0FBRUQsa0JBQVksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxF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Qzs7QUFFN0IsWUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFBLEdBQUcsRUFBSTtBQUN4QixVQUFNLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUM7R0FDOUIsQ0FBQyxDQUFDO0FBQ0gsWUFBVSxHQUFHLEVBQUUsQ0FBQzs7QUFFaEIsTUFBSTtBQUNGLFFBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQzs7QUFFaEUsUUFBSSxPQUFPLENBQUM7QUFDWixRQUFJLFdBQVcsYUFBVyxJQUFJLDBDQUF1QyxDQUFDO0FBQ3RFLFFBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNsQixRQUFJLE9BQU8sRUFBRTtBQUNYLFVBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7OzJCQUNaLE9BQU8sQ0FBQyxLQUFLLENBQUMseUJBQXlCLENBQUM7Ozs7VUFBL0QsRUFBRTtVQUFFLE9BQU87VUFBRSxNQUFNOztBQUN4QixlQUFTLENBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztLQUN4QztHQUNGLENBQUMsT0FBTyxHQUFHLEVBQUU7QUFDWixhQUFTLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztHQUN4RDtDQUVGOztBQUVELElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNoQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihoYXNFcnJvcnMpIHtcbiAgJChkb2N1bWVudCkucmVhZHkoKCkgPT4ge1xuXG4gICAgJCgnI2NvbnNvbGUgZm9ybScpLm9uKCdzdWJtaXQnLCByZXBsKTtcbiAgICAkKCcjZXhlY3V0ZScpLm9uKCdjbGljaycsIGV4ZWN1dGUpO1xuICAgICQod2luZG93KS5vbigna2V5cHJlc3MnLCBlID0+IHtcbiAgICAgIGUuY3RybEtleSAmJiBlLmtleUNvZGUgJiYgZXhlY3V0ZSgpOyAgIC8vZXhlY3V0ZSBpZiB0aGV5IHByZXNzIGN0cmwrYlxuICAgIH0pO1xuXG4gICAgJCgnI2NvbnNvbGUgZm9ybScpLm9uKCdrZXlkb3duJywgZSA9PiB7XG4gICAgICBpZiAoZS5rZXlDb2RlID09PSAzOCkgeyAgLy91cCBhcnJvdyBrZXlcbiAgICAgICAgY29tbWFuZEluZGV4Kys7XG4gICAgICB9IGVsc2UgaWYgKGUua2V5Q29kZSA9PT0gNDApIHsgIC8vZG93biBhcnJvdyBrZXlcbiAgICAgICAgY29tbWFuZEluZGV4LS07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gJ3dlIGNhbiBpZ25vcmUgdGhpcyc7XG4gICAgICB9XG4gICAgICAvLyBtYWtlIHN1cmUgY29tbWFuZEluZGV4IHN0YXlzIGluIHJlYXNvbmFibGUgcmFuZ2VcbiAgICAgIGNvbW1hbmRJbmRleCA9IE1hdGgubWluKGNvbW1hbmRTdGFjay5sZW5ndGggLSAxLCBjb21tYW5kSW5kZXgpO1xuICAgICAgY29tbWFuZEluZGV4ID0gTWF0aC5tYXgoLTEsIGNvbW1hbmRJbmRleCk7XG4gICAgICAkKCcjY29uc29sZSBmb3JtIGlucHV0JykudmFsKGNvbW1hbmRTdGFja1tjb21tYW5kSW5kZXhdKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZnVuY3Rpb24gZXhlY3V0ZSgpIHtcbiAgICAkKCcjY29uc29sZSAjb3V0cHV0JykuZW1wdHkoKTtcbiAgICBpZiAoaGFzRXJyb3JzKCkpXG4gICAgICByZXR1cm4gcmVuZGVyKCc8c3BhbiBjbGFzcz1cImVycm9yXCI+VGhlcmUgYXJlIGVycm9ycyBpbiB0aGUgZWRpdG9yLiBGaXggdGhlbSBiZWZvcmUgZXhlY3V0aW5nLjwvc3Bhbj4nKTtcblxuICAgIHZhciBjb2RlID0gZWRpdG9yLmdldFZhbHVlKCk7XG5cbiAgICB3cmFwTG9nT3V0cHV0KCgpID0+IHtcblxuICAgICAgZXZhbChjb2RlKTtcblxuICAgICAgJCgnI2NvbnNvbGUgZm9ybScpLm9mZignc3VibWl0Jyk7XG4gICAgICAkKCcjY29uc29sZSBmb3JtJykub24oJ3N1Ym1pdCcsIGV2YWwoJygnK1N0cmluZyhyZXBsKSsnKScpKTtcbiAgICAgIC8vIHRoaXMgZXZhbC9TdHJpbmcgdGhpbmcgaXMgcHJldHR5IHdlaXJkIHJpZ2h0PyBJdCdzIGJhc2ljYWxseSBhIGhhY2sgdGhhdCBSb2IgYW5kIEkgZGV2aXNlZCB0byBcImNsb25lXCIgYSBmdW5jdGlvbi4gSXQgdGFrZXMgYSBmdW5jLCBjb252ZXJ0cyB0byBhIHN0cmluZywgdGhlbiByZWRlZmluZXMgaXQgaW4gYW4gZXZhbC4gVGhpcyBlZmZlY3RpdmVseSBhY2hpZXZlcyBkeW5hbWljIHNjb3BpbmcuIEJ5IHJlZGVmaW5pbmcgaXQgaW4gdGhpcyBzY29wZSwgSSBjYW4gYWNjZXNzIHRoZSBsb2NhbCB2YXJpYWJsZXMgaGVyZSBpbnN0ZWFkIG9mIHRoZSBkZWZhdWx0IGxleGljYWwgc2NvcGluZyBiZWhhdmlvci4gVGhlIHJlYXNvbiBJIHdhbnQgdGhpcyBpcyBzbyB0aGUgcmVwbCBoYXMgYWNjZXNzIHRvIHRoZSB2YXJpYWJsZXMgZGVmaW5lZCBpbiB0aGUgQ29kZU1pcnJvciBlZGl0b3IuXG5cbiAgICB9KTtcblxuICB9XG59XG5cbi8vYWxsb3cgdXNlciB0byBhY2Nlc3MgcHJldmlvdXNseSBlbnRlcmVkIGNvbW1hbmRzXG52YXIgY29tbWFuZFN0YWNrID0gW107XG52YXIgY29tbWFuZEluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIHJlbmRlcih0ZXh0KSB7XG4gICQoJyNjb25zb2xlICNvdXRwdXQnKS5hcHBlbmQoYDxwPiR7dGV4dH08L3A+YCk7XG59XG5cbmZ1bmN0aW9uIHJlcGwoZSkge1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIHZhciBjb2RlID0gJChlLnRhcmdldCkuZmluZCgnaW5wdXQnKS52YWwoKTtcbiAgY29tbWFuZFN0YWNrLnVuc2hpZnQoY29kZSk7XG4gIGNvbW1hbmRTdGFjayA9IGNvbW1hbmRTdGFjay5zbGljZSgwLCA5KTtcbiAgY29tbWFuZEluZGV4ID0gLTE7XG4gIHdyYXBMb2dPdXRwdXQoKCkgPT4ge1xuICAgICQoZS50YXJnZXQpLmZpbmQoJ2lucHV0JykudmFsKCcnKTtcbiAgICB2YXIgZXZhbEVycjtcbiAgICB2YXIgd3JhcHBlZENvZGUgPSBgdHJ5eyAke2NvZGV9IH0gY2F0Y2goZXJyKSB7IGV2YWxFcnIgPSBlcnIuc3RhY2sgfWA7XG4gICAgdmFyIG91dHB1dCA9IGV2YWwod3JhcHBlZENvZGUpO1xuICAgIGlmIChldmFsRXJyKSB7XG4gICAgICB2YXIgZXJyTWVzc2FnZSA9IGV2YWxFcnIubWF0Y2goLy4qLylbMF07XG4gICAgICByZW5kZXIoYDxzcGFuIGNsYXNzPVwiZXJyb3JcIj4ke2Vyck1lc3NhZ2V9PC9zcGFuPmApO1xuICAgIH0gZWxzZSB7XG4gICAgICByZW5kZXIoYD0+ICR7b3V0cHV0fWApO1xuICAgIH1cbiAgfSk7XG59XG5cbi8vIGV4ZWN1dGVzIGEgZnVuY3Rpb24gaW4gYSBjb250ZXh0IHdoZXJlIGFsbCBjYWxscyB0byBjb25zb2xlLmxvZyB3aWxsIHJlbmRlciB0byB0aGUgRE9NXG5mdW5jdGlvbiB3cmFwTG9nT3V0cHV0KGZ1bmMpIHtcbiAgY29uc29sZS5uYXRpdmVMb2cgPSBjb25zb2xlLmxvZztcbiAgY29uc29sZS5sb2cgPSBmdW5jdGlvbigpIHtcbiAgICBbXS5mb3JFYWNoLmNhbGwoYXJndW1lbnRzLCBsaW5lID0+IHtcbiAgICAgIHJlbmRlcihsaW5lKTtcbiAgICB9KTtcbiAgICBjb25zb2xlLm5hdGl2ZUxvZyguLi5hcmd1bWVudHMpO1xuICB9XG4gIGZ1bmMoKTtcbiAgY29uc29sZS5sb2cgPSBjb25zb2xlLm5hdGl2ZUxvZztcbn1cblxuXG5cblxuIiwid2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuXG4gIHdpbmRvdy5lZGl0b3IgPSBDb2RlTWlycm9yLmZyb21UZXh0QXJlYShkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImVkaXRvclwiKSwge1xuICAgIGxpbmVOdW1iZXJzOiB0cnVlLFxuICAgIG1vZGU6IFwiamF2YXNjcmlwdFwiLFxuICAgIG1hdGNoQnJhY2tldHM6IHRydWUsXG4gICAgYXV0b0Nsb3NlQnJhY2tldHM6IHRydWUsXG4gICAga2V5TWFwOiAnc3VibGltZScsXG4gICAgdGFiU2l6ZTogMixcbiAgICB0aGVtZTogJ3R0Y24nXG4gIH0pO1xuXG4gIHZhciB3YWl0aW5nO1xuICBlZGl0b3Iub24oXCJjaGFuZ2VcIiwgKCkgPT4ge1xuICAgIGNsZWFyVGltZW91dCh3YWl0aW5nKTtcbiAgICB3YWl0aW5nID0gc2V0VGltZW91dCh1cGRhdGVFcnJvcnMsIDgwMCk7XG4gIH0pO1xuXG59O1xuXG52YXIgZXJyV2lkZ2V0cyA9IFtdO1xuXG5mdW5jdGlvbiBjaGVja0ZvckVycm9ycygpIHtcbiAgcmV0dXJuIGVycldpZGdldHMubGVuZ3RoO1xufVxuXG5mdW5jdGlvbiByZW5kZXJFcnIobGluZU51bSwgZGVzYywgY29sTnVtKSB7XG4gIHZhciBtc2cgPSAkKGA8ZGl2IGNsYXNzPVwibGludC1lcnJvclwiPjxzcGFuIGNsYXNzPVwibGludC1lcnJvci1pY29uXCI+ITwvc3Bhbj4ke2Rlc2N9PC9kaXY+YClbMF07XG4gIGVycldpZGdldHMucHVzaChcbiAgICBlZGl0b3IuYWRkTGluZVdpZGdldChsaW5lTnVtIC0gMSwgbXNnLCB7IGNvdmVyR3V0dGVyOiBmYWxzZSwgbm9IU2Nyb2xsOiB0cnVlIH0pXG4gICk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUVycm9ycygpIHtcbiAgdmFyIGNvZGUgPSBlZGl0b3IuZ2V0VmFsdWUoKTtcblxuICBlcnJXaWRnZXRzLmZvckVhY2goZXJyID0+IHtcbiAgICBlZGl0b3IucmVtb3ZlTGluZVdpZGdldChlcnIpO1xuICB9KTtcbiAgZXJyV2lkZ2V0cyA9IFtdO1xuXG4gIHRyeSB7XG4gICAgdmFyIHN5bnRheCA9IGVzcHJpbWEucGFyc2UoY29kZSwgeyB0b2xlcmFudDogdHJ1ZSwgbG9jOiB0cnVlIH0pO1xuXG4gICAgdmFyIGV2YWxFcnI7XG4gICAgdmFyIHdyYXBwZWRDb2RlID0gYHRyeXsgJHtjb2RlfSB9IGNhdGNoKGVycikgeyBldmFsRXJyID0gZXJyLnN0YWNrIH1gO1xuICAgIGV2YWwod3JhcHBlZENvZGUpO1xuICAgIGlmIChldmFsRXJyKSB7XG4gICAgICB2YXIgZXJyTWVzc2FnZSA9IGV2YWxFcnIubWF0Y2goLy4qLylbMF07XG4gICAgICB2YXIgW19fLCBsaW5lTnVtLCBjb2xOdW1dID0gZXZhbEVyci5tYXRjaCgvPGFub255bW91cz46KFxcZCspOihcXGQrKS8pO1xuICAgICAgcmVuZGVyRXJyKGxpbmVOdW0sIGVyck1lc3NhZ2UsIGNvbE51bSk7XG4gICAgfVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICByZW5kZXJFcnIoZXJyLmxpbmVOdW1iZXIsIGVyci5kZXNjcmlwdGlvbiwgZXJyLmNvbHVtbik7XG4gIH1cblxufVxuXG52YXIgZXhlY3V0ZSA9IHJlcXVpcmUoJy4vZXhlYycpO1xuZXhlY3V0ZShjaGVja0ZvckVycm9ycyk7Il19
