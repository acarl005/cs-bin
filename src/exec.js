module.exports = function(hasErrors) {
  $(document).ready(() => {

    $('#console form').on('submit', repl);
    $('#execute').on('click', execute);
    $(window).on('keypress', e => {
      e.ctrlKey && e.keyCode && execute();   //execute if they press ctrl+b in chrome
    });

    $('#console form').on('keydown', e => {
      if (e.keyCode === 38) {  //up arrow key
        commandIndex++;
      } else if (e.keyCode === 40) {  //down arrow key
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
    var error = errors[0];
    if (error){
      return render(
        error.node.innerText || $(error.node).text(),    // chrome || firefox
        { error: true, lineNum: editor.getLineNumber(error.line) + 1 }
      );
    }

    var code = editor.getValue();

    wrapLogOutput(() => {

      eval(code);

      $('#console form').off('submit');
      $('#console form').on('submit', eval('('+String(repl)+')'));
      // this eval/String thing is pretty weird right? It's basically a hack that Rob and I devised to "clone" a function. It takes a func, converts to a string, then redefines it in an eval. This effectively achieves dynamic scoping. By redefining it in this scope, I can access the local variables here instead of the default lexical scoping behavior. The reason I want this is so the repl has access to the variables defined in the CodeMirror editor.

    });

  }
}

// allow user to access previously entered commands
var commandStack = [];
var commandIndex = -1;

function render(text, options={}) {
  if (typeof text === 'object') {
    text = JSON.stringify(text, null, 4);
  } else {
    text = String(text);
  }

  // This particular err message is poor. Make it a bit more helpful
  text = text.replace(
    /Unexpected end of input/, 
    'Unexpected end of input: probably an extra opening bracket or operator.'
  );

  if (options.arrow)
    text = `=> ${text}`;
  if (options.error)
    text = `<span class="error">${text}</span>`;
  if (options.lineNum)
    text = text.replace(/!/, `line ${options.lineNum} - `);
  $('#console #output').append(`<p>${text}</p>`);

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
  wrapLogOutput(() => {
    $(e.target).find('input').val('');
    var evalErr;
    var wrappedCode = `try{ ${code}\n } catch(err) { evalErr = err }`;
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
  console.log = function() {
    [].forEach.call(arguments, line => {
      render(line);
    });
    console.nativeLog(...arguments);
  }
  func();
  console.log = console.nativeLog;
}




