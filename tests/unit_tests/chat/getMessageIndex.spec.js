'use strict';
describe('chat.getMessageIndex tests', function () {

  var $rootScope,
      findIndex = jasmine.createSpy('util.findIndex').and.callFake(function(input,callback){return callback({id:2});}),
      getMessageIndex;

  initCommon();

  beforeEach(module('chat', function ($provide) {
    $provide.value('util.findIndex',findIndex);
  }));

  beforeEach(function () {
    inject(function (_$rootScope_,$injector) {
      $rootScope = _$rootScope_;
      getMessageIndex = $injector.get('chat.getMessageIndex');
    });
  });

  describe('test the functionality of chatify', function () {
    it('should check default data', function () {
      expect(getMessageIndex).toBeDefined();
    });
    it('execute', function () {
      var messages = [
        {id:1},
        {id:2},
        {id:3}
      ];

      expect(getMessageIndex(messages,2)).toBe(true);
    });
  });
});