(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/andrew/Desktop/production/codesmith-bin/src/exec.js":[function(require,module,exports){
module.exports = function (checkForErrors) {
  $(document).ready(function () {

    $('#execute').on('click', function (e) {

      if (checkForErrors()) return alert('fix errors first');

      console.nativeLog = console.log;
      console.log = function () {
        [].forEach.call(arguments, function (line) {
          $('#console').append('<p>&gt ' + line + ' </p>');
        });
        console.nativeLog.apply(console, arguments);
      };

      var code = editor.getValue();
      eval(code);

      console.log = console.nativeLog;
    });
  });
};

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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9hbmRyZXcvRGVza3RvcC9wcm9kdWN0aW9uL2NvZGVzbWl0aC1iaW4vc3JjL2V4ZWMuanMiLCIvaG9tZS9hbmRyZXcvRGVza3RvcC9wcm9kdWN0aW9uL2NvZGVzbWl0aC1iaW4vc3JjL3JlcGwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVMsY0FBYyxFQUFFO0FBQ3hDLEdBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUMsWUFBTTs7QUFFdEIsS0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsVUFBQSxDQUFDLEVBQUk7O0FBRTdCLFVBQUksY0FBYyxFQUFFLEVBQUUsT0FBTyxLQUFLLENBQUMsa0JBQWtCLENBQUMsQ0FBQzs7QUFFdkQsYUFBTyxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDO0FBQ2hDLGFBQU8sQ0FBQyxHQUFHLEdBQUcsWUFBVztBQUN2QixVQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsVUFBQSxJQUFJLEVBQUk7QUFDakMsV0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLE1BQU0sYUFBVyxJQUFJLFdBQVEsQ0FBQztTQUM3QyxDQUFDLENBQUM7QUFDSCxlQUFPLENBQUMsU0FBUyxNQUFBLENBQWpCLE9BQU8sRUFBYyxTQUFTLENBQUMsQ0FBQztPQUNqQyxDQUFBOztBQUVELFVBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUM3QixVQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRVgsYUFBTyxDQUFDLEdBQUcsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDO0tBRWpDLENBQUMsQ0FBQztHQUNKLENBQUMsQ0FBQztDQUNKLENBQUE7Ozs7O0FDdEJE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QU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGNoZWNrRm9yRXJyb3JzKSB7XG4gICQoZG9jdW1lbnQpLnJlYWR5KCgpID0+IHtcblxuICAgICQoJyNleGVjdXRlJykub24oJ2NsaWNrJywgZSA9PiB7XG5cbiAgICAgIGlmIChjaGVja0ZvckVycm9ycygpKSByZXR1cm4gYWxlcnQoJ2ZpeCBlcnJvcnMgZmlyc3QnKTtcblxuICAgICAgY29uc29sZS5uYXRpdmVMb2cgPSBjb25zb2xlLmxvZztcbiAgICAgIGNvbnNvbGUubG9nID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIFtdLmZvckVhY2guY2FsbChhcmd1bWVudHMsIGxpbmUgPT4ge1xuICAgICAgICAgICQoJyNjb25zb2xlJykuYXBwZW5kKGA8cD4mZ3QgJHtsaW5lfSA8L3A+YCk7XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zb2xlLm5hdGl2ZUxvZyguLi5hcmd1bWVudHMpO1xuICAgICAgfVxuXG4gICAgICB2YXIgY29kZSA9IGVkaXRvci5nZXRWYWx1ZSgpO1xuICAgICAgZXZhbChjb2RlKTtcblxuICAgICAgY29uc29sZS5sb2cgPSBjb25zb2xlLm5hdGl2ZUxvZztcblxuICAgIH0pO1xuICB9KTtcbn0iLCJ3aW5kb3cub25sb2FkID0gZnVuY3Rpb24oKSB7XG5cbiAgd2luZG93LmVkaXRvciA9IENvZGVNaXJyb3IoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlZGl0b3JcIiksIHtcbiAgICBsaW5lTnVtYmVyczogdHJ1ZSxcbiAgICBtb2RlOiBcImphdmFzY3JpcHRcIixcbiAgICB2YWx1ZTogXCJcIixcbiAgICBtYXRjaEJyYWNrZXRzOiB0cnVlLFxuICAgIGF1dG9DbG9zZUJyYWNrZXRzOiB0cnVlLFxuICAgIGtleU1hcDogJ3N1YmxpbWUnXG4gIH0pO1xuXG4gIHZhciB3YWl0aW5nO1xuICBlZGl0b3Iub24oXCJjaGFuZ2VcIiwgKCkgPT4ge1xuICAgIGNsZWFyVGltZW91dCh3YWl0aW5nKTtcbiAgICB3YWl0aW5nID0gc2V0VGltZW91dCh1cGRhdGVFcnJvcnMsIDgwMCk7XG4gIH0pO1xuXG59O1xuXG52YXIgZXJyV2lkZ2V0cyA9IFtdO1xuXG5mdW5jdGlvbiBjaGVja0ZvckVycm9ycygpIHtcbiAgcmV0dXJuIGVycldpZGdldHMubGVuZ3RoO1xufVxuXG5mdW5jdGlvbiByZW5kZXJFcnIobGluZU51bSwgZGVzYywgY29sTnVtKSB7XG4gIHZhciBtc2cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICB2YXIgaWNvbiA9IG1zZy5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKSk7XG4gIGljb24uaW5uZXJIVE1MID0gXCIhXCI7XG4gIGljb24uY2xhc3NOYW1lID0gXCJsaW50LWVycm9yLWljb25cIjtcbiAgbXNnLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGRlc2MpKTtcbiAgbXNnLmNsYXNzTmFtZSA9IFwibGludC1lcnJvclwiO1xuICBlcnJXaWRnZXRzLnB1c2goXG4gICAgZWRpdG9yLmFkZExpbmVXaWRnZXQobGluZU51bSAtIDEsIG1zZywgeyBjb3Zlckd1dHRlcjogZmFsc2UsIG5vSFNjcm9sbDogdHJ1ZSB9KVxuICApO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVFcnJvcnMoKSB7XG4gIHZhciBjb2RlID0gZWRpdG9yLmdldFZhbHVlKCk7XG5cbiAgZXJyV2lkZ2V0cy5mb3JFYWNoKGVyciA9PiB7XG4gICAgZWRpdG9yLnJlbW92ZUxpbmVXaWRnZXQoZXJyKTtcbiAgfSk7XG4gIGVycldpZGdldHMgPSBbXTtcblxuICB0cnkge1xuICAgIHZhciBzeW50YXggPSBlc3ByaW1hLnBhcnNlKGNvZGUsIHsgdG9sZXJhbnQ6IHRydWUsIGxvYzogdHJ1ZSB9KTtcblxuICAgIHZhciBldmFsRXJyO1xuICAgIHZhciB3cmFwcGVkQ29kZSA9IGB0cnl7ICR7Y29kZX0gfSBjYXRjaChlcnIpIHsgZXZhbEVyciA9IGVyci5zdGFjayB9YDtcbiAgICBldmFsKHdyYXBwZWRDb2RlKTtcbiAgICBpZiAoZXZhbEVycikge1xuICAgICAgdmFyIGVyck1lc3NhZ2UgPSBldmFsRXJyLm1hdGNoKC8uKi8pWzBdO1xuICAgICAgdmFyIFtfXywgbGluZU51bSwgY29sTnVtXSA9IGV2YWxFcnIubWF0Y2goLzxhbm9ueW1vdXM+OihcXGQrKTooXFxkKykvKTtcbiAgICAgIHJlbmRlckVycihsaW5lTnVtLCBlcnJNZXNzYWdlLCBjb2xOdW0pO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgcmVuZGVyRXJyKGVyci5saW5lTnVtYmVyLCBlcnIuZGVzY3JpcHRpb24sIGVyci5jb2x1bW4pO1xuICB9XG5cbn1cblxudmFyIGV4ZWN1dGUgPSByZXF1aXJlKCcuL2V4ZWMnKTtcbmV4ZWN1dGUoY2hlY2tGb3JFcnJvcnMpOyJdfQ==
