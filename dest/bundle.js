(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/andrew/Desktop/production/codesmith-bin/src/repl.js":[function(require,module,exports){
var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

window.onload = function () {

  window.editor = CodeMirror(document.getElementById("editor"), {
    lineNumbers: true,
    mode: "javascript",
    value: ""
  });

  var waiting;
  editor.on("change", function () {
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
  errWidgets.push(editor.addLineWidget(lineNum - 1, msg, { coverGutter: false, noHScroll: true }));
}

function updateErrors() {
  var code = editor.getValue();

  try {
    for (var i = 0; i < errWidgets.length; ++i) editor.removeLineWidget(errWidgets[i]);
    errWidgets.length = 0;

    var syntax = esprima.parse(code, { tolerant: true, loc: true });
    // var errors = syntax.errors;
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

      renderErr(lineNum, errMessage);
    }
  } catch (err) {
    // err -> {lineNumber: 2, description: "Unexpected end of input", index: 42, column: 10}
    renderErr(err.lineNumber, err.description);
  }
}

},{}]},{},["/home/andrew/Desktop/production/codesmith-bin/src/repl.js"])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9hbmRyZXcvRGVza3RvcC9wcm9kdWN0aW9uL2NvZGVzbWl0aC1iaW4vc3JjL3JlcGwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLE1BQU0sQ0FBQyxNQUFNLEdBQUcsWUFBVzs7QUFFekIsUUFBTSxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsRUFBRTtBQUM1RCxlQUFXLEVBQUUsSUFBSTtBQUNqQixRQUFJLEVBQUUsWUFBWTtBQUNsQixTQUFLLEVBQUUsRUFBRTtHQUNWLENBQUMsQ0FBQzs7QUFFSCxNQUFJLE9BQU8sQ0FBQztBQUNaLFFBQU0sQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLFlBQU07QUFDeEIsZ0JBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN0QixXQUFPLEdBQUcsVUFBVSxDQUFDLFlBQVksRUFBRSxHQUFHLENBQUMsQ0FBQztHQUN6QyxDQUFDLENBQUM7Q0FFSixDQUFDOztBQUVGLElBQUksVUFBVSxHQUFHLEVBQUUsQ0FBQzs7QUFFcEIsU0FBUyxTQUFTLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRTtBQUNoQyxNQUFJLEdBQUcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3hDLE1BQUksSUFBSSxHQUFHLEdBQUcsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQzNELE1BQUksQ0FBQyxTQUFTLEdBQUcsR0FBRyxDQUFDO0FBQ3JCLE1BQUksQ0FBQyxTQUFTLEdBQUcsaUJBQWlCLENBQUM7QUFDbkMsS0FBRyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDL0MsS0FBRyxDQUFDLFNBQVMsR0FBRyxZQUFZLENBQUM7QUFDN0IsWUFBVSxDQUFDLElBQUksQ0FDYixNQUFNLENBQUMsYUFBYSxDQUFDLE9BQU8sR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FDaEYsQ0FBQztDQUNIOztBQUVELFNBQVMsWUFBWSxHQUFHO0FBQ3RCLE1BQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQzs7QUFFN0IsTUFBSTtBQUNGLFNBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxVQUFVLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUN4QyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDekMsY0FBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7O0FBRXRCLFFBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQzs7QUFFaEUsUUFBSSxPQUFPLENBQUM7QUFDWixRQUFJLFdBQVcsYUFBVyxJQUFJLDBDQUF1QyxDQUFDO0FBQ3RFLFFBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNsQixRQUFJLE9BQU8sRUFBRTtBQUNYLFVBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7OzJCQUNaLE9BQU8sQ0FBQyxLQUFLLENBQUMseUJBQXlCLENBQUM7Ozs7VUFBL0QsRUFBRTtVQUFFLE9BQU87VUFBRSxNQUFNOztBQUN4QixlQUFTLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0tBQ2hDO0dBQ0YsQ0FBQyxPQUFPLEdBQUcsRUFBRTs7QUFFWixhQUFTLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7R0FDNUM7Q0FFRiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ3aW5kb3cub25sb2FkID0gZnVuY3Rpb24oKSB7XG5cbiAgd2luZG93LmVkaXRvciA9IENvZGVNaXJyb3IoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlZGl0b3JcIiksIHtcbiAgICBsaW5lTnVtYmVyczogdHJ1ZSxcbiAgICBtb2RlOiBcImphdmFzY3JpcHRcIixcbiAgICB2YWx1ZTogXCJcIlxuICB9KTtcblxuICB2YXIgd2FpdGluZztcbiAgZWRpdG9yLm9uKFwiY2hhbmdlXCIsICgpID0+IHtcbiAgICBjbGVhclRpbWVvdXQod2FpdGluZyk7XG4gICAgd2FpdGluZyA9IHNldFRpbWVvdXQodXBkYXRlRXJyb3JzLCA1MDApO1xuICB9KTtcblxufTtcblxudmFyIGVycldpZGdldHMgPSBbXTtcblxuZnVuY3Rpb24gcmVuZGVyRXJyKGxpbmVOdW0sIGRlc2MpIHtcbiAgdmFyIG1zZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gIHZhciBpY29uID0gbXNnLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpKTtcbiAgaWNvbi5pbm5lckhUTUwgPSBcIiFcIjtcbiAgaWNvbi5jbGFzc05hbWUgPSBcImxpbnQtZXJyb3ItaWNvblwiO1xuICBtc2cuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoZGVzYykpO1xuICBtc2cuY2xhc3NOYW1lID0gXCJsaW50LWVycm9yXCI7XG4gIGVycldpZGdldHMucHVzaChcbiAgICBlZGl0b3IuYWRkTGluZVdpZGdldChsaW5lTnVtIC0gMSwgbXNnLCB7IGNvdmVyR3V0dGVyOiBmYWxzZSwgbm9IU2Nyb2xsOiB0cnVlIH0pXG4gICk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUVycm9ycygpIHtcbiAgdmFyIGNvZGUgPSBlZGl0b3IuZ2V0VmFsdWUoKTtcblxuICB0cnkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZXJyV2lkZ2V0cy5sZW5ndGg7ICsraSlcbiAgICAgIGVkaXRvci5yZW1vdmVMaW5lV2lkZ2V0KGVycldpZGdldHNbaV0pO1xuICAgIGVycldpZGdldHMubGVuZ3RoID0gMDtcblxuICAgIHZhciBzeW50YXggPSBlc3ByaW1hLnBhcnNlKGNvZGUsIHsgdG9sZXJhbnQ6IHRydWUsIGxvYzogdHJ1ZSB9KTtcbiAgICAvLyB2YXIgZXJyb3JzID0gc3ludGF4LmVycm9ycztcbiAgICB2YXIgZXZhbEVycjtcbiAgICB2YXIgd3JhcHBlZENvZGUgPSBgdHJ5eyAke2NvZGV9IH0gY2F0Y2goZXJyKSB7IGV2YWxFcnIgPSBlcnIuc3RhY2sgfWA7XG4gICAgZXZhbCh3cmFwcGVkQ29kZSk7XG4gICAgaWYgKGV2YWxFcnIpIHtcbiAgICAgIHZhciBlcnJNZXNzYWdlID0gZXZhbEVyci5tYXRjaCgvLiovKVswXTtcbiAgICAgIHZhciBbX18sIGxpbmVOdW0sIGNvbE51bV0gPSBldmFsRXJyLm1hdGNoKC88YW5vbnltb3VzPjooXFxkKyk6KFxcZCspLyk7XG4gICAgICByZW5kZXJFcnIobGluZU51bSwgZXJyTWVzc2FnZSk7XG4gICAgfVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICAvLyBlcnIgLT4ge2xpbmVOdW1iZXI6IDIsIGRlc2NyaXB0aW9uOiBcIlVuZXhwZWN0ZWQgZW5kIG9mIGlucHV0XCIsIGluZGV4OiA0MiwgY29sdW1uOiAxMH1cbiAgICByZW5kZXJFcnIoZXJyLmxpbmVOdW1iZXIsIGVyci5kZXNjcmlwdGlvbik7XG4gIH1cblxufVxuIl19
