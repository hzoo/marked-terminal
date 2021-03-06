
var assert = require('assert');
var Renderer = require('../');
var marked = require('marked');


var identity = function (o) {
  return o;
};

function stripTermEsc(str) {
  return str.replace(/\u001b\[\d{1,2}m/g, "");
}

var opts = [
  'code', 'blockquote', 'html', 'heading',
  'firstHeading', 'hr', 'listitem', 'table',
  'paragraph', 'strong', 'em', 'codespan',
  'del', 'link', 'href'
];

var defaultOptions = {};
opts.forEach(function (opt) {
  defaultOptions[opt] = identity;
});

var defaultOptions2 = {};
opts.forEach(function (opt) {
  defaultOptions[opt] = identity;
});
defaultOptions2.reflowText = true;
defaultOptions2.showSectionPrefix = false;
defaultOptions2.width = 10;


defaultOptions.tableOptions = {
  chars: { 'top': '@@@@TABLE@@@@@' }
}

function markup(str, gfm) {
  gfm || (gfm = false);
  var r = new Renderer(defaultOptions2);
  var markedOptions = {
    renderer: r,
    gfm: gfm
  };
  return stripTermEsc(marked(str, markedOptions));
}

describe('Renderer', function () {
  var r = new Renderer(defaultOptions);
  var markedOptions = {
    renderer: r
  };

  it('should render links', function () {
    var text = '[Google](http://google.com)';
    var expected = 'Google (http://google.com)';
    assert.equal(marked(text, markedOptions).trim(), expected);
  });

  it('should pass on options to table', function () {
    var text = '| Lorem | Ipsum | Sit amet     | Dolar  |\n' +
    '|------|------|----------|----------|\n' +
    '| Row 1  | Value    | Value  | Value |\n' +
    '| Row 2  | Value    | Value  | Value |\n' +
    '| Row 3  | Value    | Value  | Value |\n' +
    '| Row 4  | Value    | Value  | Value |';

    assert.notEqual(marked(text, markedOptions).indexOf('@@@@TABLE@@@@@'), -1);
  });

  it('should not show link href twice if link and url is equal', function () {
    var text = 'http://google.com';
    assert.equal(marked(text, markedOptions).trim(), text);
  });

  it('should render html as html', function () {
    var html = '<strong>foo</strong>';
    assert.equal(marked(html, markedOptions).trim(), html);
  });

  it('should not escape entities', function () {
    var text = '# This < is "foo". it\'s a & string\n' +
      '> This < is "foo". it\'s a & string\n\n' +
      'This < is **"foo"**. it\'s a & string\n' +
      'This < is "foo". it\'s a & string';

    var expected = '# This < is "foo". it\'s a & string\n\n' +
      '   This < is "foo". it\'s a & string\n\n' +
      'This < is "foo". it\'s a & string\n' +
      'This < is "foo". it\'s a & string';
    assert.equal(marked(text, markedOptions).trim(), expected);
  });

  it('should not translate emojis inside codespans', function () {
    var markdownText = 'Some `:+1:`';

    assert.notEqual(marked(markdownText, markedOptions).indexOf(':+1:'), -1);
  });

  it('should translate emojis', function () {
    var markdownText = 'Some :+1:';
    assert.equal(marked(markdownText, markedOptions).indexOf(':+1'), -1);
  });

  it('should show default if not supported emojis', function () {
    var markdownText = 'Some :someundefined:';
    assert.notEqual(marked(markdownText, markedOptions).indexOf(':someundefined:'), -1);
  });

  it('should not escape entities', function () {
    var markdownText = 'Usage | Syntax' + '\r\n' +
    '------|-------' + '\r\n' +
    'General |`$ shell <CommandParam>`';

    assert.notEqual(marked(markdownText, markedOptions).indexOf('<CommandParam>'), -1);
  });

  it('should reflow paragraph', function () {
    text = 'Now is the time\n',
    expected = 'Now is the\ntime\n\n';
    assert.equal(markup(text), expected);
  });

  it('should nuke section header', function () {
    text = '# Contents\n',
    expected = 'Contents\n';
    assert.equal(markup(text), expected);
  });

  it('should reflow and nuke section header', function () {
    text = '# Now is the time\n',
    expected = 'Now is the\ntime\n';
    assert.equal(markup(text), expected);
  });

  it('should preserve line breaks (non gfm)', function () {
    text = 'Now  \nis    \nthe<br />time\n',
    expected = 'Now\nis\nthe<br\n/>time\n\n';
    assert.equal(markup(text, false), expected);
  });

  it('should preserve line breaks (gfm)', function () {
    text = 'Now  \nis    \nthe<br />time\n',
    expected = 'Now\nis\nthe\ntime\n\n';
    assert.equal(markup(text, true), expected);
  });

});
