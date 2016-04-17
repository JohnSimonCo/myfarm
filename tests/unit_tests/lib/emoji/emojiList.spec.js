'use strict';
describe('emojiList', function () {
  var emojiList;

  beforeEach(module('emoji'));

  beforeEach(function () {
    inject(function (_emojiList_) {
      emojiList = _emojiList_;
    })
  });

  it('emojiList functionality', function () {
    expect(emojiList[0]).toEqual({src: '/Resources/emoji/happy.png', title: 'Happy', alt: ':)'});
  });
});