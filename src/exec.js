module.exports = function(hasErrors) {

  $(document).ready(() => {

    // powers the REPL
    $('#console form').on('submit', repl);

    // places cursor in the prompt if they click anywhere in the console
    $('#console').on('click', e => {
      $('input').focus();
    });

    //runs the code from the editor if the button is clicked
    $('#execute').on('click', execute);

    //runs the code from the editor if ctrl+s is pressed
    $(window).on('keydown', e => {
      if (e.ctrlKey && e.keyCode === 83) {
        e.preventDefault();
        execute() && showConsole();
      }
    });

    // enable command history for the REPL
    $('#console form').on('keydown', e => {
      if (e.keyCode === 38) {  //up arrow key
        commandIndex++;
      } else if (e.keyCode === 40) {  //down arrow key
        commandIndex--;
      } else {
        return 'we can ignore this';
      }
      // make sure commandIndex stays within range range
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
      alertify.error('Code has errors. Not executing.');
      return render(
        error.node.innerText || $(error.node).text(),    // chrome || firefox
        {
          error: true,
          lineNum: editor.getLineNumber(error.line) + 1
        }
      );
    }

    var code = editor.getValue();

    alertify.success(`Executing ${code.split('\n').length} lines of javascript.`);

    wrapLogOutput(() => {

      eval(code);
      console.log('\n');

      $('#console form').off('submit');
      $('#console form').on('submit', eval('('+String(repl)+')'));
      // this eval/String thing is pretty weird right? It's basically a hack that Rob and I devised to "clone" a function. It takes a func, converts to a string, then redefines it in an eval. This effectively achieves dynamic scoping. By redefining it in this scope, I can access the local variables here instead of the default lexical scoping behavior. The reason I want this is so the repl has access to the variables defined in the CodeMirror editor.

    });
    return true;
  }
};

// allow user to access previously entered commands
var commandStack = [];
var commandIndex = -1;

// place text in the console
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
    text = `<span class="stderr">${text}</span>`;
  if (options.lineNum)
    text = text.replace(/!/, `line ${options.lineNum} - `);
  $('#console #output').append(`<p><span class="stdout">${text}</span></p>`);

  // scroll to bottom in order to show most recent
  var consoleDOM = document.getElementById('console');
  consoleDOM.scrollTop = consoleDOM.scrollHeight;
}

// run the REPL command
function repl(e) {
  e.preventDefault();
  var code = $(e.target).find('input').val();
  commandStack.unshift(code);
  commandStack = commandStack.slice(0, 9); // only remember the last 10 commands
  commandIndex = -1;
  wrapLogOutput(() => {
    $(e.target).find('input').val('');

    //var declarations don't work in the REPL, so give them an error
    if (code.match(/var/)) return render('do var declarations in the editor above', { error: true });

    var evalErr, output;
    var wrappedCode = `try{ ${code}\n } catch(err) { evalErr = err }`;
    try {
      output = eval(wrappedCode);
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
  };
  func();
  console.log = console.nativeLog;
}
