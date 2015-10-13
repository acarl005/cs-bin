var refreshHeights, editorHeight, consoleHeight;

$(document).ready(e => {

  editorHeight = $('#editor-wrap').css('height');
  consoleHeight = $('#console').css('height');
  refreshHeights = function() {
    editorHeight = $('#editor-wrap').css('height');
    consoleHeight = $('#console').css('height');    
  }

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
      refreshHeights();
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
  //console hides on load, and sometimes the editor isn't defined yet. this prevents "undefined is not a func" errors
  try { editor.refresh(); } catch(err) {}
}

window.showConsole = function() {
  if ($('#black-stuff').css('display') !== 'none') return;
  $('#black-stuff').show()
  $('#console').css('height', '33.5vh');
  $('#editor-wrap').css('height', '65vh');
  refreshHeights();
  editor.refresh();
}