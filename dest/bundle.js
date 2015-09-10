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
    var errors = hasErrors();
    if (errors[0]) return render('<span class="error">' + errors[0].node.innerText + '</span>');

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
  text = text.replace(/Unexpected end of input/, 'Unexpected end of input: make sure your brackets match');
  $('#console #output').append('<p>' + text + '</p>');
  var console = document.getElementById('console');
  console.scrollTop = console.scrollHeight;
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
  return errWidgets;
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9hbmRyZXcvRGVza3RvcC9wcm9kdWN0aW9uL2NvZGVzbWl0aC1iaW4vc3JjL2V4ZWMuanMiLCIvaG9tZS9hbmRyZXcvRGVza3RvcC9wcm9kdWN0aW9uL2NvZGVzbWl0aC1iaW4vc3JjL3JlcGwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVMsU0FBUyxFQUFFO0FBQ25DLEdBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUMsWUFBTTs7QUFFdEIsS0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDdEMsS0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDbkMsS0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsVUFBQSxDQUFDLEVBQUk7QUFDNUIsT0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUMsT0FBTyxJQUFJLE9BQU8sRUFBRSxDQUFDO0tBQ3JDLENBQUMsQ0FBQzs7QUFFSCxLQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxVQUFBLENBQUMsRUFBSTtBQUNwQyxVQUFJLENBQUMsQ0FBQyxPQUFPLEtBQUssRUFBRSxFQUFFOztBQUNwQixvQkFBWSxFQUFFLENBQUM7T0FDaEIsTUFBTSxJQUFJLENBQUMsQ0FBQyxPQUFPLEtBQUssRUFBRSxFQUFFOztBQUMzQixvQkFBWSxFQUFFLENBQUM7T0FDaEIsTUFBTTtBQUNMLGVBQU8sb0JBQW9CLENBQUM7T0FDN0I7O0FBRUQsa0JBQVksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxF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R0FDeEQ7Q0FFRjs7QUFFRCxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDaEMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaGFzRXJyb3JzKSB7XG4gICQoZG9jdW1lbnQpLnJlYWR5KCgpID0+IHtcblxuICAgICQoJyNjb25zb2xlIGZvcm0nKS5vbignc3VibWl0JywgcmVwbCk7XG4gICAgJCgnI2V4ZWN1dGUnKS5vbignY2xpY2snLCBleGVjdXRlKTtcbiAgICAkKHdpbmRvdykub24oJ2tleXByZXNzJywgZSA9PiB7XG4gICAgICBlLmN0cmxLZXkgJiYgZS5rZXlDb2RlICYmIGV4ZWN1dGUoKTsgICAvL2V4ZWN1dGUgaWYgdGhleSBwcmVzcyBjdHJsK2JcbiAgICB9KTtcblxuICAgICQoJyNjb25zb2xlIGZvcm0nKS5vbigna2V5ZG93bicsIGUgPT4ge1xuICAgICAgaWYgKGUua2V5Q29kZSA9PT0gMzgpIHsgIC8vdXAgYXJyb3cga2V5XG4gICAgICAgIGNvbW1hbmRJbmRleCsrO1xuICAgICAgfSBlbHNlIGlmIChlLmtleUNvZGUgPT09IDQwKSB7ICAvL2Rvd24gYXJyb3cga2V5XG4gICAgICAgIGNvbW1hbmRJbmRleC0tO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuICd3ZSBjYW4gaWdub3JlIHRoaXMnO1xuICAgICAgfVxuICAgICAgLy8gbWFrZSBzdXJlIGNvbW1hbmRJbmRleCBzdGF5cyBpbiByZWFzb25hYmxlIHJhbmdlXG4gICAgICBjb21tYW5kSW5kZXggPSBNYXRoLm1pbihjb21tYW5kU3RhY2subGVuZ3RoIC0gMSwgY29tbWFuZEluZGV4KTtcbiAgICAgIGNvbW1hbmRJbmRleCA9IE1hdGgubWF4KC0xLCBjb21tYW5kSW5kZXgpO1xuICAgICAgJCgnI2NvbnNvbGUgZm9ybSBpbnB1dCcpLnZhbChjb21tYW5kU3RhY2tbY29tbWFuZEluZGV4XSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIGV4ZWN1dGUoKSB7XG4gICAgJCgnI2NvbnNvbGUgI291dHB1dCcpLmVtcHR5KCk7XG4gICAgdmFyIGVycm9ycyA9IGhhc0Vycm9ycygpO1xuICAgIGlmIChlcnJvcnNbMF0pXG4gICAgICByZXR1cm4gcmVuZGVyKGA8c3BhbiBjbGFzcz1cImVycm9yXCI+JHtlcnJvcnNbMF0ubm9kZS5pbm5lclRleHR9PC9zcGFuPmApO1xuXG4gICAgdmFyIGNvZGUgPSBlZGl0b3IuZ2V0VmFsdWUoKTtcblxuICAgIHdyYXBMb2dPdXRwdXQoKCkgPT4ge1xuXG4gICAgICBldmFsKGNvZGUpO1xuXG4gICAgICAkKCcjY29uc29sZSBmb3JtJykub2ZmKCdzdWJtaXQnKTtcbiAgICAgICQoJyNjb25zb2xlIGZvcm0nKS5vbignc3VibWl0JywgZXZhbCgnKCcrU3RyaW5nKHJlcGwpKycpJykpO1xuICAgICAgLy8gdGhpcyBldmFsL1N0cmluZyB0aGluZyBpcyBwcmV0dHkgd2VpcmQgcmlnaHQ/IEl0J3MgYmFzaWNhbGx5IGEgaGFjayB0aGF0IFJvYiBhbmQgSSBkZXZpc2VkIHRvIFwiY2xvbmVcIiBhIGZ1bmN0aW9uLiBJdCB0YWtlcyBhIGZ1bmMsIGNvbnZlcnRzIHRvIGEgc3RyaW5nLCB0aGVuIHJlZGVmaW5lcyBpdCBpbiBhbiBldmFsLiBUaGlzIGVmZmVjdGl2ZWx5IGFjaGlldmVzIGR5bmFtaWMgc2NvcGluZy4gQnkgcmVkZWZpbmluZyBpdCBpbiB0aGlzIHNjb3BlLCBJIGNhbiBhY2Nlc3MgdGhlIGxvY2FsIHZhcmlhYmxlcyBoZXJlIGluc3RlYWQgb2YgdGhlIGRlZmF1bHQgbGV4aWNhbCBzY29waW5nIGJlaGF2aW9yLiBUaGUgcmVhc29uIEkgd2FudCB0aGlzIGlzIHNvIHRoZSByZXBsIGhhcyBhY2Nlc3MgdG8gdGhlIHZhcmlhYmxlcyBkZWZpbmVkIGluIHRoZSBDb2RlTWlycm9yIGVkaXRvci5cblxuICAgIH0pO1xuXG4gIH1cbn1cblxuLy9hbGxvdyB1c2VyIHRvIGFjY2VzcyBwcmV2aW91c2x5IGVudGVyZWQgY29tbWFuZHNcbnZhciBjb21tYW5kU3RhY2sgPSBbXTtcbnZhciBjb21tYW5kSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gcmVuZGVyKHRleHQpIHtcbiAgdGV4dCA9IHRleHQucmVwbGFjZSgvVW5leHBlY3RlZCBlbmQgb2YgaW5wdXQvLCAnVW5leHBlY3RlZCBlbmQgb2YgaW5wdXQ6IG1ha2Ugc3VyZSB5b3VyIGJyYWNrZXRzIG1hdGNoJylcbiAgJCgnI2NvbnNvbGUgI291dHB1dCcpLmFwcGVuZChgPHA+JHt0ZXh0fTwvcD5gKTtcbiAgdmFyIGNvbnNvbGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29uc29sZScpO1xuICBjb25zb2xlLnNjcm9sbFRvcCA9IGNvbnNvbGUuc2Nyb2xsSGVpZ2h0O1xufVxuXG5mdW5jdGlvbiByZXBsKGUpIHtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICB2YXIgY29kZSA9ICQoZS50YXJnZXQpLmZpbmQoJ2lucHV0JykudmFsKCk7XG4gIGNvbW1hbmRTdGFjay51bnNoaWZ0KGNvZGUpO1xuICBjb21tYW5kU3RhY2sgPSBjb21tYW5kU3RhY2suc2xpY2UoMCwgOSk7XG4gIGNvbW1hbmRJbmRleCA9IC0xO1xuICB3cmFwTG9nT3V0cHV0KCgpID0+IHtcbiAgICAkKGUudGFyZ2V0KS5maW5kKCdpbnB1dCcpLnZhbCgnJyk7XG4gICAgdmFyIGV2YWxFcnI7XG4gICAgdmFyIHdyYXBwZWRDb2RlID0gYHRyeXsgJHtjb2RlfSB9IGNhdGNoKGVycikgeyBldmFsRXJyID0gZXJyLnN0YWNrIH1gO1xuICAgIHZhciBvdXRwdXQgPSBldmFsKHdyYXBwZWRDb2RlKTtcbiAgICBpZiAoZXZhbEVycikge1xuICAgICAgdmFyIGVyck1lc3NhZ2UgPSBldmFsRXJyLm1hdGNoKC8uKi8pWzBdO1xuICAgICAgcmVuZGVyKGA8c3BhbiBjbGFzcz1cImVycm9yXCI+JHtlcnJNZXNzYWdlfTwvc3Bhbj5gKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVuZGVyKGA9PiAke291dHB1dH1gKTtcbiAgICB9XG4gIH0pO1xufVxuXG4vLyBleGVjdXRlcyBhIGZ1bmN0aW9uIGluIGEgY29udGV4dCB3aGVyZSBhbGwgY2FsbHMgdG8gY29uc29sZS5sb2cgd2lsbCByZW5kZXIgdG8gdGhlIERPTVxuZnVuY3Rpb24gd3JhcExvZ091dHB1dChmdW5jKSB7XG4gIGNvbnNvbGUubmF0aXZlTG9nID0gY29uc29sZS5sb2c7XG4gIGNvbnNvbGUubG9nID0gZnVuY3Rpb24oKSB7XG4gICAgW10uZm9yRWFjaC5jYWxsKGFyZ3VtZW50cywgbGluZSA9PiB7XG4gICAgICByZW5kZXIobGluZSk7XG4gICAgfSk7XG4gICAgY29uc29sZS5uYXRpdmVMb2coLi4uYXJndW1lbnRzKTtcbiAgfVxuICBmdW5jKCk7XG4gIGNvbnNvbGUubG9nID0gY29uc29sZS5uYXRpdmVMb2c7XG59XG5cblxuXG5cbiIsIndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbigpIHtcblxuICB3aW5kb3cuZWRpdG9yID0gQ29kZU1pcnJvci5mcm9tVGV4dEFyZWEoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlZGl0b3JcIiksIHtcbiAgICBsaW5lTnVtYmVyczogdHJ1ZSxcbiAgICBtb2RlOiBcImphdmFzY3JpcHRcIixcbiAgICBtYXRjaEJyYWNrZXRzOiB0cnVlLFxuICAgIGF1dG9DbG9zZUJyYWNrZXRzOiB0cnVlLFxuICAgIGtleU1hcDogJ3N1YmxpbWUnLFxuICAgIHRhYlNpemU6IDIsXG4gICAgdGhlbWU6ICd0dGNuJ1xuICB9KTtcblxuICB2YXIgd2FpdGluZztcbiAgZWRpdG9yLm9uKFwiY2hhbmdlXCIsICgpID0+IHtcbiAgICBjbGVhclRpbWVvdXQod2FpdGluZyk7XG4gICAgd2FpdGluZyA9IHNldFRpbWVvdXQodXBkYXRlRXJyb3JzLCA4MDApO1xuICB9KTtcblxufTtcblxudmFyIGVycldpZGdldHMgPSBbXTtcblxuZnVuY3Rpb24gY2hlY2tGb3JFcnJvcnMoKSB7XG4gIHJldHVybiBlcnJXaWRnZXRzO1xufVxuXG5mdW5jdGlvbiByZW5kZXJFcnIobGluZU51bSwgZGVzYywgY29sTnVtKSB7XG4gIHZhciBtc2cgPSAkKGA8ZGl2IGNsYXNzPVwibGludC1lcnJvclwiPjxzcGFuIGNsYXNzPVwibGludC1lcnJvci1pY29uXCI+ITwvc3Bhbj4ke2Rlc2N9PC9kaXY+YClbMF07XG4gIGVycldpZGdldHMucHVzaChcbiAgICBlZGl0b3IuYWRkTGluZVdpZGdldChsaW5lTnVtIC0gMSwgbXNnLCB7IGNvdmVyR3V0dGVyOiBmYWxzZSwgbm9IU2Nyb2xsOiB0cnVlIH0pXG4gICk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUVycm9ycygpIHtcbiAgdmFyIGNvZGUgPSBlZGl0b3IuZ2V0VmFsdWUoKTtcblxuICBlcnJXaWRnZXRzLmZvckVhY2goZXJyID0+IHtcbiAgICBlZGl0b3IucmVtb3ZlTGluZVdpZGdldChlcnIpO1xuICB9KTtcbiAgZXJyV2lkZ2V0cyA9IFtdO1xuXG4gIHRyeSB7XG4gICAgdmFyIHN5bnRheCA9IGVzcHJpbWEucGFyc2UoY29kZSwgeyB0b2xlcmFudDogdHJ1ZSwgbG9jOiB0cnVlIH0pO1xuXG4gICAgdmFyIGV2YWxFcnI7XG4gICAgdmFyIHdyYXBwZWRDb2RlID0gYHRyeXsgJHtjb2RlfSB9IGNhdGNoKGVycikgeyBldmFsRXJyID0gZXJyLnN0YWNrIH1gO1xuICAgIGV2YWwod3JhcHBlZENvZGUpO1xuICAgIGlmIChldmFsRXJyKSB7XG4gICAgICB2YXIgZXJyTWVzc2FnZSA9IGV2YWxFcnIubWF0Y2goLy4qLylbMF07XG4gICAgICB2YXIgW19fLCBsaW5lTnVtLCBjb2xOdW1dID0gZXZhbEVyci5tYXRjaCgvPGFub255bW91cz46KFxcZCspOihcXGQrKS8pO1xuICAgICAgcmVuZGVyRXJyKGxpbmVOdW0sIGVyck1lc3NhZ2UsIGNvbE51bSk7XG4gICAgfVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICByZW5kZXJFcnIoZXJyLmxpbmVOdW1iZXIsIGVyci5kZXNjcmlwdGlvbiwgZXJyLmNvbHVtbik7XG4gIH1cblxufVxuXG52YXIgZXhlY3V0ZSA9IHJlcXVpcmUoJy4vZXhlYycpO1xuZXhlY3V0ZShjaGVja0ZvckVycm9ycyk7Il19
