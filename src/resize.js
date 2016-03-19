var saveHeights, editorHeight, consoleHeight,
    originalEditorHeight, originalConsoleHeight,
    startY = 0, y = 0, $editor, $console;
var $document = $(document);

$document.ready(e => {

  var $resize = $('.resize');
  $editor = $('#editor-wrap');
  $console = $('#console');
  originalEditorHeight = $editor.css('height');
  originalConsoleHeight = $console.css('height');

  $resize.on('mousedown', function(event) {
    event.preventDefault();
    startY = event.pageY - y;
    $document.on('mousemove', mousemove);
    $document.on('mouseup', mouseup);
  });

  function mousemove(event) {
    y = event.pageY - startY;
    if (y + pxToNum(originalEditorHeight) > window.innerHeight - 50) return;
    var y_str = String(y) + 'px';
    var oper = '+-';
    if (y_str[0] === '-') {
      y_str = y_str.slice(1);
      oper = '-+';
    }
    $editor.css('height', `calc(${originalEditorHeight} ${oper[0]} ${y_str})`);
    $console.css('height', `calc(${originalConsoleHeight} ${oper[1]} ${y_str})`);
  }

  function mouseup() {
    $document.off('mousemove', mousemove);
    $document.off('mouseup', mouseup);
    editor.refresh();
  }

  saveHeights = function() {
    editorHeight = $editor.css('height');
    consoleHeight = $console.css('height');
  };
  saveHeights();

  hideConsole();
  $('#execute').on('click', showConsole);
  $('#close').on('click', hideConsole);

});

function pxToNum(str) {
  return +str.slice(0, -2);
}

window.hideConsole = function() {
  saveHeights();
  $('#black-stuff').hide();
  $('#editor-wrap').css('height', '100vh');
  //console hides on load, and sometimes the editor isn't defined yet. this prevents "undefined is not a func" errors
  try { editor.refresh(); } catch(err) {}
};

window.showConsole = function() {
  if ($('#black-stuff').css('display') !== 'none') return;
  $('#black-stuff').show();
  $('#console').css('height', consoleHeight);
  $('#editor-wrap').css('height', editorHeight);
  editor.refresh();
};
