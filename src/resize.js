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
      ) return;

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
  })
});

function pxToNum(str) {
  return +str.slice(0, -2);
}