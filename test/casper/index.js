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
    test.assertDoesntExist('#console p', 'there should be no console ouput');
    this.click('#execute');
    test.assertSelectorHasText('#console p', 'Hello, world!', 'should print hello world to console');
    fill('console.log(3)');
    this.evaluate(function() {
      replaceEditorText("console.log(3)");
    });
    this.click('#execute');
    test.assertSelectorHasText('#console p', '3', 'should see 3 in the console');
  });

  casper.then(function() {
    this.evaluate(function() {
      replaceEditorText('fuction add1(n) { return n+1; }')
    });
    this.waitForSelector('.lint-error');
  });

  casper.then(function() {
    test.assertTextExists('Unexpected identifier', 'should see error message');
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
    test.assertTextExists('=> 2', 'return value, 2, should be in the console');
    this.fill('#prompt', {
      shell: 'ergnerogue',
    }, true);
    test.assertSelectorHasText('.error', 'Can\'t find variable:', 'should see error message for undefined variable');
    test.assertSelectorHasText('.error', 'ergnerogue', 'should show the offending variable name');
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
    test.assertSelectorDoesntHaveText('.CodeMirror', '// Type JavaScript here and click "Run Code"', 'original comment should be gone');
    test.assertSelectorHasText('.CodeMirror', 'function add1(n) { return n+1; }', 'page should load with saved text');
    this.click('#clear');
    this.waitForSelector('.alertify-button', function() {
      this.click('.alertify-button-ok');
      this.reload();
    });
  });

  casper.then(function() {
    test.assertSelectorHasText('.CodeMirror', '// Type JavaScript here and click "Run Code"', 'should have cleared the saved data');
  });

  casper.run(function() {
    test.done();
  });

});

function fill(code) {
  casper.evaluate
}