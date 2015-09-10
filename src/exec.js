module.exports = function(hasErrors) {
  $(document).ready(() => {

    $('#console form').on('submit', repl);
    $('#execute').on('click', execute);
    $(window).on('keypress', e => {
      e.ctrlKey && e.keyCode && execute();   //execute if they press ctrl+b
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
    if (errors[0])
      return render(`<span class="error">${errors[0].node.innerText}</span>`);

    var code = editor.getValue();

    wrapLogOutput(() => {

      eval(code);

      $('#console form').off('submit');
      $('#console form').on('submit', eval('('+String(repl)+')'));
      // this eval/String thing is pretty weird right? It's basically a hack that Rob and I devised to "clone" a function. It takes a func, converts to a string, then redefines it in an eval. This effectively achieves dynamic scoping. By redefining it in this scope, I can access the local variables here instead of the default lexical scoping behavior. The reason I want this is so the repl has access to the variables defined in the CodeMirror editor.

    });

  }
}

//allow user to access previously entered commands
var commandStack = [];
var commandIndex = -1;

function render(text) {
  text = String(text).replace(/Unexpected end of input/, 'Unexpected end of input: make sure your brackets match')
  $('#console #output').append(`<p>${text}</p>`);
  var console = document.getElementById('console');
  console.scrollTop = console.scrollHeight;
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
    var wrappedCode = `try{ ${code} } catch(err) { evalErr = err.stack }`;
    var output = eval(wrappedCode);
    if (evalErr) {
      var errMessage = evalErr.match(/.*/)[0];
      render(`<span class="error">${errMessage}</span>`);
    } else {
      render(`=> ${output}`);
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




