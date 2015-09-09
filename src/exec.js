module.exports = function(hasErrors) {
  $(document).ready(() => {

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

    wrapLogOutput(() => {

      eval(code);

      $('#console form').off('submit');
      $('#console form').on('submit', e => {
        e.preventDefault();
        var code = $(e.target).find('input').val();
        commandStack.unshift(code);
        commandStack = commandStack.slice(0, 9);
        commandIndex = -1;
        wrapLogOutput(() => {
          $(e.target).find('input').val('');
          try {
            var output = eval(code);
            render(`=> ${output}`);
          } catch(err) {
            render('<span class="error">ERROR</span>');
          }
        });
      });

    });

  }
}

var commandStack = [];
var commandIndex = -1;

function render(text) {
  $('#console #output').append(`<p>${text}</p>`);
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




