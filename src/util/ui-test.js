module.exports = function() {

  var UITest = (function() {
    var ui = {};
    ui.tests = [];
    ui.locals = [];

    ui.localize = function() {
      for (var i = 0; i < arguments.length; i++) {
        ui.locals.push(arguments[i]);
      }
    };

    ui.cleanWindow = function() {
      for (var i = 0; i < ui.locals.length; i++) {
        window[ui.locals[i]] = undefined;
      }
    };

    ui.addTest = function(test) {
      if (test.constructor === Function) {
        ui.tests.push({ test: test });
      } else {   //then i expect an object
        if (!test.test) throw new Error('Test property required.');
        ui.tests.push({
          before: test.before,
          test: test.test,
          after: test.after,
          pass: test.pass,
          fail: test.fail
        });
      }
      return ui;
    };

    ui.eval = function(code) {
      ui.cleanWindow();
      var codeLines = linefy(code);
      var codeQ = blockify(codeLines);
      var results = { pass: -1 };
      try {
        for (var i = 0; i < codeQ.length; i++) {
          var round = ui.tests[i];
          callIf(round.before, i);
          assert(codeQ[i], round.test, i, code);
          callIf(round.pass, i);
          results.pass++;
          callIf(round.after, i);
        }
      }
      catch(err) {
        console.error(err, i);
        callIf(round.fail, i);
        callIf(round.after, i);
        results.fail = i;
      }
      finally {
        results.complete = (ui.tests.length - 1 === results.pass);
        return results;
      }
    };

    function assert(block, test, num, code) {
      if (test(block, num, code) === false) throw 'Failed challenge #' + num;
    }

    //only call the function if it's defined (prevent undefined errors)
    function callIf(func) {
      return func && func.apply(this, [].slice.call(arguments, 1));
    }

    function linefy(code) {
      return code.split('\n').filter(function(el) {
        return el.trim() !== "";
      });
    }

    function blockify(codeLines) {
      var blocks = [];
      while (codeLines.length) {
        var block = codeLines.shift() + '\n';
        while (!validBracs(block)) {
          if (!codeLines.length) break;
          block += codeLines.shift() + '\n';
        }
        blocks.push(block);
      }
      return blocks;
    }

    function validBracs(str) {
      var bracs = str.match(/[\(\)\[\]\{\}]/g) || [];
      var stack = [];
      for (var i = 0; i < bracs.length; i++) {
        var brac = bracs[i];
        if (brac.match(/[\(\[\{]/)) {
          stack.push(brac);
        } else {
          if (!stack.length) return false;
          if (!bracMatch(stack.pop(), brac)) return false;
        }
      }
      return !stack.length;
    }

    function bracMatch(open, close) {
      return Math.abs(close.charCodeAt(0) - open.charCodeAt(0)) <= 2;
    }

    return ui;

  })();

  return UITest;
}