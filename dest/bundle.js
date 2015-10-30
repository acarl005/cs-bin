(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/andy/Documents/production/cs-bin/src/editor.js":[function(require,module,exports){
function checkForErrors(){return errWidgets}function renderErr(e,r,o){if(!e)throw new Error("Line number for renderErr must be a valid integer.");var t=$('\n    <div class="lint-error">\n      <span class="lint-error-icon">!</span>\n      '+r+"\n    </div>\n  ")[0];errWidgets.push(editor.addLineWidget(e-1,t,{coverGutter:!1,noHScroll:!0}))}function updateErrors(){var e=editor.getValue();errWidgets.forEach(function(e){editor.removeLineWidget(e)}),errWidgets=[];try{esprima.parse(e,{tolerant:!1,loc:!0});webWorker.postMessage(e),ps=setTimeout(killWorker,TIMEOUT)}catch(r){renderErr(r.lineNumber,r.description,r.column)}}function killWorker(){webWorker.terminate(),renderErr(1,"The code is taking a while. You might have an infinite loop."),spawnWorker()}function spawnWorker(){window.webWorker=new Worker("worker.js"),webWorker.onmessage=function(e){e.data.message&&renderErr(e.data.lineNumber,e.data.message),clearTimeout(ps)}}var TIMEOUT=800,ps;spawnWorker(),window.onload=function(){window.editor=CodeMirror.fromTextArea(document.getElementById("code-editor"),{lineNumbers:!0,mode:"javascript",matchBrackets:!0,autoCloseBrackets:!0,keyMap:"sublime",tabSize:2,theme:"ttcn"});var e;editor.on("change",function(){clearTimeout(e),e=setTimeout(updateErrors,TIMEOUT)});var r=require("./save");r(editor)},require("./resize");var errWidgets=[];window.replaceEditorText=function(e){editor.replaceRange(e,CodeMirror.Pos(editor.firstLine()-1),CodeMirror.Pos(editor.lastLine()))};var execute=require("./exec");execute(checkForErrors);

},{"./exec":"/home/andy/Documents/production/cs-bin/src/exec.js","./resize":"/home/andy/Documents/production/cs-bin/src/resize.js","./save":"/home/andy/Documents/production/cs-bin/src/save.js"}],"/home/andy/Documents/production/cs-bin/src/exec.js":[function(require,module,exports){
function render(e){var o=arguments.length<=1||void 0===arguments[1]?{}:arguments[1];e="object"==typeof e?JSON.stringify(e,null,4):String(e),e=e.replace(/Unexpected end of input/,"Unexpected end of input: probably an extra opening bracket or operator."),o.arrow&&(e="=> "+e),o.error&&(e='<span class="error">'+e+"</span>"),o.lineNum&&(e=e.replace(/!/,"line "+o.lineNum+" - ")),$("#console #output").append("<p>"+e+"</p>");var r=document.getElementById("console");r.scrollTop=r.scrollHeight}function repl(e){e.preventDefault();var code=$(e.target).find("input").val();commandStack.unshift(code),commandStack=commandStack.slice(0,9),commandIndex=-1,wrapLogOutput(function(){if($(e.target).find("input").val(""),code.match(/var/))return render("do var declarations in the editor above",{error:!0});var evalErr,wrappedCode="try{ "+code+"\n } catch(err) { evalErr = err }";try{var output=eval(wrappedCode)}catch(err){evalErr=err}evalErr?render(evalErr.message,{error:!0}):render(output,{arrow:!0})})}function wrapLogOutput(e){console.nativeLog=console.log,console.log=function(){[].forEach.call(arguments,function(e){render(e)}),console.nativeLog.apply(console,arguments)},e(),console.log=console.nativeLog}module.exports=function(hasErrors){function execute(){$("#console #output").empty();var errors=hasErrors(),error=errors[0];if(error)return alertify.error("Code has errors. Not executing."),render(error.node.innerText||$(error.node).text(),{error:!0,lineNum:editor.getLineNumber(error.line)+1});var code=editor.getValue();return alertify.success("Executing "+code.split("\n").length+" lines of javascript."),wrapLogOutput(function(){eval(code),console.log("\n"),$("#console form").off("submit"),$("#console form").on("submit",eval("("+String(repl)+")"))}),!0}$(document).ready(function(){$("#console form").on("submit",repl),$("#console").on("click",function(e){$("input").focus()}),$("#execute").on("click",execute),$(window).on("keydown",function(e){e.ctrlKey&&83===e.keyCode&&(e.preventDefault(),execute()&&showConsole())}),$("#console form").on("keydown",function(e){if(38===e.keyCode)commandIndex++;else{if(40!==e.keyCode)return"we can ignore this";commandIndex--}commandIndex=Math.min(commandStack.length-1,commandIndex),commandIndex=Math.max(-1,commandIndex),$("#console form input").val(commandStack[commandIndex])})})};var commandStack=[],commandIndex=-1;

},{}],"/home/andy/Documents/production/cs-bin/src/resize.js":[function(require,module,exports){
function pxToNum(e){return+e.slice(0,-2)}var refreshHeights,editorHeight,consoleHeight;$(document).ready(function(e){refreshHeights=function(){editorHeight=$("#editor-wrap").css("height"),consoleHeight=$("#console").css("height")},refreshHeights(),$(".resize").draggable({axis:"y",drag:function(e){var o=e.target.style.top;if(!(pxToNum(o)+pxToNum(editorHeight)>window.innerHeight-50)){var s="+-";"-"===o[0]&&(o=o.slice(1),s="-+"),$("#editor-wrap").css("height","calc("+editorHeight+" "+s[0]+" "+o+")"),$("#console").css("height","calc("+consoleHeight+" "+s[1]+" "+o+")")}},stop:function(e){refreshHeights(),e.target.style.top=0,editor.refresh()}}),hideConsole(),$("#execute").on("click",showConsole),$("#close").on("click",hideConsole)}),window.hideConsole=function(){$("#black-stuff").hide(),$("#editor-wrap").css("height","100vh");try{editor.refresh()}catch(e){}},window.showConsole=function(){"none"===$("#black-stuff").css("display")&&($("#black-stuff").show(),$("#console").css("height","33.5vh"),$("#editor-wrap").css("height","65vh"),refreshHeights(),editor.refresh())};

},{}],"/home/andy/Documents/production/cs-bin/src/save.js":[function(require,module,exports){
module.exports=function(e){var r=window.location.pathname;$("#save").on("click",function(o){localStorage.setItem(r,e.getValue()),alertify.success("Progress saved.")});var o=localStorage.getItem(r);o&&replaceEditorText(o),$("#clear").on("click",function(e){var o="Are you sure? This will remove saved progress and restore the challenges to their former state.";alertify.confirm(o,function(e){e&&(localStorage.removeItem(r),replaceEditorText($("#code-editor").val()),alertify.error("Saved progress removed."))})})};

},{}]},{},["/home/andy/Documents/production/cs-bin/src/editor.js"])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9hbmR5L0RvY3VtZW50cy9wcm9kdWN0aW9uL2NzLWJpbi9zcmMvZWRpdG9yLmpzIiwiL2hvbWUvYW5keS9Eb2N1bWVudHMvcHJvZHVjdGlvbi9jcy1iaW4vc3JjL2V4ZWMuanMiLCIvaG9tZS9hbmR5L0RvY3VtZW50cy9wcm9kdWN0aW9uL2NzLWJpbi9zcmMvcmVzaXplLmpzIiwiL2hvbWUvYW5keS9Eb2N1bWVudHMvcHJvZHVjdGlvbi9jcy1iaW4vc3JjL3NhdmUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxBQXFDQSxJQXJDSSxJQXFDSyxHQXJDRSxHQUFHLEdBQUcsQ0FBQyxRQXNDaEIsTUFBTyxZQUlULFFBQVMsV0FBVSxFQUFTLEVBQU0sR0FDaEMsSUFBSyxFQUFTLEtBQU0sSUFBSSxPQUFNLHFEQUM5QixJQUFJLEdBQU0sRUFBQyx1RkFHTCxFQUFJLG9CQUVQLEVBQ0gsWUFBVyxLQUNULE9BQU8sY0FBYyxFQUFVLEVBQUcsR0FBTyxhQUFhLEVBQU8sV0FBVyxLQUs1RSxRQUFTLGdCQUNQLEdBQUksR0FBTyxPQUFPLFVBRWxCLFlBQVcsUUFBUSxTQUFBLEdBQ2pCLE9BQU8saUJBQWlCLEtBRTFCLGFBRUEsS0FFZSxRQUFRLE1BQU0sR0FBUSxVQUFVLEVBQU8sS0FBSyxHQUd6RCxXQUFVLFlBQVksR0FDdEIsR0FBSyxXQUFXLFdBQVksU0FFNUIsTUFBTyxHQUNQLFVBQVUsRUFBSSxXQUFZLEVBQUksWUFBYSxFQUFJLFNBYW5ELFFBQVMsY0FDUCxVQUFVLFlBQ1YsVUFBVSxFQUFHLGdFQUNiLGNBR0YsUUFBUyxlQUNQLE9BQU8sVUFBWSxHQUFJLFFBQU8sYUFDOUIsVUFBVSxVQUFZLFNBQUEsR0FDaEIsRUFBRSxLQUFLLFNBQ1QsVUFBVSxFQUFFLEtBQUssV0FBWSxFQUFFLEtBQUssU0FFdEMsYUFBYSxLQWxHakIsR0FBSSxTQUFVLElBQ1YsRUFD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UUVOTztBRk8xQixBQ0hBLEFDSEEsQUNIRixLRk1HLENBQUMsQUVOQSxJQUFJLEdBQUcsR0ZNRyxBQ0hBLENER0MsQ0FBQyxDQ0hDLEFDSEEsQ0ZNQyxBQ0hBLEFDSEEsQ0hTQyxBQ0hBLEFDSEEsRUZNRSxJQUFJLENDSEMsQUVOQSxDQUFDLENGTUMsS0NISyxDQUFDLENBQUMsQUNIQSxDQUFDLEVGTVIsQUNIVSxDREdULEFDSFUsRURHTixNQ0hjLENBQUMsQ0FBQztBRk8vQyxBQ0hFLEFDSEYsT0RHRyxDQUFDLEVER0UsRUFBRSxHQ0hHLENBQUMsQ0FBQyxBQ0hBLEdBQUcsQ0ZNQyxBRU5BLENER0MsQUNIQSxFREdFLENBQUMsT0NITyxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FGTzVDLEFHVEYsR0RHQyxBQ0hBLENER0MsQUNIQSxDRk1DLENBQUMsQ0FBQyxJREdJLEFHVEEsQ0FBQyxDSFNDLEFHVEEsQ0hTQyxDR1RDLENBQUMsT0FBTyxFQUFFLFVBQUEsQ0FBQyxFQUFJO0FIVTFCLEFFTkYsQUNIRSxTSFNLLEVBQUUsS0VOSyxBQ0hBLENIU0MsQUdUQSxDREdDLENBQUMsS0NISyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztBQUM5QyxHSFNELENBQUMsQ0FBQyxPR1RPLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUZPcEMsQUNIRixHQUFDLEFDSEEsQ0RHQyxBQ0hBLENGTUMsQUVOQSxDRk1DLE9DSE8sQ0FBQyxDQUFDLENER0MsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQ0hHLENBQUMsR0RHRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FDRm5DLFFBQUksRUFBRSxHQUFHO0FGT1gsQUdUQSxNSFNJLEFHVEEsS0FBSyxFSFNFLENBQUMsQUdUQSxZQUFZLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FIVXZDLEFDSEUsQUNIQSxBQ0hGLEtGTUcsQ0FBQyxBRU5BLEVIU0UsQUVOQSxDRk1DLENFTkMsQ0ZNQyxBR1RBLENIU0MsQUNIQSxDQUFDLEFFTkEsQ0ZNQyxFQUFFLENBQUMsR0RHRyxFQUFFLEVFTlosQ0FBQyxDREdlLENDSFgsQ0RHYSxNREdBLElDSEEsQ0FBQyxFQUFJO0FESTdCLEFDSEUsQUNIQSxBQ0hGLFVGTU0sQUNIQSxDREdDLENBQUMsSURHSSxBRU5BLENGTUMsRUNIRSxBQ0hBLENBQUMsQ0FBQyxBQ0hBLENBQUMsQ0ZNQyxDREdDLEFDSEEsQ0RHQyxBQ0hBLENER0MsQ0VOQyxBQ0hBLENER0MsQUNIQSxDQUFDLEdGTUcsQ0NIQyxDQUFDLEdER0csQUNIQSxDQUFDLENER0MsRUFBRTtBRElyQyxBQ0hJLEdFTkwsTUZNTSxDQUFDLENER0MsR0FBRyxVQUFVLEFDSEEsQ0RHQyxDQ0hDLENBQUMsVURHVSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FDRnhDLEdER0wsQ0FBQyxDQUFDLFVDSFUsRUFBRSxJQUFJLFdBQVcsRUFBRSxDQUFDO0FDRjdCLEFDSEosR0FBQyxDQUFDLEdGTUcsR0NGQyxFQ0pJLENBQUMsQ0FBQyxFQUFFLENESUQsQUNKRSxDRElELE1BQU0sQUNKRSxDRElELENDSkcsRURJQSxPQUFPLENBQUMsQUNKUixDQUFDLEVBQUksU0RJZSxDQUFDLEdBQ3ZDLE1BQU0sQ0FBQyxXQUFXLEdBQUcsRUFBRSxFQUN2QixPQUFPO0FDTFgsS0ZNQyxDQUFDLENBQUMsQ0VOQyxHQUFHLEdBQUcsaUdBQWlHLENBQUM7QUhVOUcsQUVISSxBQ05GLE1IU0UsSUFBSSxBRUhBLEVDTkUsQ0hTQyxBR1RBLENETUMsR0FBRyxHRkdHLEFHVEEsQ0hTQyxBRUhBLEFDTkEsQ0RNQyxFQ05FLEVBQUUsR0hTRyxDQUFDLENBQUMsS0dUTCxXQUFXLEVBQUk7QUhVdkMsQUVISSxBQ05BLE1IU0EsQ0FBQyxHRUhHLEFDTkEsR0hTRyxDQUFDLENBQUMsQ0VIQyxDQUFDLENBQUMsQ0FBQyxFQ05FLEVBQUUsQ0RNQyxHQUFHLEVBQUU7QURDekIsQUNBSSxBQ05BLENIVVAsQ0FBQyxHQ0pHLENBQUMsUUNBUSxHQUFHLEdDTkcsQ0ZNQyxBRU5B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TSxDRGFDLEFFWEEsQ0FBQyxHREZHLEFDRUEsQ0FBQyxFREZFLEdDRUcsQ0FBQyxDRldDLEFFWEEsQ0RGQyxDQUFDLEFDRUEsQ0ZXQyxBQ2JBLEFDRUEsQ0RGQyxBQ0VBLENERkMsQUNFQSxDQUFDO0FGWXpCLEFDYkUsQ0NFSCxLRldLLEVDYkUsRURhRSxHQUFHLEFDYkEsRUFBQyxJRGFLLENBQUMsUUFBUSxFQUFFLENBQUM7QUNaekIsY0FBUSxDQUFDLEtBQUssQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO0FEY3RELEFDYkksQUNFTixNQUFNLENBQUMsS0ZXSyxDQUFDLEFDYkEsS0NFSyxDREZDLENEYUMsQUNaWixDRFlhLEFFWEEsSUREUixDQUFDLElBQUksQ0RZRyxBQ1pGLEVDQ2EsQ0ZXUixFQUFJLElDWkEsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRTtBRGFoRCxBQ1pJLEFDQ04sR0FBQyxDQUFDLE1GV00sQ0FBQyxPRVhPLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0ZXQyxBRVhBLENGV0MsR0FBRyxDQUFDLENBQUM7QUNYdkIsQUNDUixHRldDLEFFWEEsQ0ZXQyxBRVhBLENGV0MsUUNaVSxFQUFFLEdDQ0MsQ0RERyxBQ0NGLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztBRll6QyxBQ1pRLFlEWUUsR0FBRyxBQ1pFLEVEWUEsQUNaRSxDRFlELEtDWk8sQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7QUNFckQsTUFBSSxDRERHLENBQ0YsQ0FBQztBRFlOLEFFWk0sS0RDSCxDRFdDLElFWlEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztHQUFFLENBQUMsT0FBTSxHQUFHLEVBQUUsRUFBRTtBRmNyQyxBQ1hBLENDRkgsQ0FBQSxNRmFPLEFDWEEsSUFBSSxFRFdFLENDWEMsRURXRSxJQ1hJLENBQUMsRURXRSxDQUFDLEtBQUssQUNYQSxDRFdDLENDWEMsQ0FBQyxFRFdFLEVBQUUsRUFBRSxRQUFRLEVBQUUsS0FB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SSxFQUFFLENBQUM7QUFDUCxTQUFPLENBQUMsR0FBRyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUM7Q0FDakMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIFRJTUVPVVQgPSA4MDA7XG52YXIgcHM7XG5zcGF3bldvcmtlcigpO1xuXG53aW5kb3cub25sb2FkID0gZnVuY3Rpb24oKSB7XG5cbiAgLy8gaW5pdGlhbGl6ZSB0aGUgZWRpdG9yXG4gIHdpbmRvdy5lZGl0b3IgPSBDb2RlTWlycm9yLmZyb21UZXh0QXJlYShkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvZGUtZWRpdG9yXCIpLCB7XG4gICAgbGluZU51bWJlcnM6IHRydWUsXG4gICAgbW9kZTogXCJqYXZhc2NyaXB0XCIsXG4gICAgbWF0Y2hCcmFja2V0czogdHJ1ZSxcbiAgICBhdXRvQ2xvc2VCcmFja2V0czogdHJ1ZSxcbiAgICBrZXlNYXA6ICdzdWJsaW1lJyxcbiAgICB0YWJTaXplOiAyLFxuICAgIHRoZW1lOiAndHRjbidcbiAgfSk7XG5cbiAgLy8gY2hlY2tzIGZvciBlcnJvcnMgaWYgdGhlIGVkaXRvciBjaGFuZ2VzLiB3YWl0cyBUSU1FT1VUIG1zIGFmdGVyIHRoZXkgZmluaXNoIHR5cGluZ1xuICB2YXIgd2FpdGluZztcbiAgZWRpdG9yLm9uKFwiY2hhbmdlXCIsICgpID0+IHtcbiAgICBjbGVhclRpbWVvdXQod2FpdGluZyk7XG4gICAgd2FpdGluZyA9IHNldFRpbWVvdXQodXBkYXRlRXJyb3JzLCBUSU1FT1VUKTtcbiAgfSk7XG5cbiAgLy8gYWRkcyB0aGUgc2F2ZSBmZWF0dXJlXG4gIHZhciBzYXZlID0gcmVxdWlyZSgnLi9zYXZlJyk7XG4gIHNhdmUoZWRpdG9yKTtcblxufTtcblxuLy8gYWRkcyByZXNpemluZyBmZWF0dXJlIFxucmVxdWlyZSgnLi9yZXNpemUnKTtcblxuXG4vLyB0aGlzIHdpbGwgaG9sZCB0aGUgZXJyb3Igb2JqZWN0cywgaWYgYW55XG52YXIgZXJyV2lkZ2V0cyA9IFtdO1xuXG5mdW5jdGlvbiBjaGVja0ZvckVycm9ycygpIHtcbiAgcmV0dXJuIGVycldpZGdldHM7XG59XG5cbi8vIGRpc3BsYXkgdGhlIGVycm9yIG1lc3NhZ2UgaW4gdGhlIGVkaXRvclxuZnVuY3Rpb24gcmVuZGVyRXJyKGxpbmVOdW0sIGRlc2MsIGNvbE51bSkge1xuICBpZiAoIWxpbmVOdW0pIHRocm93IG5ldyBFcnJvcignTGluZSBudW1iZXIgZm9yIHJlbmRlckVyciBtdXN0IGJlIGEgdmFsaWQgaW50ZWdlci4nKTtcbiAgdmFyIG1zZyA9ICQoYFxuICAgIDxkaXYgY2xhc3M9XCJsaW50LWVycm9yXCI+XG4gICAgICA8c3BhbiBjbGFzcz1cImxpbnQtZXJyb3ItaWNvblwiPiE8L3NwYW4+XG4gICAgICAke2Rlc2N9XG4gICAgPC9kaXY+XG4gIGApWzBdO1xuICBlcnJXaWRnZXRzLnB1c2goXG4gICAgZWRpdG9yLmFkZExpbmVXaWRnZXQobGluZU51bSAtIDEsIG1zZywgeyBjb3Zlckd1dHRlcjogZmFsc2UsIG5vSFNjcm9sbDogdHJ1ZSB9KVxuICApO1xufVxuXG4vLyBkbyBhbm90aGVyIGNoZWNrIGZvciBlcnJvcnNcbmZ1bmN0aW9uIHVwZGF0ZUVycm9ycygpIHtcbiAgdmFyIGNvZGUgPSBlZGl0b3IuZ2V0VmFsdWUoKTtcblxuICBlcnJXaWRnZXRzLmZvckVhY2goZXJyID0+IHtcbiAgICBlZGl0b3IucmVtb3ZlTGluZVdpZGdldChlcnIpO1xuICB9KTtcbiAgZXJyV2lkZ2V0cyA9IFtdO1xuXG4gIHRyeSB7XG4gICAgLy8gbGV0IGVzcHJpbWEgY2hlY2sgZm9yIHN5bnRheCBlcnJvcnNcbiAgICB2YXIgc3ludGF4ID0gZXNwcmltYS5wYXJzZShjb2RlLCB7IHRvbGVyYW50OiBmYWxzZSwgbG9jOiB0cnVlIH0pO1xuXG4gICAgLy9zZW5kIGNvZGUgdG8gdGhlIHdlYiB3b3JrZXIgdG8gZXhlY3V0ZSBhbmQgY2hlY2sgZm9yIGVycm9yc1xuICAgIHdlYldvcmtlci5wb3N0TWVzc2FnZShjb2RlKTtcbiAgICBwcyA9IHNldFRpbWVvdXQoa2lsbFdvcmtlciwgVElNRU9VVCk7XG5cbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgcmVuZGVyRXJyKGVyci5saW5lTnVtYmVyLCBlcnIuZGVzY3JpcHRpb24sIGVyci5jb2x1bW4pO1xuICB9XG5cbn1cblxud2luZG93LnJlcGxhY2VFZGl0b3JUZXh0ID0gZnVuY3Rpb24odGV4dCkge1xuICBlZGl0b3IucmVwbGFjZVJhbmdlKFxuICAgIHRleHQsXG4gICAgQ29kZU1pcnJvci5Qb3MoZWRpdG9yLmZpcnN0TGluZSgpLTEpLFxuICAgIENvZGVNaXJyb3IuUG9zKGVkaXRvci5sYXN0TGluZSgpKVxuICApO1xufVxuXG5mdW5jdGlvbiBraWxsV29ya2VyKCkge1xuICB3ZWJXb3JrZXIudGVybWluYXRlKCk7XG4gIHJlbmRlckVycigxLCAnVGhlIGNvZGUgaXMgdGFraW5nIGEgd2hpbGUuIFlvdSBtaWdodCBoYXZlIGFuIGluZmluaXRlIGxvb3AuJylcbiAgc3Bhd25Xb3JrZXIoKTtcbn1cblxuZnVuY3Rpb24gc3Bhd25Xb3JrZXIoKSB7XG4gIHdpbmRvdy53ZWJXb3JrZXIgPSBuZXcgV29ya2VyKCd3b3JrZXIuanMnKTtcbiAgd2ViV29ya2VyLm9ubWVzc2FnZSA9IGUgPT4ge1xuICAgIGlmIChlLmRhdGEubWVzc2FnZSkge1xuICAgICAgcmVuZGVyRXJyKGUuZGF0YS5saW5lTnVtYmVyLCBlLmRhdGEubWVzc2FnZSk7XG4gICAgfVxuICAgIGNsZWFyVGltZW91dChwcyk7XG4gIH07XG59XG5cbnZhciBleGVjdXRlID0gcmVxdWlyZSgnLi9leGVjJyk7XG5leGVjdXRlKGNoZWNrRm9yRXJyb3JzKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaGFzRXJyb3JzKSB7XG5cbiAgJChkb2N1bWVudCkucmVhZHkoKCkgPT4ge1xuXG4gICAgLy8gcG93ZXJzIHRoZSBSRVBMXG4gICAgJCgnI2NvbnNvbGUgZm9ybScpLm9uKCdzdWJtaXQnLCByZXBsKTtcblxuICAgIC8vIHBsYWNlcyBjdXJzb3IgaW4gdGhlIHByb21wdCBpZiB0aGV5IGNsaWNrIGFueXdoZXJlIGluIHRoZSBjb25zb2xlXG4gICAgJCgnI2NvbnNvbGUnKS5vbignY2xpY2snLCBlID0+IHtcbiAgICAgICQoJ2lucHV0JykuZm9jdXMoKTtcbiAgICB9KTtcblxuICAgIC8vcnVucyB0aGUgY29kZSBmcm9tIHRoZSBlZGl0b3IgaWYgdGhlIGJ1dHRvbiBpcyBjbGlja2VkXG4gICAgJCgnI2V4ZWN1dGUnKS5vbignY2xpY2snLCBleGVjdXRlKTtcblxuICAgIC8vcnVucyB0aGUgY29kZSBmcm9tIHRoZSBlZGl0b3IgaWYgY3RybCtzIGlzIHByZXNzZWRcbiAgICAkKHdpbmRvdykub24oJ2tleWRvd24nLCBlID0+IHtcbiAgICAgIGlmIChlLmN0cmxLZXkgJiYgZS5rZXlDb2RlID09PSA4Mykge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV4ZWN1dGUoKSAmJiBzaG93Q29uc29sZSgpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gZW5hYmxlIGNvbW1hbmQgaGlzdG9yeSBmb3IgdGhlIFJFUExcbiAgICAkKCcjY29uc29sZSBmb3JtJykub24oJ2tleWRvd24nLCBlID0+IHtcbiAgICAgIGlmIChlLmtleUNvZGUgPT09IDM4KSB7ICAvL3VwIGFycm93IGtleVxuICAgICAgICBjb21tYW5kSW5kZXgrKztcbiAgICAgIH0gZWxzZSBpZiAoZS5rZXlDb2RlID09PSA0MCkgeyAgLy9kb3duIGFycm93IGtleVxuICAgICAgICBjb21tYW5kSW5kZXgtLTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAnd2UgY2FuIGlnbm9yZSB0aGlzJztcbiAgICAgIH1cbiAgICAgIC8vIG1ha2Ugc3VyZSBjb21tYW5kSW5kZXggc3RheXMgd2l0aGluIHJhbmdlIHJhbmdlXG4gICAgICBjb21tYW5kSW5kZXggPSBNYXRoLm1pbihjb21tYW5kU3RhY2subGVuZ3RoIC0gMSwgY29tbWFuZEluZGV4KTtcbiAgICAgIGNvbW1hbmRJbmRleCA9IE1hdGgubWF4KC0xLCBjb21tYW5kSW5kZXgpO1xuICAgICAgJCgnI2NvbnNvbGUgZm9ybSBpbnB1dCcpLnZhbChjb21tYW5kU3RhY2tbY29tbWFuZEluZGV4XSk7XG4gICAgfSk7XG4gICAgXG4gIH0pO1xuXG4gIGZ1bmN0aW9uIGV4ZWN1dGUoKSB7XG4gICAgJCgnI2NvbnNvbGUgI291dHB1dCcpLmVtcHR5KCk7XG4gICAgdmFyIGVycm9ycyA9IGhhc0Vycm9ycygpO1xuICAgIHZhciBlcnJvciA9IGVycm9yc1swXTtcbiAgICBpZiAoZXJyb3Ipe1xuICAgICAgYWxlcnRpZnkuZXJyb3IoJ0NvZGUgaGFzIGVycm9ycy4gTm90IGV4ZWN1dGluZy4nKTtcbiAgICAgIHJldHVybiByZW5kZXIoXG4gICAgICAgIGVycm9yLm5vZGUuaW5uZXJUZXh0IHx8ICQoZXJyb3Iubm9kZSkudGV4dCgpLCAgICAvLyBjaHJvbWUgfHwgZmlyZWZveFxuICAgICAgICB7IFxuICAgICAgICAgIGVycm9yOiB0cnVlLCBcbiAgICAgICAgICBsaW5lTnVtOiBlZGl0b3IuZ2V0TGluZU51bWJlcihlcnJvci5saW5lKSArIDEgXG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfVxuXG4gICAgdmFyIGNvZGUgPSBlZGl0b3IuZ2V0VmFsdWUoKTtcblxuICAgIGFsZXJ0aWZ5LnN1Y2Nlc3MoYEV4ZWN1dGluZyAke2NvZGUuc3BsaXQoJ1xcbicpLmxlbmd0aH0gbGluZXMgb2YgamF2YXNjcmlwdC5gKTtcblxuICAgIHdyYXBMb2dPdXRwdXQoKCkgPT4ge1xuXG4gICAgICBldmFsKGNvZGUpO1xuICAgICAgY29uc29sZS5sb2coJ1xcbicpO1xuXG4gICAgICAkKCcjY29uc29sZSBmb3JtJykub2ZmKCdzdWJtaXQnKTtcbiAgICAgICQoJyNjb25zb2xlIGZvcm0nKS5vbignc3VibWl0JywgZXZhbCgnKCcrU3RyaW5nKHJlcGwpKycpJykpO1xuICAgICAgLy8gdGhpcyBldmFsL1N0cmluZyB0aGluZyBpcyBwcmV0dHkgd2VpcmQgcmlnaHQ/IEl0J3MgYmFzaWNhbGx5IGEgaGFjayB0aGF0IFJvYiBhbmQgSSBkZXZpc2VkIHRvIFwiY2xvbmVcIiBhIGZ1bmN0aW9uLiBJdCB0YWtlcyBhIGZ1bmMsIGNvbnZlcnRzIHRvIGEgc3RyaW5nLCB0aGVuIHJlZGVmaW5lcyBpdCBpbiBhbiBldmFsLiBUaGlzIGVmZmVjdGl2ZWx5IGFjaGlldmVzIGR5bmFtaWMgc2NvcGluZy4gQnkgcmVkZWZpbmluZyBpdCBpbiB0aGlzIHNjb3BlLCBJIGNhbiBhY2Nlc3MgdGhlIGxvY2FsIHZhcmlhYmxlcyBoZXJlIGluc3RlYWQgb2YgdGhlIGRlZmF1bHQgbGV4aWNhbCBzY29waW5nIGJlaGF2aW9yLiBUaGUgcmVhc29uIEkgd2FudCB0aGlzIGlzIHNvIHRoZSByZXBsIGhhcyBhY2Nlc3MgdG8gdGhlIHZhcmlhYmxlcyBkZWZpbmVkIGluIHRoZSBDb2RlTWlycm9yIGVkaXRvci5cblxuICAgIH0pO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG59XG5cbi8vIGFsbG93IHVzZXIgdG8gYWNjZXNzIHByZXZpb3VzbHkgZW50ZXJlZCBjb21tYW5kc1xudmFyIGNvbW1hbmRTdGFjayA9IFtdO1xudmFyIGNvbW1hbmRJbmRleCA9IC0xO1xuXG4vLyBwbGFjZSB0ZXh0IGluIHRoZSBjb25zb2xlXG5mdW5jdGlvbiByZW5kZXIodGV4dCwgb3B0aW9ucz17fSkge1xuICBpZiAodHlwZW9mIHRleHQgPT09ICdvYmplY3QnKSB7XG4gICAgdGV4dCA9IEpTT04uc3RyaW5naWZ5KHRleHQsIG51bGwsIDQpO1xuICB9IGVsc2Uge1xuICAgIHRleHQgPSBTdHJpbmcodGV4dCk7XG4gIH1cblxuICAvLyBUaGlzIHBhcnRpY3VsYXIgZXJyIG1lc3NhZ2UgaXMgcG9vci4gTWFrZSBpdCBhIGJpdCBtb3JlIGhlbHBmdWxcbiAgdGV4dCA9IHRleHQucmVwbGFjZShcbiAgICAvVW5leHBlY3RlZCBlbmQgb2YgaW5wdXQvLCBcbiAgICAnVW5leHBlY3RlZCBlbmQgb2YgaW5wdXQ6IHByb2JhYmx5IGFuIGV4dHJhIG9wZW5pbmcgYnJhY2tldCBvciBvcGVyYXRvci4nXG4gICk7XG5cbiAgaWYgKG9wdGlvbnMuYXJyb3cpXG4gICAgdGV4dCA9IGA9PiAke3RleHR9YDtcbiAgaWYgKG9wdGlvbnMuZXJyb3IpXG4gICAgdGV4dCA9IGA8c3BhbiBjbGFzcz1cImVycm9yXCI+JHt0ZXh0fTwvc3Bhbj5gO1xuICBpZiAob3B0aW9ucy5saW5lTnVtKVxuICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoLyEvLCBgbGluZSAke29wdGlvbnMubGluZU51bX0gLSBgKTtcbiAgJCgnI2NvbnNvbGUgI291dHB1dCcpLmFwcGVuZChgPHA+JHt0ZXh0fTwvcD5gKTtcblxuICAvLyBzY3JvbGwgdG8gYm90dG9tIGluIG9yZGVyIHRvIHNob3cgbW9zdCByZWNlbnRcbiAgdmFyIGNvbnNvbGVET00gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29uc29sZScpO1xuICBjb25zb2xlRE9NLnNjcm9sbFRvcCA9IGNvbnNvbGVET00uc2Nyb2xsSGVpZ2h0O1xufVxuXG4vLyBydW4gdGhlIFJFUEwgY29tbWFuZFxuZnVuY3Rpb24gcmVwbChlKSB7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbiAgdmFyIGNvZGUgPSAkKGUudGFyZ2V0KS5maW5kKCdpbnB1dCcpLnZhbCgpO1xuICBjb21tYW5kU3RhY2sudW5zaGlmdChjb2RlKTtcbiAgY29tbWFuZFN0YWNrID0gY29tbWFuZFN0YWNrLnNsaWNlKDAsIDkpOyAvLyBvbmx5IHJlbWVtYmVyIHRoZSBsYXN0IDEwIGNvbW1hbmRzXG4gIGNvbW1hbmRJbmRleCA9IC0xO1xuICB3cmFwTG9nT3V0cHV0KCgpID0+IHtcbiAgICAkKGUudGFyZ2V0KS5maW5kKCdpbnB1dCcpLnZhbCgnJyk7XG5cbiAgICAvL3ZhciBkZWNsYXJhdGlvbnMgZG9uJ3Qgd29yayBpbiB0aGUgUkVQTCwgc28gZ2l2ZSB0aGVtIGFuIGVycm9yXG4gICAgaWYgKGNvZGUubWF0Y2goL3Zhci8pKSByZXR1cm4gcmVuZGVyKCdkbyB2YXIgZGVjbGFyYXRpb25zIGluIHRoZSBlZGl0b3IgYWJvdmUnLCB7IGVycm9yOiB0cnVlIH0pO1xuXG4gICAgdmFyIGV2YWxFcnI7XG4gICAgdmFyIHdyYXBwZWRDb2RlID0gYHRyeXsgJHtjb2RlfVxcbiB9IGNhdGNoKGVycikgeyBldmFsRXJyID0gZXJyIH1gO1xuICAgIHRyeSB7XG4gICAgICB2YXIgb3V0cHV0ID0gZXZhbCh3cmFwcGVkQ29kZSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBldmFsRXJyID0gZXJyO1xuICAgIH1cbiAgICBpZiAoZXZhbEVycikge1xuICAgICAgcmVuZGVyKGV2YWxFcnIubWVzc2FnZSwgeyBlcnJvcjogdHJ1ZSB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVuZGVyKG91dHB1dCwgeyBhcnJvdzogdHJ1ZSB9KTtcbiAgICB9XG4gIH0pO1xufVxuXG4vLyBleGVjdXRlcyBhIGZ1bmN0aW9uIGluIGEgY29udGV4dCB3aGVyZSBhbGwgY2FsbHMgdG8gY29uc29sZS5sb2cgd2lsbCByZW5kZXIgdG8gdGhlIERPTVxuZnVuY3Rpb24gd3JhcExvZ091dHB1dChmdW5jKSB7XG4gIGNvbnNvbGUubmF0aXZlTG9nID0gY29uc29sZS5sb2c7XG4gIGNvbnNvbGUubG9nID0gZnVuY3Rpb24oKSB7XG4gICAgW10uZm9yRWFjaC5jYWxsKGFyZ3VtZW50cywgbGluZSA9PiB7XG4gICAgICByZW5kZXIobGluZSk7XG4gICAgfSk7XG4gICAgY29uc29sZS5uYXRpdmVMb2coLi4uYXJndW1lbnRzKTtcbiAgfVxuICBmdW5jKCk7XG4gIGNvbnNvbGUubG9nID0gY29uc29sZS5uYXRpdmVMb2c7XG59XG5cblxuXG5cbiIsInZhciByZWZyZXNoSGVpZ2h0cywgZWRpdG9ySGVpZ2h0LCBjb25zb2xlSGVpZ2h0O1xuXG4kKGRvY3VtZW50KS5yZWFkeShlID0+IHtcblxuICByZWZyZXNoSGVpZ2h0cyA9IGZ1bmN0aW9uKCkge1xuICAgIGVkaXRvckhlaWdodCA9ICQoJyNlZGl0b3Itd3JhcCcpLmNzcygnaGVpZ2h0Jyk7XG4gICAgY29uc29sZUhlaWdodCA9ICQoJyNjb25zb2xlJykuY3NzKCdoZWlnaHQnKTsgICAgXG4gIH07XG4gIHJlZnJlc2hIZWlnaHRzKCk7XG5cbiAgJCgnLnJlc2l6ZScpLmRyYWdnYWJsZSh7XG4gICAgYXhpczogJ3knLFxuICAgIFxuICAgIGRyYWc6IGUgPT4ge1xuICAgICAgdmFyIGNoYW5nZSA9IGUudGFyZ2V0LnN0eWxlLnRvcDtcblxuICAgICAgLy8gcHJldmVudCB0aGVtIGZyb20gcmVzaXppbmcgYmVsb3cgdGhlIGJvdHRvbSBvZiB0aGUgcGFnZVxuICAgICAgaWYgKFxuICAgICAgICBweFRvTnVtKGNoYW5nZSkgKyBweFRvTnVtKGVkaXRvckhlaWdodCkgPiBcbiAgICAgICAgd2luZG93LmlubmVySGVpZ2h0IC0gNTBcbiAgICAgICkgcmV0dXJuO1xuXG4gICAgICB2YXIgb3BlciA9ICcrLSc7XG4gICAgICBpZiAoY2hhbmdlWzBdID09PSAnLScpIHtcbiAgICAgICAgY2hhbmdlID0gY2hhbmdlLnNsaWNlKDEpO1xuICAgICAgICBvcGVyID0gJy0rJztcbiAgICAgIH1cbiAgICAgICQoJyNlZGl0b3Itd3JhcCcpLmNzcygnaGVpZ2h0JywgYGNhbGMoJHtlZGl0b3JIZWlnaHR9ICR7b3BlclswXX0gJHtjaGFuZ2V9KWApO1xuICAgICAgJCgnI2NvbnNvbGUnKS5jc3MoJ2hlaWdodCcsIGBjYWxjKCR7Y29uc29sZUhlaWdodH0gJHtvcGVyWzFdfSAke2NoYW5nZX0pYCk7XG4gICAgfSxcblxuICAgIHN0b3A6IGUgPT4ge1xuICAgICAgcmVmcmVzaEhlaWdodHMoKTtcbiAgICAgIGUudGFyZ2V0LnN0eWxlLnRvcCA9IDA7XG4gICAgICBlZGl0b3IucmVmcmVzaCgpO1xuICAgIH1cbiAgfSk7XG5cbiAgaGlkZUNvbnNvbGUoKTtcbiAgJCgnI2V4ZWN1dGUnKS5vbignY2xpY2snLCBzaG93Q29uc29sZSk7XG4gICQoJyNjbG9zZScpLm9uKCdjbGljaycsIGhpZGVDb25zb2xlKTtcblxufSk7XG5cbmZ1bmN0aW9uIHB4VG9OdW0oc3RyKSB7XG4gIHJldHVybiArc3RyLnNsaWNlKDAsIC0yKTtcbn1cblxud2luZG93LmhpZGVDb25zb2xlID0gZnVuY3Rpb24oKSB7XG4gICQoJyNibGFjay1zdHVmZicpLmhpZGUoKTtcbiAgJCgnI2VkaXRvci13cmFwJykuY3NzKCdoZWlnaHQnLCAnMTAwdmgnKTtcbiAgLy9jb25zb2xlIGhpZGVzIG9uIGxvYWQsIGFuZCBzb21ldGltZXMgdGhlIGVkaXRvciBpc24ndCBkZWZpbmVkIHlldC4gdGhpcyBwcmV2ZW50cyBcInVuZGVmaW5lZCBpcyBub3QgYSBmdW5jXCIgZXJyb3JzXG4gIHRyeSB7IGVkaXRvci5yZWZyZXNoKCk7IH0gY2F0Y2goZXJyKSB7fVxufVxuXG53aW5kb3cuc2hvd0NvbnNvbGUgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCQoJyNibGFjay1zdHVmZicpLmNzcygnZGlzcGxheScpICE9PSAnbm9uZScpIHJldHVybjtcbiAgJCgnI2JsYWNrLXN0dWZmJykuc2hvdygpXG4gICQoJyNjb25zb2xlJykuY3NzKCdoZWlnaHQnLCAnMzMuNXZoJyk7XG4gICQoJyNlZGl0b3Itd3JhcCcpLmNzcygnaGVpZ2h0JywgJzY1dmgnKTtcbiAgcmVmcmVzaEhlaWdodHMoKTtcbiAgZWRpdG9yLnJlZnJlc2goKTtcbn0iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGVkaXRvcikge1xuXG4gIHZhciBwYXRoID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lO1xuXG4gICQoJyNzYXZlJykub24oJ2NsaWNrJywgZSA9PiB7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0ocGF0aCwgZWRpdG9yLmdldFZhbHVlKCkpO1xuICAgIGFsZXJ0aWZ5LnN1Y2Nlc3MoJ1Byb2dyZXNzIHNhdmVkLicpO1xuICB9KTtcblxuICB2YXIgc2F2ZWQgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShwYXRoKTtcbiAgaWYgKHNhdmVkKSB7XG4gICAgcmVwbGFjZUVkaXRvclRleHQoc2F2ZWQpO1xuICB9XG5cbiAgJCgnI2NsZWFyJykub24oJ2NsaWNrJywgZSA9PiB7XG4gICAgdmFyIG1zZyA9ICdBcmUgeW91IHN1cmU/IFRoaXMgd2lsbCByZW1vdmUgc2F2ZWQgcHJvZ3Jlc3MgYW5kIHJlc3RvcmUgdGhlIGNoYWxsZW5nZXMgdG8gdGhlaXIgZm9ybWVyIHN0YXRlLic7XG4gICAgYWxlcnRpZnkuY29uZmlybShtc2csIHRoZXlTYWlkWWVzID0+IHtcbiAgICAgIGlmICh0aGV5U2FpZFllcykge1xuICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShwYXRoKTtcbiAgICAgICAgcmVwbGFjZUVkaXRvclRleHQoJCgnI2NvZGUtZWRpdG9yJykudmFsKCkpO1xuICAgICAgICBhbGVydGlmeS5lcnJvcignU2F2ZWQgcHJvZ3Jlc3MgcmVtb3ZlZC4nKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG5cbn0iXX0=
