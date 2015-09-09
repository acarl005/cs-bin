(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/andrew/Desktop/production/codesmith-bin/src/exec.js":[function(require,module,exports){
module.exports = function (hasErrors) {
  $(document).ready(function () {

    $('#execute').on('click', execute);
    $(window).on('keypress', function (e) {
      e.ctrlKey && e.keyCode && execute(); //execute if they press ctrl+b
    });
  });

  function execute() {
    if (hasErrors()) return alert('fix errors first');

    $('#console #output').empty();
    var code = editor.getValue();

    console.nativeLog = console.log;
    console.log = function () {
      [].forEach.call(arguments, function (line) {
        render(line);
      });
      console.nativeLog.apply(console, arguments);
    };

    eval(code);

    $('#console form').off('submit');
    $('#console form').on('submit', function (e) {
      e.preventDefault();
      console.nativeLog = console.log;
      console.log = function () {
        [].forEach.call(arguments, function (line) {
          render(line);
        });
        console.nativeLog.apply(console, arguments);
      };
      var code = $(e.target).find('input').val();
      var output = eval(code);
      render('=> ' + output);
      $(e.target).find('input').val('');
      console.log = console.nativeLog;
    });

    console.log = console.nativeLog;
  }
};

function render(text) {
  $('#console #output').append('<p>' + text + '</p>');
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9hbmRyZXcvRGVza3RvcC9wcm9kdWN0aW9uL2NvZGVzbWl0aC1iaW4vc3JjL2V4ZWMuanMiLCIvaG9tZS9hbmRyZXcvRGVza3RvcC9wcm9kdWN0aW9uL2NvZGVzbWl0aC1iaW4vc3JjL3JlcGwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVMsU0FBUyxFQUFFO0FBQ25DLEdBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUMsWUFBTTs7QUFFdEIsS0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDbkMsS0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsVUFBQSxDQUFDLEVBQUk7QUFDNUIsT0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUMsT0FBTyxJQUFJLE9BQU8sRUFBRSxDQUFDO0tBQ3JDLENBQUMsQ0FBQztHQUNKLENBQUMsQ0FBQzs7QUFFSCxXQUFTLE9BQU8sR0FBRztBQUNqQixRQUFJLFNBQVMsRUFBRSxFQUFFLE9BQU8sS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUM7O0FBRWxELEtBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQzlCLFFBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQzs7QUFFN0IsV0FBTyxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDO0FBQ2hDLFdBQU8sQ0FBQyxHQUFHLEdBQUcsWUFBVztBQUN2QixRQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsVUFBQSxJQUFJLEVBQUk7QUFDakMsY0FBTSxDQUFDLElBQUksQ0FBQyxDQUFDO09BQ2QsQ0FB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LFdBQVcsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7R0FDeEQ7Q0FFRjs7QUFFRCxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDaEMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaGFzRXJyb3JzKSB7XG4gICQoZG9jdW1lbnQpLnJlYWR5KCgpID0+IHtcblxuICAgICQoJyNleGVjdXRlJykub24oJ2NsaWNrJywgZXhlY3V0ZSk7XG4gICAgJCh3aW5kb3cpLm9uKCdrZXlwcmVzcycsIGUgPT4ge1xuICAgICAgZS5jdHJsS2V5ICYmIGUua2V5Q29kZSAmJiBleGVjdXRlKCk7ICAgLy9leGVjdXRlIGlmIHRoZXkgcHJlc3MgY3RybCtiXG4gICAgfSk7XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIGV4ZWN1dGUoKSB7XG4gICAgaWYgKGhhc0Vycm9ycygpKSByZXR1cm4gYWxlcnQoJ2ZpeCBlcnJvcnMgZmlyc3QnKTtcblxuICAgICQoJyNjb25zb2xlICNvdXRwdXQnKS5lbXB0eSgpO1xuICAgIHZhciBjb2RlID0gZWRpdG9yLmdldFZhbHVlKCk7XG5cbiAgICBjb25zb2xlLm5hdGl2ZUxvZyA9IGNvbnNvbGUubG9nO1xuICAgIGNvbnNvbGUubG9nID0gZnVuY3Rpb24oKSB7XG4gICAgICBbXS5mb3JFYWNoLmNhbGwoYXJndW1lbnRzLCBsaW5lID0+IHtcbiAgICAgICAgcmVuZGVyKGxpbmUpO1xuICAgICAgfSk7XG4gICAgICBjb25zb2xlLm5hdGl2ZUxvZyguLi5hcmd1bWVudHMpO1xuICAgIH1cblxuICAgIGV2YWwoY29kZSk7XG5cbiAgICAkKCcjY29uc29sZSBmb3JtJykub2ZmKCdzdWJtaXQnKTtcbiAgICAkKCcjY29uc29sZSBmb3JtJykub24oJ3N1Ym1pdCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGNvbnNvbGUubmF0aXZlTG9nID0gY29uc29sZS5sb2c7XG4gICAgICBjb25zb2xlLmxvZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBbXS5mb3JFYWNoLmNhbGwoYXJndW1lbnRzLCBsaW5lID0+IHtcbiAgICAgICAgICByZW5kZXIobGluZSk7XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zb2xlLm5hdGl2ZUxvZyguLi5hcmd1bWVudHMpO1xuICAgICAgfVxuICAgICAgdmFyIGNvZGUgPSAkKGUudGFyZ2V0KS5maW5kKCdpbnB1dCcpLnZhbCgpO1xuICAgICAgdmFyIG91dHB1dCA9IGV2YWwoY29kZSk7XG4gICAgICByZW5kZXIoYD0+ICR7b3V0cHV0fWApO1xuICAgICAgJChlLnRhcmdldCkuZmluZCgnaW5wdXQnKS52YWwoJycpO1xuICAgICAgY29uc29sZS5sb2cgPSBjb25zb2xlLm5hdGl2ZUxvZztcbiAgICB9KTtcblxuICAgIGNvbnNvbGUubG9nID0gY29uc29sZS5uYXRpdmVMb2c7XG5cbiAgfVxufVxuXG5mdW5jdGlvbiByZW5kZXIodGV4dCkge1xuICAkKCcjY29uc29sZSAjb3V0cHV0JykuYXBwZW5kKGA8cD4ke3RleHR9PC9wPmApO1xufVxuIiwid2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuXG4gIHdpbmRvdy5lZGl0b3IgPSBDb2RlTWlycm9yKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZWRpdG9yXCIpLCB7XG4gICAgbGluZU51bWJlcnM6IHRydWUsXG4gICAgbW9kZTogXCJqYXZhc2NyaXB0XCIsXG4gICAgdmFsdWU6IFwiXCIsXG4gICAgbWF0Y2hCcmFja2V0czogdHJ1ZSxcbiAgICBhdXRvQ2xvc2VCcmFja2V0czogdHJ1ZSxcbiAgICBrZXlNYXA6ICdzdWJsaW1lJ1xuICB9KTtcblxuICB2YXIgd2FpdGluZztcbiAgZWRpdG9yLm9uKFwiY2hhbmdlXCIsICgpID0+IHtcbiAgICBjbGVhclRpbWVvdXQod2FpdGluZyk7XG4gICAgd2FpdGluZyA9IHNldFRpbWVvdXQodXBkYXRlRXJyb3JzLCA4MDApO1xuICB9KTtcblxufTtcblxudmFyIGVycldpZGdldHMgPSBbXTtcblxuZnVuY3Rpb24gY2hlY2tGb3JFcnJvcnMoKSB7XG4gIHJldHVybiBlcnJXaWRnZXRzLmxlbmd0aDtcbn1cblxuZnVuY3Rpb24gcmVuZGVyRXJyKGxpbmVOdW0sIGRlc2MsIGNvbE51bSkge1xuICB2YXIgbXNnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgdmFyIGljb24gPSBtc2cuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIikpO1xuICBpY29uLmlubmVySFRNTCA9IFwiIVwiO1xuICBpY29uLmNsYXNzTmFtZSA9IFwibGludC1lcnJvci1pY29uXCI7XG4gIG1zZy5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShkZXNjKSk7XG4gIG1zZy5jbGFzc05hbWUgPSBcImxpbnQtZXJyb3JcIjtcbiAgZXJyV2lkZ2V0cy5wdXNoKFxuICAgIGVkaXRvci5hZGRMaW5lV2lkZ2V0KGxpbmVOdW0gLSAxLCBtc2csIHsgY292ZXJHdXR0ZXI6IGZhbHNlLCBub0hTY3JvbGw6IHRydWUgfSlcbiAgKTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlRXJyb3JzKCkge1xuICB2YXIgY29kZSA9IGVkaXRvci5nZXRWYWx1ZSgpO1xuXG4gIGVycldpZGdldHMuZm9yRWFjaChlcnIgPT4ge1xuICAgIGVkaXRvci5yZW1vdmVMaW5lV2lkZ2V0KGVycik7XG4gIH0pO1xuICBlcnJXaWRnZXRzID0gW107XG5cbiAgdHJ5IHtcbiAgICB2YXIgc3ludGF4ID0gZXNwcmltYS5wYXJzZShjb2RlLCB7IHRvbGVyYW50OiB0cnVlLCBsb2M6IHRydWUgfSk7XG5cbiAgICB2YXIgZXZhbEVycjtcbiAgICB2YXIgd3JhcHBlZENvZGUgPSBgdHJ5eyAke2NvZGV9IH0gY2F0Y2goZXJyKSB7IGV2YWxFcnIgPSBlcnIuc3RhY2sgfWA7XG4gICAgZXZhbCh3cmFwcGVkQ29kZSk7XG4gICAgaWYgKGV2YWxFcnIpIHtcbiAgICAgIHZhciBlcnJNZXNzYWdlID0gZXZhbEVyci5tYXRjaCgvLiovKVswXTtcbiAgICAgIHZhciBbX18sIGxpbmVOdW0sIGNvbE51bV0gPSBldmFsRXJyLm1hdGNoKC88YW5vbnltb3VzPjooXFxkKyk6KFxcZCspLyk7XG4gICAgICByZW5kZXJFcnIobGluZU51bSwgZXJyTWVzc2FnZSwgY29sTnVtKTtcbiAgICB9XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJlbmRlckVycihlcnIubGluZU51bWJlciwgZXJyLmRlc2NyaXB0aW9uLCBlcnIuY29sdW1uKTtcbiAgfVxuXG59XG5cbnZhciBleGVjdXRlID0gcmVxdWlyZSgnLi9leGVjJyk7XG5leGVjdXRlKGNoZWNrRm9yRXJyb3JzKTsiXX0=
