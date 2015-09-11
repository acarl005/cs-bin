casper.test.begin('test the UI', function(test) {

  casper.on("page.error", function(msg, trace) {
    this.echo("Error: " + msg, "ERROR");
  });

  casper.setFilter("page.confirm", function(msg) {
    return true;
  });

  casper.start('http://localhost:3000', function() {
    this.waitForSelector('.CodeMirror');
  });

  casper.then(function() {
    test.assertDoesntExist('#console p');
    this.click('#execute');
    test.assertSelectorHasText('#console p', 'Hello, world!');
    fill('console.log(3)');
    this.evaluate(function() {
      replaceEditorText("console.log(3)");
    });
    this.click('#execute');
    test.assertSelectorHasText('#console p', '3');
  });

  casper.then(function() {
    this.evaluate(function() {
      replaceEditorText('fuction add1(n) { return n+1; }')
    });
    this.waitForSelector('.lint-error');
  });

  casper.then(function() {
    test.assertTextExists('Unexpected identifier');
    this.evaluate(function() {
      replaceEditorText('function add1(n) { return n+1; }')
    });
    this.waitWhileSelector('.lint-error');
  });

  casper.then(function() {
    this.click('#execute');
    this.fill('#prompt', {
      shell: 'add1(1)',
    }, true);
    test.assertTextExists('=> 2');
    this.fill('#prompt', {
      shell: 'ergnerogue',
    }, true);
    test.assertSelectorHasText('.error', 'ReferenceError: ');
    test.assertSelectorHasText('.error', 'ergnerogue');
    this.click('#prompt input');
    this.evaluate(function() {
      $('#prompt input').focus();
    });
    this.page.sendEvent('keydown', 16777235);  //press up arrow
    test.assertField('shell', 'ergnerogue');
    this.page.sendEvent('keydown', 16777235);
    this.page.sendEvent('keydown', 16777235);
    this.page.sendEvent('keydown', 16777235);
    this.page.sendEvent('keydown', 16777235);
    test.assertField('shell', 'add1(1)');
  });

  casper.then(function() {
    this.click('#save');
    this.reload();
  });

  casper.then(function() {
    test.assertSelectorDoesntHaveText('.CodeMirror', '// Type JavaScript here and click "Run Code"');
    test.assertSelectorHasText('.CodeMirror', 'function add1(n) { return n+1; }');
    this.click('#clear');
    this.reload();
  });

  casper.then(function() {
    test.assertSelectorHasText('.CodeMirror', '// Type JavaScript here and click "Run Code"');
  });

  casper.run(function() {
    test.done();
  });

});

function fill(code) {
  casper.evaluate
}