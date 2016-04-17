'use strict';
describe('emojies factory tests', function () {
  var emojies;

  beforeEach(module('emoji'));

  beforeEach(function () {
    inject(function (_emojies_) {
      emojies = _emojies_;
    })
  });

  it('test if emojies generates good emoticons', function () {
    expect(emojies[1].generated).toEqual('<img src="/Resources/emoji/sad.png" title="Sad" alt=":(" class="emoji">');
    expect(emojies[1].to).toEqual({ src: '/Resources/emoji/sad.png', title: 'Sad', alt: ':(' });
    expect(emojies[1].match).toEqual([ /\:\(/gi, /\:-\(/gi ]);
  });
});