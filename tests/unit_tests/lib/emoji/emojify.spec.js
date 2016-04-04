'use strict';
describe('emojify tests', function () {
  var emojify;

  beforeEach(module('emoji'));

  beforeEach(function () {
    inject(function (_emojify_) {
      emojify = _emojify_;
    })
  });

  it('emojify with string match', function () {
    expect(emojify(';-)')).toEqual('<img src="/Resources/emoji/wink.png" title="Wink" alt=";)" class="emoji">')
  });

  it('emojify without match', function () {
    expect(emojify('no_match')).toEqual('no_match')
  });
});