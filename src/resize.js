$(document).ready(e => {

  var editorHeight = $('#editor-wrap').css('height');
  var consoleHeight = $('#console').css('height');

  $('.resize').draggable({
    axis: 'y',
    
    drag: e => {
      var change = e.target.style.top;

      // prevent them from resizing below the bottom of the page
      if (
        pxToNum(change) + pxToNum(editorHeight) > 
        window.innerHeight - 50
      ) throw '';

      var oper = '+-';
      if (change[0] === '-') {
        change = change.slice(1);
        oper = '-+';
      }
      $('#editor-wrap').css('height', `calc(${editorHeight} ${oper[0]} ${change})`);
      $('#console').css('height', `calc(${consoleHeight} ${oper[1]} ${change})`);
    },

    stop: e => {
      editorHeight = $('#editor-wrap').css('height');
      consoleHeight = $('#console').css('height');
      e.target.style.top = 0;
      editor.refresh();
    }
  });

  hideConsole();
  $('#execute').on('click', showConsole);
  $('#close').on('click', hideConsole);

});

function pxToNum(str) {
  return +str.slice(0, -2);
}

window.hideConsole = function() {
  $('#black-stuff').hide();
  $('#editor-wrap').css('height', '100vh');
}

window.showConsole = function() {
  $('#black-stuff').show().css('height', '33.5vh');
  $('#editor-wrap').css('height', '65vh');
}