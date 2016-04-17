'use strict';
describe('chatify tests', function () {

  var $rootScope,
      escapeHtml,
      chatify = function(){return true},
      emojify = function(){return true},
      cowify = function(){return true};

  initCommon();

  beforeEach(module('chat', function ($provide) {
    $provide.value('escapeHtml',chatify);
    $provide.value('emojify',emojify);
    $provide.value('cowify',cowify);
  }));


  beforeEach(function () {

    inject(function (_$rootScope_,_chatify_,_escapeHtml_, _emojify_, _cowify_) {
      $rootScope = _$rootScope_;
      chatify = _chatify_;
      escapeHtml = function(){return 'true'};
      emojify = _emojify_;
      cowify = _cowify_;
    });
  });

  describe('test the functionality of chatify', function () {
    it('should check default data', function () {
      expect(chatify).toBeDefined();
      expect(escapeHtml).toBeDefined();
      expect(emojify).toBeDefined();
      expect(cowify).toBeDefined();
    });
    it('execute', function () {
      expect(chatify()).toBe(true);
    });
  });
});