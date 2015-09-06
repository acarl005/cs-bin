module.exports = function(checkForErrors) {
  $(document).ready(() => {

    $('#execute').on('click', e => {

      if (checkForErrors()) return alert('fix errors first');

      console.nativeLog = console.log;
      console.log = function() {
        [].forEach.call(arguments, line => {
          $('#console').append(`<p>&gt ${line} </p>`);
        });
        console.nativeLog(...arguments);
      }

      var code = editor.getValue();
      eval(code);

      console.log = console.nativeLog;

    });
  });
}