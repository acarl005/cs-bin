(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/andy/Documents/production/cs-bin/src/exec.js":[function(require,module,exports){
function render(e){var o=arguments.length<=1||void 0===arguments[1]?{}:arguments[1];e="object"==typeof e?JSON.stringify(e,null,4):String(e),e=e.replace(/Unexpected end of input/,"Unexpected end of input: probably an extra opening bracket or operator."),o.arrow&&(e="=> "+e),o.error&&(e='<span class="error">'+e+"</span>"),o.lineNum&&(e=e.replace(/!/,"line "+o.lineNum+" - ")),$("#console #output").append("<p>"+e+"</p>");var r=document.getElementById("console");r.scrollTop=r.scrollHeight}function repl(e){e.preventDefault();var code=$(e.target).find("input").val();commandStack.unshift(code),commandStack=commandStack.slice(0,9),commandIndex=-1,wrapLogOutput(function(){if($(e.target).find("input").val(""),code.match(/var/))return render("do var declarations in the editor above",{error:!0});var evalErr,wrappedCode="try{ "+code+"\n } catch(err) { evalErr = err }";try{var output=eval(wrappedCode)}catch(err){evalErr=err}evalErr?render(evalErr.message,{error:!0}):render(output,{arrow:!0})})}function wrapLogOutput(e){console.nativeLog=console.log,console.log=function(){[].forEach.call(arguments,function(e){render(e)}),console.nativeLog.apply(console,arguments)},e(),console.log=console.nativeLog}module.exports=function(hasErrors){function execute(){$("#console #output").empty();var errors=hasErrors(),error=errors[0];if(error)return render(error.node.innerText||$(error.node).text(),{error:!0,lineNum:editor.getLineNumber(error.line)+1});var code=editor.getValue();return wrapLogOutput(function(){eval(code),console.log("\n"),$("#console form").off("submit"),$("#console form").on("submit",eval("("+String(repl)+")"))}),!0}$(document).ready(function(){$("#console form").on("submit",repl),$("#console").on("click",function(e){$("input").focus()}),$("#execute").on("click",execute),$(window).on("keypress",function(e){e.ctrlKey&&e.keyCode&&execute()&&showConsole()}),$("#console form").on("keydown",function(e){if(38===e.keyCode)commandIndex++;else{if(40!==e.keyCode)return"we can ignore this";commandIndex--}commandIndex=Math.min(commandStack.length-1,commandIndex),commandIndex=Math.max(-1,commandIndex),$("#console form input").val(commandStack[commandIndex])})})};var commandStack=[],commandIndex=-1;

},{}],"/home/andy/Documents/production/cs-bin/src/repl.js":[function(require,module,exports){
function checkForErrors(){return errWidgets}function renderErr(e,r,o){if(!e)throw new Error("Line number for renderErr must be a valid integer.");var t=$('\n    <div class="lint-error">\n      <span class="lint-error-icon">!</span>\n      '+r+"\n    </div>\n  ")[0];errWidgets.push(editor.addLineWidget(e-1,t,{coverGutter:!1,noHScroll:!0}))}function updateErrors(){var e=editor.getValue();errWidgets.forEach(function(e){editor.removeLineWidget(e)}),errWidgets=[];try{esprima.parse(e,{tolerant:!1,loc:!0});webWorker.postMessage(e),ps=setTimeout(killWorker,TIMEOUT)}catch(r){renderErr(r.lineNumber,r.description,r.column)}}function killWorker(){webWorker.terminate(),renderErr(1,"The code is taking a while. You might have an infinite loop."),spawnWorker()}function spawnWorker(){window.webWorker=new Worker("worker.js"),webWorker.onmessage=function(e){e.data.message&&renderErr(e.data.lineNumber,e.data.message),clearTimeout(ps)}}var TIMEOUT=800,ps;spawnWorker(),window.onload=function(){window.editor=CodeMirror.fromTextArea(document.getElementById("code-editor"),{lineNumbers:!0,mode:"javascript",matchBrackets:!0,autoCloseBrackets:!0,keyMap:"sublime",tabSize:2,theme:"ttcn"});var e;editor.on("change",function(){clearTimeout(e),e=setTimeout(updateErrors,TIMEOUT)});var r=require("./save");r(editor)};var errWidgets=[];window.replaceEditorText=function(e){editor.replaceRange(e,CodeMirror.Pos(editor.firstLine()-1),CodeMirror.Pos(editor.lastLine()))};var execute=require("./exec");execute(checkForErrors),require("./resize");

},{"./exec":"/home/andy/Documents/production/cs-bin/src/exec.js","./resize":"/home/andy/Documents/production/cs-bin/src/resize.js","./save":"/home/andy/Documents/production/cs-bin/src/save.js"}],"/home/andy/Documents/production/cs-bin/src/resize.js":[function(require,module,exports){
function pxToNum(e){return+e.slice(0,-2)}var refreshHeights,editorHeight,consoleHeight;$(document).ready(function(e){editorHeight=$("#editor-wrap").css("height"),consoleHeight=$("#console").css("height"),refreshHeights=function(){editorHeight=$("#editor-wrap").css("height"),consoleHeight=$("#console").css("height")},$(".resize").draggable({axis:"y",drag:function(e){var o=e.target.style.top;if(!(pxToNum(o)+pxToNum(editorHeight)>window.innerHeight-50)){var t="+-";"-"===o[0]&&(o=o.slice(1),t="-+"),$("#editor-wrap").css("height","calc("+editorHeight+" "+t[0]+" "+o+")"),$("#console").css("height","calc("+consoleHeight+" "+t[1]+" "+o+")")}},stop:function(e){refreshHeights(),e.target.style.top=0,editor.refresh()}}),hideConsole(),$("#execute").on("click",showConsole),$("#close").on("click",hideConsole)}),window.hideConsole=function(){$("#black-stuff").hide(),$("#editor-wrap").css("height","100vh");try{editor.refresh()}catch(e){}},window.showConsole=function(){"none"===$("#black-stuff").css("display")&&($("#black-stuff").show(),$("#console").css("height","33.5vh"),$("#editor-wrap").css("height","65vh"),refreshHeights(),editor.refresh())};

},{}],"/home/andy/Documents/production/cs-bin/src/save.js":[function(require,module,exports){
module.exports=function(e){var o=window.location.pathname;$("#save").on("click",function(r){localStorage.setItem(o,e.getValue()),alert("Progress saved.")});var r=localStorage.getItem(o);r&&replaceEditorText(r),$("#clear").on("click",function(e){confirm("Are you sure? This will remove saved progress.")&&(localStorage.removeItem(o),replaceEditorText($("#code-editor").val()))})};

},{}]},{},["/home/andy/Documents/production/cs-bin/src/repl.js"])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9hbmR5L0RvY3VtZW50cy9wcm9kdWN0aW9uL2NzLWJpbi9zcmMvZXhlYy5qcyIsIi9ob21lL2FuZHkvRG9jdW1lbnRzL3Byb2R1Y3Rpb24vY3MtYmluL3NyYy9yZXBsLmpzIiwiL2hvbWUvYW5keS9Eb2N1bWVudHMvcHJvZHVjdGlvbi9jcy1iaW4vc3JjL3Jlc2l6ZS5qcyIsIi9ob21lL2FuZHkvRG9jdW1lbnRzL3Byb2R1Y3Rpb24vY3MtYmluL3NyYy9zYXZlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsQUEwREEsTUExRE0sQ0FBQyxDQTBERSxNQTFESyxFQTBERSxDQTFEQyxLQTBESyxHQUFPLEVBMURILFFBMERHLENBMURNLEVBQUUsS0EwRFIsR0FBQSxTQUFBLFVBQUEsTUFBRyxVQUFBLEVBRTVCLEdBRGtCLGdCQUFULEdBQ0YsS0FBSyxVQUFVLEVBQU0sS0FBTSxHQUUzQixPQUFPLEdBSWhCLEVBQU8sRUFBSyxRQUNWLDBCQUNBLDJFQUdFLEVBQVEsUUFDVixFQUFJLE1BQVMsR0FDWCxFQUFRLFFBQ1YsRUFBSSx1QkFBMEIsRUFBSSxXQUNoQyxFQUFRLFVBQ1YsRUFBTyxFQUFLLFFBQVEsSUFBRyxRQUFVLEVBQVEsUUFBTyxRQUNsRCxFQUFFLG9CQUFvQixPQUFNLE1BQU8sRUFBSSxPQUd2QyxJQUFJLEdBQWEsU0FBUyxlQUFlLFVBQ3pDLEdBQVcsVUFBWSxFQUFXLGFBR3BDLFFBQVMsTUFBSyxHQUNaLEVBQUUsZ0JBQ0YsSUFBSSxNQUFPLEVBQUUsRUFBRSxRQUFRLEtBQUssU0FBUyxLQUNyQyxjQUFhLFFBQVEsTUFDckIsYUFBZSxhQUFhLE1BQU0sRUFBRyxHQUNyQyxhQUFlLEdBQ2YsY0FBYyxXQUlaLEdBSEEsRUFBRSxFQUFFLFFBQVEsS0FBSyxTQUFTLElBQUksSUFHMUIsS0FBSyxNQUFNLE9BQVEsTUFBTyxRQUFPLDJDQUE2QyxPQUFP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Q0FBQyxBRUZ2RCxFRkV5RCxPRUZ6RCxHQUNyQixhQUFhLFFBQVEsRUFBTSxFQUFPLFlBQ2xDLE1BQU0sb0JBR1IsSUFBSSxHQUFRLGFBQWEsUUFBUSxFQUM3QixJQUNGLGtCQUFrQixHQUdwQixFQUFFLFVBQVUsR0FBRyxRQUFTLFNBQUEsR0FDbEIsUUFBUSxvREFDVixhQUFhLFdBQVcsR0FDeEIsa0JBQWtCLEVBQUUsZ0JBQWdCO0FGVnRDLEFDSEYsS0ZNRyxDQUFDLENBQUMsT0VOTyxDREdDLEVBQUUsQUNIQSxDQUFDLENBQUMsRURHRSxZQ0hZLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7QURJN0MsQUNIRixBQ0hBLE1BQUksRUZNRSxFQUFFLEFFTkEsR0FBRyxFREdFLEdBQUcsQ0FBQyxBQ0hBLENER0MsQUNIQSxFRk1FLE1FTk0sQ0FBQyxDREdDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0NIQyxDQUFDLE1ER00sQ0FBQyxDQUFDO0FGTzFDLEFDSEEsQUNIRixLRk1HLENBQUMsVUVOVSxDREdDLEVBQUUsQUNIQSxFRk1FLENBQUMsQ0FBQyxBQ0hBLEVER0UsQ0FBQyxLRU5JLElGTUssRUFBRSxVQUFBLENBQUMsRUFBSTtBQUNwQyxBQ0hGLEFDSEEsQUNIRixHQUFDLENBQUMsTUhTTSxDQUFDLEFHVEEsQ0hTQyxBR1RBLENBQUMsRUFBRSxDREdDLEFDSEEsR0hTRyxBRU5BLENBQUMsQ0RHQyxBQ0hBLEVER0UsQUVOQSxDSFNDLENHVEMsQ0hTQyxDQ0hDLENER0MsT0VOTyxBQ0hWLENER1csQUNIVixDREdXLENDSFAsRURHVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FESS9DLEFDSEEsQUNIQSxVRk1NLEVBQUUsSUVOSSxDREdDLEFDSEEsR0RHRyxDREdDLEFDSEEsQ0FBQyxFQ0hFLENBQUMsSUFBSSxFQUFFLENER0MsQ0FBQyxDQUFDLEdBQUcsQUNIQSxDREdDLEFDSEEsUURHUSxBQ0hBLENER0MsQ0FBQyxBQ0hBLENBQUMsQ0FBQztBSFMxQyxBQ0ZKLEFFTkEsR0RHRCxDQUFBLEtDSE0sQ0FBQyxDRk1DLEVBQUUsQ0FBQyxNREVNLEVBQUUsQ0FBQyxJR1JJLENBQUMsQ0FBQTtBRk94QixHRU5ELENBQUMsQ0FBQyxFSFFFLEVDRkUsRUFBRSxFREVFLElBQUksQUNGQSxDREVDLENBQUMsT0FBTyxLQUFLLEVBQUUsRUFBRTtBRUpqQyxHREdDLEFDSEEsQ0RHQyxBQ0hBLENER0MsUUNIUSxDQUFDLENBQUMsU0FBUyxDQUFDO0FGS2pCLEFFSkosQUNIRixNQUFJLEVER0UsRUFBRSxDQ0hDLEVER0UsQ0NIQyxNSE9NLEVBQUUsQ0FBQyxHR1BHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FGT3ZDLEFFTkEsTUZNSSxBRU5BLENIT0MsSUdQSSxFSE9FLEFDREEsQUVOQSxDRk1DO0FERU4sQUNETixBQ0hFLEFDSEEsUUZNSSxBQ0hBLENER0MsQ0NIQyxDREdDLENBQUMsR0RDRyxLQ0RLLENFTkMsQ0ZNQyxBRU5BLEVER1osQ0FBQyxFQUFJLEFDSFksQ0FBQyxDQUFDLEtGTUQsQ0RDTyxDQUFDO0FDQWhDLEFDSEUsR0NISCxJSE9JLEdFSkcsTURHTSxBQ0hBLENER0MsRUNIRSxDQUFDLENBQUMsR0RHRyxDQUFDLENBQUMsQ0NIQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUM7QURJbEMsV0FBTyxHQUFHLFVBQVUsQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDLENBQUM7QURFMUMsQUdQSixHRk1DLEFFTkEsQ0ZNQyxBRU5BLENGTUMsT0VOTyxDQUFDLENBQUMsRUFBRSxDQUFDLENIT0MsR0FBRyxHR1BHLENIT0MsQ0FBQyxBR1BBLEdIT0csQ0FBQyxNR1BKLENBQUMsRUFBSSxHSE9XLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxZQUFZLENBQUMsQ0FBQztBQUMvRCxBRUpBLEFDSEYsUUFBSSxFRElBLEtDSk8sQ0FBQyxDRElELENGR0csQUVIRixHRkdLLEdFSEMsQ0ZHRyxBRUhGLENGR0csRUVIQSxDRkdHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0VIRCxDQUFDLFVGR1ksQ0FBQyxDQUFDLEFFSEYsQ0FBQyxHQUN2QyxNQUFNLENBQUMsS0NMaUQsQ0FBQyxFQUFFLEdES3pDLEdBQUcsRUFBRSxFQUN2QixPQUFPO0FGRVQsQUNESixBRU5JLE1GTUEsQ0RDQyxDQUFDLEVDREUsR0FBRyxLRU5LLENBQUMsQ0ZNQyxDQUFDLFFEQ1EsQUNEQSxBRU5BLENIT0MsQUNEQSxBRU5BLENIT0MsQUNEQSxHRENHLEFHUEEsQ0hPQyxBR1BBLENBQUMsV0hPVyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7QUNBN0QsQUNBSSxBQ05BLEtIT0QsQ0FBQyxBQ0RBLENEQ0MsQUNEQSxHQ0FHLEdEQUcsQ0FBQyxBQ0FBLENEQUMsRUNBRSxJQUFJLENBQUMsQ0NOQyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0FETzNDLENEQ0wsQ0FBQyxDREFDLENBQUMsQ0FBQyxBR1BBLEtETUssTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRTtBQUNyQixHQ05MLENBQUMsQ0FBQyxTRE1TLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBRkUvQixBQ0FGLEFDRFEsQ0NMUCxDQUFBLEVGTUcsT0RBTyxDRURDLEVEQ0UsQ0NEQyxFRENFLENEQUMsQ0NBQyxBQ0RBLENEQ0MsQUNEQSxDRkNDO0FBQ2pCLEtBQUMsQ0FBQyxDRURDLGlCRkNpQixDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDOUIsQUNBSixBQ0RNLE9BQUMsQ0ZDQyxBRURBLENEQ0MsS0RBSyxHQUFHLEtFREssQ0RDQyxBQ0RBLENBQUMsRUZDRSxBQ0FBLENDREMsQ0ZDQyxBRURBLENGQ0MsT0VETyxZQUFVLFlBQVksU0FBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLFNBQUksTUFBTSxPQUFJLENBQUM7QUZFaEYsQUNBRixBQ0RJLE9BQUMsQ0ZDQyxBRURBLENEQ0MsSURBSSxHQUFHLEVFREUsQ0RDQyxBQ0RBLENEQ0MsQUNEQSxFRkNFLENBQUMsQUVEQSxDRkNDLEFFREEsQ0ZDQyxD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QUM7QUFDbEUsUUFBSTtBQUNGLFVBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztLQUNoQyxDQUFDLE9BQU8sR0FBRyxFQUFFO0FBQ1osYUFBTyxHQUFHLEdBQUcsQ0FBQztLQUNmO0FBQ0QsUUFBSSxPQUFPLEVBQUU7QUFDWCxZQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0tBQzFDLE1BQU07QUFDTCxZQUFNLENBQUMsTUFBTSxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7S0FDakM7R0FDRixDQUFDLENBQUM7Q0FDSjs7O0FBR0QsU0FBUyxhQUFhLENBQUMsSUFBSSxFQUFFO0FBQzNCLFNBQU8sQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQztBQUNoQyxTQUFPLENBQUMsR0FBRyxHQUFHLFlBQVc7QUFDdkIsTUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFVBQUEsSUFBSSxFQUFJO0FBQ2pDLFlBQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUNkLENBQUMsQ0FBQztBQUNILFdBQU8sQ0FBQyxTQUFTLE1BQUEsQ0FBakIsT0FBTyxFQUFjLFNBQVMsQ0FBQyxDQUFDO0dBQ2pDLENBQUE7QUFDRCxNQUFJLEVBQUUsQ0FBQztBQUNQLFNBQU8sQ0FBQyxHQUFHLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQztDQUNqQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGhhc0Vycm9ycykge1xuICAkKGRvY3VtZW50KS5yZWFkeSgoKSA9PiB7XG5cbiAgICAkKCcjY29uc29sZSBmb3JtJykub24oJ3N1Ym1pdCcsIHJlcGwpO1xuICAgICQoJyNjb25zb2xlJykub24oJ2NsaWNrJywgZSA9PiB7XG4gICAgICAkKCdpbnB1dCcpLmZvY3VzKCk7XG4gICAgfSk7XG4gICAgJCgnI2V4ZWN1dGUnKS5vbignY2xpY2snLCBleGVjdXRlKTtcbiAgICAkKHdpbmRvdykub24oJ2tleXByZXNzJywgZSA9PiB7XG4gICAgICBlLmN0cmxLZXkgJiYgZS5rZXlDb2RlICYmIGV4ZWN1dGUoKSAmJiBzaG93Q29uc29sZSgpOyAgIC8vZXhlY3V0ZSBpZiB0aGV5IHByZXNzIGN0cmwrYiBpbiBjaHJvbWVcbiAgICB9KTtcblxuICAgICQoJyNjb25zb2xlIGZvcm0nKS5vbigna2V5ZG93bicsIGUgPT4ge1xuICAgICAgaWYgKGUua2V5Q29kZSA9PT0gMzgpIHsgIC8vdXAgYXJyb3cga2V5XG4gICAgICAgIGNvbW1hbmRJbmRleCsrO1xuICAgICAgfSBlbHNlIGlmIChlLmtleUNvZGUgPT09IDQwKSB7ICAvL2Rvd24gYXJyb3cga2V5XG4gICAgICAgIGNvbW1hbmRJbmRleC0tO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuICd3ZSBjYW4gaWdub3JlIHRoaXMnO1xuICAgICAgfVxuICAgICAgLy8gbWFrZSBzdXJlIGNvbW1hbmRJbmRleCBzdGF5cyB3aXRoaW4gcmFuZ2UgcmFuZ2VcbiAgICAgIGNvbW1hbmRJbmRleCA9IE1hdGgubWluKGNvbW1hbmRTdGFjay5sZW5ndGggLSAxLCBjb21tYW5kSW5kZXgpO1xuICAgICAgY29tbWFuZEluZGV4ID0gTWF0aC5tYXgoLTEsIGNvbW1hbmRJbmRleCk7XG4gICAgICAkKCcjY29uc29sZSBmb3JtIGlucHV0JykudmFsKGNvbW1hbmRTdGFja1tjb21tYW5kSW5kZXhdKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZnVuY3Rpb24gZXhlY3V0ZSgpIHtcbiAgICAkKCcjY29uc29sZSAjb3V0cHV0JykuZW1wdHkoKTtcbiAgICB2YXIgZXJyb3JzID0gaGFzRXJyb3JzKCk7XG4gICAgdmFyIGVycm9yID0gZXJyb3JzWzBdO1xuICAgIGlmIChlcnJvcil7XG4gICAgICByZXR1cm4gcmVuZGVyKFxuICAgICAgICBlcnJvci5ub2RlLmlubmVyVGV4dCB8fCAkKGVycm9yLm5vZGUpLnRleHQoKSwgICAgLy8gY2hyb21lIHx8IGZpcmVmb3hcbiAgICAgICAgeyBlcnJvcjogdHJ1ZSwgbGluZU51bTogZWRpdG9yLmdldExpbmVOdW1iZXIoZXJyb3IubGluZSkgKyAxIH1cbiAgICAgICk7XG4gICAgfVxuXG4gICAgdmFyIGNvZGUgPSBlZGl0b3IuZ2V0VmFsdWUoKTtcblxuICAgIHdyYXBMb2dPdXRwdXQoKCkgPT4ge1xuXG4gICAgICBldmFsKGNvZGUpO1xuICAgICAgY29uc29sZS5sb2coJ1xcbicpO1xuXG4gICAgICAkKCcjY29uc29sZSBmb3JtJykub2ZmKCdzdWJtaXQnKTtcbiAgICAgICQoJyNjb25zb2xlIGZvcm0nKS5vbignc3VibWl0JywgZXZhbCgnKCcrU3RyaW5nKHJlcGwpKycpJykpO1xuICAgICAgLy8gdGhpcyBldmFsL1N0cmluZyB0aGluZyBpcyBwcmV0dHkgd2VpcmQgcmlnaHQ/IEl0J3MgYmFzaWNhbGx5IGEgaGFjayB0aGF0IFJvYiBhbmQgSSBkZXZpc2VkIHRvIFwiY2xvbmVcIiBhIGZ1bmN0aW9uLiBJdCB0YWtlcyBhIGZ1bmMsIGNvbnZlcnRzIHRvIGEgc3RyaW5nLCB0aGVuIHJlZGVmaW5lcyBpdCBpbiBhbiBldmFsLiBUaGlzIGVmZmVjdGl2ZWx5IGFjaGlldmVzIGR5bmFtaWMgc2NvcGluZy4gQnkgcmVkZWZpbmluZyBpdCBpbiB0aGlzIHNjb3BlLCBJIGNhbiBhY2Nlc3MgdGhlIGxvY2FsIHZhcmlhYmxlcyBoZXJlIGluc3RlYWQgb2YgdGhlIGRlZmF1bHQgbGV4aWNhbCBzY29waW5nIGJlaGF2aW9yLiBUaGUgcmVhc29uIEkgd2FudCB0aGlzIGlzIHNvIHRoZSByZXBsIGhhcyBhY2Nlc3MgdG8gdGhlIHZhcmlhYmxlcyBkZWZpbmVkIGluIHRoZSBDb2RlTWlycm9yIGVkaXRvci5cblxuICAgIH0pO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG59XG5cbi8vIGFsbG93IHVzZXIgdG8gYWNjZXNzIHByZXZpb3VzbHkgZW50ZXJlZCBjb21tYW5kc1xudmFyIGNvbW1hbmRTdGFjayA9IFtdO1xudmFyIGNvbW1hbmRJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiByZW5kZXIodGV4dCwgb3B0aW9ucz17fSkge1xuICBpZiAodHlwZW9mIHRleHQgPT09ICdvYmplY3QnKSB7XG4gICAgdGV4dCA9IEpTT04uc3RyaW5naWZ5KHRleHQsIG51bGwsIDQpO1xuICB9IGVsc2Uge1xuICAgIHRleHQgPSBTdHJpbmcodGV4dCk7XG4gIH1cblxuICAvLyBUaGlzIHBhcnRpY3VsYXIgZXJyIG1lc3NhZ2UgaXMgcG9vci4gTWFrZSBpdCBhIGJpdCBtb3JlIGhlbHBmdWxcbiAgdGV4dCA9IHRleHQucmVwbGFjZShcbiAgICAvVW5leHBlY3RlZCBlbmQgb2YgaW5wdXQvLCBcbiAgICAnVW5leHBlY3RlZCBlbmQgb2YgaW5wdXQ6IHByb2JhYmx5IGFuIGV4dHJhIG9wZW5pbmcgYnJhY2tldCBvciBvcGVyYXRvci4nXG4gICk7XG5cbiAgaWYgKG9wdGlvbnMuYXJyb3cpXG4gICAgdGV4dCA9IGA9PiAke3RleHR9YDtcbiAgaWYgKG9wdGlvbnMuZXJyb3IpXG4gICAgdGV4dCA9IGA8c3BhbiBjbGFzcz1cImVycm9yXCI+JHt0ZXh0fTwvc3Bhbj5gO1xuICBpZiAob3B0aW9ucy5saW5lTnVtKVxuICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoLyEvLCBgbGluZSAke29wdGlvbnMubGluZU51bX0gLSBgKTtcbiAgJCgnI2NvbnNvbGUgI291dHB1dCcpLmFwcGVuZChgPHA+JHt0ZXh0fTwvcD5gKTtcblxuICAvLyBzY3JvbGwgdG8gYm90dG9tIGluIG9yZGVyIHRvIHNob3cgbW9zdCByZWNlbnRcbiAgdmFyIGNvbnNvbGVET00gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29uc29sZScpO1xuICBjb25zb2xlRE9NLnNjcm9sbFRvcCA9IGNvbnNvbGVET00uc2Nyb2xsSGVpZ2h0O1xufVxuXG5mdW5jdGlvbiByZXBsKGUpIHtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICB2YXIgY29kZSA9ICQoZS50YXJnZXQpLmZpbmQoJ2lucHV0JykudmFsKCk7XG4gIGNvbW1hbmRTdGFjay51bnNoaWZ0KGNvZGUpO1xuICBjb21tYW5kU3RhY2sgPSBjb21tYW5kU3RhY2suc2xpY2UoMCwgOSk7XG4gIGNvbW1hbmRJbmRleCA9IC0xO1xuICB3cmFwTG9nT3V0cHV0KCgpID0+IHtcbiAgICAkKGUudGFyZ2V0KS5maW5kKCdpbnB1dCcpLnZhbCgnJyk7XG5cbiAgICAvL3ZhciBkZWNsYXJhdGlvbnMgZG9uJ3Qgd29yayBpbiB0aGUgUkVQTCwgc28gZ2l2ZSB0aGVtIGFuIGVycm9yXG4gICAgaWYgKGNvZGUubWF0Y2goL3Zhci8pKSByZXR1cm4gcmVuZGVyKCdkbyB2YXIgZGVjbGFyYXRpb25zIGluIHRoZSBlZGl0b3IgYWJvdmUnLCB7IGVycm9yOiB0cnVlIH0pO1xuXG4gICAgdmFyIGV2YWxFcnI7XG4gICAgdmFyIHdyYXBwZWRDb2RlID0gYHRyeXsgJHtjb2RlfVxcbiB9IGNhdGNoKGVycikgeyBldmFsRXJyID0gZXJyIH1gO1xuICAgIHRyeSB7XG4gICAgICB2YXIgb3V0cHV0ID0gZXZhbCh3cmFwcGVkQ29kZSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBldmFsRXJyID0gZXJyO1xuICAgIH1cbiAgICBpZiAoZXZhbEVycikge1xuICAgICAgcmVuZGVyKGV2YWxFcnIubWVzc2FnZSwgeyBlcnJvcjogdHJ1ZSB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVuZGVyKG91dHB1dCwgeyBhcnJvdzogdHJ1ZSB9KTtcbiAgICB9XG4gIH0pO1xufVxuXG4vLyBleGVjdXRlcyBhIGZ1bmN0aW9uIGluIGEgY29udGV4dCB3aGVyZSBhbGwgY2FsbHMgdG8gY29uc29sZS5sb2cgd2lsbCByZW5kZXIgdG8gdGhlIERPTVxuZnVuY3Rpb24gd3JhcExvZ091dHB1dChmdW5jKSB7XG4gIGNvbnNvbGUubmF0aXZlTG9nID0gY29uc29sZS5sb2c7XG4gIGNvbnNvbGUubG9nID0gZnVuY3Rpb24oKSB7XG4gICAgW10uZm9yRWFjaC5jYWxsKGFyZ3VtZW50cywgbGluZSA9PiB7XG4gICAgICByZW5kZXIobGluZSk7XG4gICAgfSk7XG4gICAgY29uc29sZS5uYXRpdmVMb2coLi4uYXJndW1lbnRzKTtcbiAgfVxuICBmdW5jKCk7XG4gIGNvbnNvbGUubG9nID0gY29uc29sZS5uYXRpdmVMb2c7XG59XG5cblxuXG5cbiIsInZhciBUSU1FT1VUID0gODAwO1xudmFyIHBzO1xuc3Bhd25Xb3JrZXIoKTtcblxud2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuXG4gIHdpbmRvdy5lZGl0b3IgPSBDb2RlTWlycm9yLmZyb21UZXh0QXJlYShkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvZGUtZWRpdG9yXCIpLCB7XG4gICAgbGluZU51bWJlcnM6IHRydWUsXG4gICAgbW9kZTogXCJqYXZhc2NyaXB0XCIsXG4gICAgbWF0Y2hCcmFja2V0czogdHJ1ZSxcbiAgICBhdXRvQ2xvc2VCcmFja2V0czogdHJ1ZSxcbiAgICBrZXlNYXA6ICdzdWJsaW1lJyxcbiAgICB0YWJTaXplOiAyLFxuICAgIHRoZW1lOiAndHRjbidcbiAgfSk7XG5cbiAgdmFyIHdhaXRpbmc7XG4gIGVkaXRvci5vbihcImNoYW5nZVwiLCAoKSA9PiB7XG4gICAgY2xlYXJUaW1lb3V0KHdhaXRpbmcpO1xuICAgIHdhaXRpbmcgPSBzZXRUaW1lb3V0KHVwZGF0ZUVycm9ycywgVElNRU9VVCk7XG4gIH0pO1xuXG4gIHZhciBzYXZlID0gcmVxdWlyZSgnLi9zYXZlJyk7XG4gIHNhdmUoZWRpdG9yKTtcblxufTtcblxudmFyIGVycldpZGdldHMgPSBbXTtcblxuZnVuY3Rpb24gY2hlY2tGb3JFcnJvcnMoKSB7XG4gIHJldHVybiBlcnJXaWRnZXRzO1xufVxuXG5mdW5jdGlvbiByZW5kZXJFcnIobGluZU51bSwgZGVzYywgY29sTnVtKSB7XG4gIGlmICghbGluZU51bSkgdGhyb3cgbmV3IEVycm9yKCdMaW5lIG51bWJlciBmb3IgcmVuZGVyRXJyIG11c3QgYmUgYSB2YWxpZCBpbnRlZ2VyLicpO1xuICB2YXIgbXNnID0gJChgXG4gICAgPGRpdiBjbGFzcz1cImxpbnQtZXJyb3JcIj5cbiAgICAgIDxzcGFuIGNsYXNzPVwibGludC1lcnJvci1pY29uXCI+ITwvc3Bhbj5cbiAgICAgICR7ZGVzY31cbiAgICA8L2Rpdj5cbiAgYClbMF07XG4gIGVycldpZGdldHMucHVzaChcbiAgICBlZGl0b3IuYWRkTGluZVdpZGdldChsaW5lTnVtIC0gMSwgbXNnLCB7IGNvdmVyR3V0dGVyOiBmYWxzZSwgbm9IU2Nyb2xsOiB0cnVlIH0pXG4gICk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUVycm9ycygpIHtcbiAgdmFyIGNvZGUgPSBlZGl0b3IuZ2V0VmFsdWUoKTtcblxuICBlcnJXaWRnZXRzLmZvckVhY2goZXJyID0+IHtcbiAgICBlZGl0b3IucmVtb3ZlTGluZVdpZGdldChlcnIpO1xuICB9KTtcbiAgZXJyV2lkZ2V0cyA9IFtdO1xuXG4gIHRyeSB7XG4gICAgdmFyIHN5bnRheCA9IGVzcHJpbWEucGFyc2UoY29kZSwgeyB0b2xlcmFudDogZmFsc2UsIGxvYzogdHJ1ZSB9KTtcbiAgICB3ZWJXb3JrZXIucG9zdE1lc3NhZ2UoY29kZSk7XG4gICAgcHMgPSBzZXRUaW1lb3V0KGtpbGxXb3JrZXIsIFRJTUVPVVQpO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICByZW5kZXJFcnIoZXJyLmxpbmVOdW1iZXIsIGVyci5kZXNjcmlwdGlvbiwgZXJyLmNvbHVtbik7XG4gIH1cblxufVxuXG53aW5kb3cucmVwbGFjZUVkaXRvclRleHQgPSBmdW5jdGlvbih0ZXh0KSB7XG4gIGVkaXRvci5yZXBsYWNlUmFuZ2UoXG4gICAgdGV4dCxcbiAgICBDb2RlTWlycm9yLlBvcyhlZGl0b3IuZmlyc3RMaW5lKCktMSksXG4gICAgQ29kZU1pcnJvci5Qb3MoZWRpdG9yLmxhc3RMaW5lKCkpXG4gICk7XG59XG5cbmZ1bmN0aW9uIGtpbGxXb3JrZXIoKSB7XG4gIHdlYldvcmtlci50ZXJtaW5hdGUoKTtcbiAgcmVuZGVyRXJyKDEsICdUaGUgY29kZSBpcyB0YWtpbmcgYSB3aGlsZS4gWW91IG1pZ2h0IGhhdmUgYW4gaW5maW5pdGUgbG9vcC4nKVxuICBzcGF3bldvcmtlcigpO1xufVxuXG5mdW5jdGlvbiBzcGF3bldvcmtlcigpIHtcbiAgd2luZG93LndlYldvcmtlciA9IG5ldyBXb3JrZXIoJ3dvcmtlci5qcycpO1xuICB3ZWJXb3JrZXIub25tZXNzYWdlID0gZSA9PiB7XG4gICAgaWYgKGUuZGF0YS5tZXNzYWdlKSB7XG4gICAgICByZW5kZXJFcnIoZS5kYXRhLmxpbmVOdW1iZXIsIGUuZGF0YS5tZXNzYWdlKTtcbiAgICB9XG4gICAgY2xlYXJUaW1lb3V0KHBzKTtcbiAgfTtcbn1cblxudmFyIGV4ZWN1dGUgPSByZXF1aXJlKCcuL2V4ZWMnKTtcbmV4ZWN1dGUoY2hlY2tGb3JFcnJvcnMpO1xucmVxdWlyZSgnLi9yZXNpemUnKTsiLCJ2YXIgcmVmcmVzaEhlaWdodHMsIGVkaXRvckhlaWdodCwgY29uc29sZUhlaWdodDtcblxuJChkb2N1bWVudCkucmVhZHkoZSA9PiB7XG5cbiAgZWRpdG9ySGVpZ2h0ID0gJCgnI2VkaXRvci13cmFwJykuY3NzKCdoZWlnaHQnKTtcbiAgY29uc29sZUhlaWdodCA9ICQoJyNjb25zb2xlJykuY3NzKCdoZWlnaHQnKTtcbiAgcmVmcmVzaEhlaWdodHMgPSBmdW5jdGlvbigpIHtcbiAgICBlZGl0b3JIZWlnaHQgPSAkKCcjZWRpdG9yLXdyYXAnKS5jc3MoJ2hlaWdodCcpO1xuICAgIGNvbnNvbGVIZWlnaHQgPSAkKCcjY29uc29sZScpLmNzcygnaGVpZ2h0Jyk7ICAgIFxuICB9XG5cbiAgJCgnLnJlc2l6ZScpLmRyYWdnYWJsZSh7XG4gICAgYXhpczogJ3knLFxuICAgIFxuICAgIGRyYWc6IGUgPT4ge1xuICAgICAgdmFyIGNoYW5nZSA9IGUudGFyZ2V0LnN0eWxlLnRvcDtcblxuICAgICAgLy8gcHJldmVudCB0aGVtIGZyb20gcmVzaXppbmcgYmVsb3cgdGhlIGJvdHRvbSBvZiB0aGUgcGFnZVxuICAgICAgaWYgKFxuICAgICAgICBweFRvTnVtKGNoYW5nZSkgKyBweFRvTnVtKGVkaXRvckhlaWdodCkgPiBcbiAgICAgICAgd2luZG93LmlubmVySGVpZ2h0IC0gNTBcbiAgICAgICkgcmV0dXJuO1xuXG4gICAgICB2YXIgb3BlciA9ICcrLSc7XG4gICAgICBpZiAoY2hhbmdlWzBdID09PSAnLScpIHtcbiAgICAgICAgY2hhbmdlID0gY2hhbmdlLnNsaWNlKDEpO1xuICAgICAgICBvcGVyID0gJy0rJztcbiAgICAgIH1cbiAgICAgICQoJyNlZGl0b3Itd3JhcCcpLmNzcygnaGVpZ2h0JywgYGNhbGMoJHtlZGl0b3JIZWlnaHR9ICR7b3BlclswXX0gJHtjaGFuZ2V9KWApO1xuICAgICAgJCgnI2NvbnNvbGUnKS5jc3MoJ2hlaWdodCcsIGBjYWxjKCR7Y29uc29sZUhlaWdodH0gJHtvcGVyWzFdfSAke2NoYW5nZX0pYCk7XG4gICAgfSxcblxuICAgIHN0b3A6IGUgPT4ge1xuICAgICAgcmVmcmVzaEhlaWdodHMoKTtcbiAgICAgIGUudGFyZ2V0LnN0eWxlLnRvcCA9IDA7XG4gICAgICBlZGl0b3IucmVmcmVzaCgpO1xuICAgIH1cbiAgfSk7XG5cbiAgaGlkZUNvbnNvbGUoKTtcbiAgJCgnI2V4ZWN1dGUnKS5vbignY2xpY2snLCBzaG93Q29uc29sZSk7XG4gICQoJyNjbG9zZScpLm9uKCdjbGljaycsIGhpZGVDb25zb2xlKTtcblxufSk7XG5cbmZ1bmN0aW9uIHB4VG9OdW0oc3RyKSB7XG4gIHJldHVybiArc3RyLnNsaWNlKDAsIC0yKTtcbn1cblxud2luZG93LmhpZGVDb25zb2xlID0gZnVuY3Rpb24oKSB7XG4gICQoJyNibGFjay1zdHVmZicpLmhpZGUoKTtcbiAgJCgnI2VkaXRvci13cmFwJykuY3NzKCdoZWlnaHQnLCAnMTAwdmgnKTtcbiAgLy9jb25zb2xlIGhpZGVzIG9uIGxvYWQsIGFuZCBzb21ldGltZXMgdGhlIGVkaXRvciBpc24ndCBkZWZpbmVkIHlldC4gdGhpcyBwcmV2ZW50cyBcInVuZGVmaW5lZCBpcyBub3QgYSBmdW5jXCIgZXJyb3JzXG4gIHRyeSB7IGVkaXRvci5yZWZyZXNoKCk7IH0gY2F0Y2goZXJyKSB7fVxufVxuXG53aW5kb3cuc2hvd0NvbnNvbGUgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCQoJyNibGFjay1zdHVmZicpLmNzcygnZGlzcGxheScpICE9PSAnbm9uZScpIHJldHVybjtcbiAgJCgnI2JsYWNrLXN0dWZmJykuc2hvdygpXG4gICQoJyNjb25zb2xlJykuY3NzKCdoZWlnaHQnLCAnMzMuNXZoJyk7XG4gICQoJyNlZGl0b3Itd3JhcCcpLmNzcygnaGVpZ2h0JywgJzY1dmgnKTtcbiAgcmVmcmVzaEhlaWdodHMoKTtcbiAgZWRpdG9yLnJlZnJlc2goKTtcbn0iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGVkaXRvcikge1xuXG4gIHZhciBwYXRoID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lO1xuXG4gICQoJyNzYXZlJykub24oJ2NsaWNrJywgZSA9PiB7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0ocGF0aCwgZWRpdG9yLmdldFZhbHVlKCkpO1xuICAgIGFsZXJ0KCdQcm9ncmVzcyBzYXZlZC4nKVxuICB9KTtcblxuICB2YXIgc2F2ZWQgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShwYXRoKTtcbiAgaWYgKHNhdmVkKSB7XG4gICAgcmVwbGFjZUVkaXRvclRleHQoc2F2ZWQpO1xuICB9XG5cbiAgJCgnI2NsZWFyJykub24oJ2NsaWNrJywgZSA9PiB7XG4gICAgaWYgKGNvbmZpcm0oJ0FyZSB5b3Ugc3VyZT8gVGhpcyB3aWxsIHJlbW92ZSBzYXZlZCBwcm9ncmVzcy4nKSkge1xuICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0ocGF0aCk7XG4gICAgICByZXBsYWNlRWRpdG9yVGV4dCgkKCcjY29kZS1lZGl0b3InKS52YWwoKSk7XG4gICAgfVxuICB9KTtcblxufSJdfQ==
