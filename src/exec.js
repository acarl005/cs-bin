module.exports = function(hasErrors) {
  $(document).ready(() => {

    $('#execute').on('click', execute);
    $(window).on('keypress', e => {
      e.ctrlKey && e.keyCode && execute();   //execute if they press ctrl+b
    });
  });

  function execute() {
    if (hasErrors()) return alert('fix errors first');

    $('#console #output').empty();
    var code = editor.getValue();

    wrapLogOutput(() => {

      eval(code);

      $('#console form').off('submit');
      $('#console form').on('submit', function(e) {
        e.preventDefault();
        wrapLogOutput(() => {
          var code = $(e.target).find('input').val();
          var output = eval(code);
          render(`=> ${output}`);
          $(e.target).find('input').val('');
        });
      });

    });

  }
}

function render(text) {
  $('#console #output').append(`<p>${text}</p>`);
}

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
});
