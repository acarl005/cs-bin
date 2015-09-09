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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9hbmRyZXcvRGVza3RvcC9wcm9kdWN0aW9uL2NvZGVzbWl0aC1iaW4vc3JjL2V4ZWMuanMiLCIvaG9tZS9hbmRyZXcvRGVza3RvcC9wcm9kdWN0aW9uL2NvZGVzbWl0aC1iaW4vc3JjL3JlcGwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVMsU0FBUyxFQUFFO0FBQ25DLEdBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUMsWUFBTTs7QUFFdEIsS0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDdEMsS0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDbkMsS0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsVUFBQSxDQUFDLEVBQUk7QUFDNUIsT0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUMsT0FBTyxJQUFJLE9BQU8sRUFBRSxDQUFDO0tBQ3JDLENBQUMsQ0FBQzs7QUFFSCxLQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxVQUFBLENBQUMsRUFBSTtBQUNwQyxVQUFJLENBQUMsQ0FBQyxPQUFPLEtBQUssRUFBRSxFQUFFOztBQUNwQixvQkFBWSxFQUFFLENBQUM7T0FDaEIsTUFBTSxJQUFJLENBQUMsQ0FBQyxPQUFPLEtBQUssRUFBRSxFQUFFOztBQUMzQixvQkFBWSxFQUFFLENBQUM7T0FDaEIsTUFBTTtBQUNMLGVBQU8sb0JBQW9CLENBQUM7T0FDN0I7O0FBRUQsa0JBQVksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxF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QUFPLENBQUMsVUFBQSxHQUFHLEVBQUk7QUFDeEIsVUFBTSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDO0dBQzlCLENBQUMsQ0FBQztBQUNILFlBQVUsR0FBRyxFQUFFLENBQUM7O0FBRWhCLE1BQUk7QUFDRixRQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7O0FBRWhFLFFBQUksT0FBTyxDQUFDO0FBQ1osUUFBSSxXQUFXLGFBQVcsSUFBSSwwQ0FBdUMsQ0FBQztBQUN0RSxRQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDbEIsUUFBSSxPQUFPLEVBQUU7QUFDWCxVQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOzsyQkFDWixPQUFPLENBQUMsS0FBSyxDQUFDLHlCQUF5QixDQUFDOzs7O1VBQS9ELEVBQUU7VUFBRSxPQUFPO1VBQUUsTUFBTTs7QUFDeEIsZUFBUyxDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxDQUFDLENBQUM7S0FDeEM7R0FDRixDQUFDLE9BQU8sR0FBRyxFQUFFO0FBQ1osYUFBUyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7R0FDeEQ7Q0FFRjs7QUFFRCxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDaEMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaGFzRXJyb3JzKSB7XG4gICQoZG9jdW1lbnQpLnJlYWR5KCgpID0+IHtcblxuICAgICQoJyNjb25zb2xlIGZvcm0nKS5vbignc3VibWl0JywgcmVwbCk7XG4gICAgJCgnI2V4ZWN1dGUnKS5vbignY2xpY2snLCBleGVjdXRlKTtcbiAgICAkKHdpbmRvdykub24oJ2tleXByZXNzJywgZSA9PiB7XG4gICAgICBlLmN0cmxLZXkgJiYgZS5rZXlDb2RlICYmIGV4ZWN1dGUoKTsgICAvL2V4ZWN1dGUgaWYgdGhleSBwcmVzcyBjdHJsK2JcbiAgICB9KTtcblxuICAgICQoJyNjb25zb2xlIGZvcm0nKS5vbigna2V5ZG93bicsIGUgPT4ge1xuICAgICAgaWYgKGUua2V5Q29kZSA9PT0gMzgpIHsgIC8vdXAgYXJyb3cga2V5XG4gICAgICAgIGNvbW1hbmRJbmRleCsrO1xuICAgICAgfSBlbHNlIGlmIChlLmtleUNvZGUgPT09IDQwKSB7ICAvL2Rvd24gYXJyb3cga2V5XG4gICAgICAgIGNvbW1hbmRJbmRleC0tO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuICd3ZSBjYW4gaWdub3JlIHRoaXMnO1xuICAgICAgfVxuICAgICAgLy8gbWFrZSBzdXJlIGNvbW1hbmRJbmRleCBzdGF5cyBpbiByZWFzb25hYmxlIHJhbmdlXG4gICAgICBjb21tYW5kSW5kZXggPSBNYXRoLm1pbihjb21tYW5kU3RhY2subGVuZ3RoIC0gMSwgY29tbWFuZEluZGV4KTtcbiAgICAgIGNvbW1hbmRJbmRleCA9IE1hdGgubWF4KC0xLCBjb21tYW5kSW5kZXgpO1xuICAgICAgJCgnI2NvbnNvbGUgZm9ybSBpbnB1dCcpLnZhbChjb21tYW5kU3RhY2tbY29tbWFuZEluZGV4XSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIGV4ZWN1dGUoKSB7XG4gICAgJCgnI2NvbnNvbGUgI291dHB1dCcpLmVtcHR5KCk7XG4gICAgaWYgKGhhc0Vycm9ycygpKVxuICAgICAgcmV0dXJuIHJlbmRlcignPHNwYW4gY2xhc3M9XCJlcnJvclwiPlRoZXJlIGFyZSBlcnJvcnMgaW4gdGhlIGVkaXRvci4gRml4IHRoZW0gYmVmb3JlIGV4ZWN1dGluZy48L3NwYW4+Jyk7XG5cbiAgICB2YXIgY29kZSA9IGVkaXRvci5nZXRWYWx1ZSgpO1xuXG4gICAgd3JhcExvZ091dHB1dCgoKSA9PiB7XG5cbiAgICAgIGV2YWwoY29kZSk7XG5cbiAgICAgICQoJyNjb25zb2xlIGZvcm0nKS5vZmYoJ3N1Ym1pdCcpO1xuICAgICAgJCgnI2NvbnNvbGUgZm9ybScpLm9uKCdzdWJtaXQnLCBldmFsKCcoJytTdHJpbmcocmVwbCkrJyknKSk7XG4gICAgICAvLyB0aGlzIGV2YWwvU3RyaW5nIHRoaW5nIGlzIHByZXR0eSB3ZWlyZCByaWdodD8gSXQncyBiYXNpY2FsbHkgYSBoYWNrIHRoYXQgUm9iIGFuZCBJIGRldmlzZWQgdG8gXCJjbG9uZVwiIGEgZnVuY3Rpb24uIEl0IHRha2VzIGEgZnVuYywgY29udmVydHMgdG8gYSBzdHJpbmcsIHRoZW4gcmVkZWZpbmVzIGl0IGluIGFuIGV2YWwuIFRoaXMgZWZmZWN0aXZlbHkgYWNoaWV2ZXMgZHluYW1pYyBzY29waW5nLiBCeSByZWRlZmluaW5nIGl0IGluIHRoaXMgc2NvcGUsIEkgY2FuIGFjY2VzcyB0aGUgbG9jYWwgdmFyaWFibGVzIGhlcmUgaW5zdGVhZCBvZiB0aGUgZGVmYXVsdCBsZXhpY2FsIHNjb3BpbmcgYmVoYXZpb3IuIFRoZSByZWFzb24gSSB3YW50IHRoaXMgaXMgc28gdGhlIHJlcGwgaGFzIGFjY2VzcyB0byB0aGUgdmFyaWFibGVzIGRlZmluZWQgaW4gdGhlIENvZGVNaXJyb3IgZWRpdG9yLlxuXG4gICAgfSk7XG5cbiAgfVxufVxuXG4vL2FsbG93IHVzZXIgdG8gYWNjZXNzIHByZXZpb3VzbHkgZW50ZXJlZCBjb21tYW5kc1xudmFyIGNvbW1hbmRTdGFjayA9IFtdO1xudmFyIGNvbW1hbmRJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiByZW5kZXIodGV4dCkge1xuICAkKCcjY29uc29sZSAjb3V0cHV0JykuYXBwZW5kKGA8cD4ke3RleHR9PC9wPmApO1xufVxuXG5mdW5jdGlvbiByZXBsKGUpIHtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICB2YXIgY29kZSA9ICQoZS50YXJnZXQpLmZpbmQoJ2lucHV0JykudmFsKCk7XG4gIGNvbW1hbmRTdGFjay51bnNoaWZ0KGNvZGUpO1xuICBjb21tYW5kU3RhY2sgPSBjb21tYW5kU3RhY2suc2xpY2UoMCwgOSk7XG4gIGNvbW1hbmRJbmRleCA9IC0xO1xuICB3cmFwTG9nT3V0cHV0KCgpID0+IHtcbiAgICAkKGUudGFyZ2V0KS5maW5kKCdpbnB1dCcpLnZhbCgnJyk7XG4gICAgdmFyIGV2YWxFcnI7XG4gICAgdmFyIHdyYXBwZWRDb2RlID0gYHRyeXsgJHtjb2RlfSB9IGNhdGNoKGVycikgeyBldmFsRXJyID0gZXJyLnN0YWNrIH1gO1xuICAgIHZhciBvdXRwdXQgPSBldmFsKHdyYXBwZWRDb2RlKTtcbiAgICBpZiAoZXZhbEVycikge1xuICAgICAgdmFyIGVyck1lc3NhZ2UgPSBldmFsRXJyLm1hdGNoKC8uKi8pWzBdO1xuICAgICAgcmVuZGVyKGA8c3BhbiBjbGFzcz1cImVycm9yXCI+JHtlcnJNZXNzYWdlfTwvc3Bhbj5gKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVuZGVyKGA9PiAke291dHB1dH1gKTtcbiAgICB9XG4gIH0pO1xufVxuXG4vLyBleGVjdXRlcyBhIGZ1bmN0aW9uIGluIGEgY29udGV4dCB3aGVyZSBhbGwgY2FsbHMgdG8gY29uc29sZS5sb2cgd2lsbCByZW5kZXIgdG8gdGhlIERPTVxuZnVuY3Rpb24gd3JhcExvZ091dHB1dChmdW5jKSB7XG4gIGNvbnNvbGUubmF0aXZlTG9nID0gY29uc29sZS5sb2c7XG4gIGNvbnNvbGUubG9nID0gZnVuY3Rpb24oKSB7XG4gICAgW10uZm9yRWFjaC5jYWxsKGFyZ3VtZW50cywgbGluZSA9PiB7XG4gICAgICByZW5kZXIobGluZSk7XG4gICAgfSk7XG4gICAgY29uc29sZS5uYXRpdmVMb2coLi4uYXJndW1lbnRzKTtcbiAgfVxuICBmdW5jKCk7XG4gIGNvbnNvbGUubG9nID0gY29uc29sZS5uYXRpdmVMb2c7XG59XG5cblxuXG5cbiIsIndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbigpIHtcblxuICB3aW5kb3cuZWRpdG9yID0gQ29kZU1pcnJvci5mcm9tVGV4dEFyZWEoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlZGl0b3JcIiksIHtcbiAgICBsaW5lTnVtYmVyczogdHJ1ZSxcbiAgICBtb2RlOiBcImphdmFzY3JpcHRcIixcbiAgICB2YWx1ZTogXCJcIixcbiAgICBtYXRjaEJyYWNrZXRzOiB0cnVlLFxuICAgIGF1dG9DbG9zZUJyYWNrZXRzOiB0cnVlLFxuICAgIGtleU1hcDogJ3N1YmxpbWUnXG4gIH0pO1xuXG4gIHZhciB3YWl0aW5nO1xuICBlZGl0b3Iub24oXCJjaGFuZ2VcIiwgKCkgPT4ge1xuICAgIGNsZWFyVGltZW91dCh3YWl0aW5nKTtcbiAgICB3YWl0aW5nID0gc2V0VGltZW91dCh1cGRhdGVFcnJvcnMsIDgwMCk7XG4gIH0pO1xuXG59O1xuXG52YXIgZXJyV2lkZ2V0cyA9IFtdO1xuXG5mdW5jdGlvbiBjaGVja0ZvckVycm9ycygpIHtcbiAgcmV0dXJuIGVycldpZGdldHMubGVuZ3RoO1xufVxuXG5mdW5jdGlvbiByZW5kZXJFcnIobGluZU51bSwgZGVzYywgY29sTnVtKSB7XG4gIHZhciBtc2cgPSAkKGA8ZGl2IGNsYXNzPVwibGludC1lcnJvclwiPjxzcGFuIGNsYXNzPVwibGludC1lcnJvci1pY29uXCI+ITwvc3Bhbj4ke2Rlc2N9PC9kaXY+YClbMF07XG4gIGVycldpZGdldHMucHVzaChcbiAgICBlZGl0b3IuYWRkTGluZVdpZGdldChsaW5lTnVtIC0gMSwgbXNnLCB7IGNvdmVyR3V0dGVyOiBmYWxzZSwgbm9IU2Nyb2xsOiB0cnVlIH0pXG4gICk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUVycm9ycygpIHtcbiAgdmFyIGNvZGUgPSBlZGl0b3IuZ2V0VmFsdWUoKTtcblxuICBlcnJXaWRnZXRzLmZvckVhY2goZXJyID0+IHtcbiAgICBlZGl0b3IucmVtb3ZlTGluZVdpZGdldChlcnIpO1xuICB9KTtcbiAgZXJyV2lkZ2V0cyA9IFtdO1xuXG4gIHRyeSB7XG4gICAgdmFyIHN5bnRheCA9IGVzcHJpbWEucGFyc2UoY29kZSwgeyB0b2xlcmFudDogdHJ1ZSwgbG9jOiB0cnVlIH0pO1xuXG4gICAgdmFyIGV2YWxFcnI7XG4gICAgdmFyIHdyYXBwZWRDb2RlID0gYHRyeXsgJHtjb2RlfSB9IGNhdGNoKGVycikgeyBldmFsRXJyID0gZXJyLnN0YWNrIH1gO1xuICAgIGV2YWwod3JhcHBlZENvZGUpO1xuICAgIGlmIChldmFsRXJyKSB7XG4gICAgICB2YXIgZXJyTWVzc2FnZSA9IGV2YWxFcnIubWF0Y2goLy4qLylbMF07XG4gICAgICB2YXIgW19fLCBsaW5lTnVtLCBjb2xOdW1dID0gZXZhbEVyci5tYXRjaCgvPGFub255bW91cz46KFxcZCspOihcXGQrKS8pO1xuICAgICAgcmVuZGVyRXJyKGxpbmVOdW0sIGVyck1lc3NhZ2UsIGNvbE51bSk7XG4gICAgfVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICByZW5kZXJFcnIoZXJyLmxpbmVOdW1iZXIsIGVyci5kZXNjcmlwdGlvbiwgZXJyLmNvbHVtbik7XG4gIH1cblxufVxuXG52YXIgZXhlY3V0ZSA9IHJlcXVpcmUoJy4vZXhlYycpO1xuZXhlY3V0ZShjaGVja0ZvckVycm9ycyk7Il19
