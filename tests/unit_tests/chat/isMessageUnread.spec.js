'use strict';
describe('isMessageUnread tests', function () {

  var $rootScope,
      isMessageUnread;


  initCommon();

  beforeEach(function () {

    inject(function (_$rootScope_,_isMessageUnread_) {
      $rootScope = _$rootScope_;
      isMessageUnread = _isMessageUnread_;
    });
  });

  describe('test the functionality of isMessageUnread', function () {
    it('should check default data', function () {
      expect(isMessageUnread).toBeDefined();
    });
    it('execute when true', function () {
      var message = {},
          data ={};

      message.time = '1000';
      message.fromId = 10;
      data.lastReadTime = '100';
      data.userId = 1;
      
      expect(isMessageUnread(message,data)).toBe(true);
    });
    it('execute when true', function () {
      var message = {},
          data ={};

      message.time = '10';
      message.fromId = 10;
      data.lastReadTime = '100';
      data.userId = 1;

      expect(isMessageUnread(message,data)).toBe(false);
    });
  });
});