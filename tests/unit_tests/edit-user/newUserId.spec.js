'use strict';
describe('editUser.newUserId tests', function () {

  var $rootScope,
      newUserId,
      sendRequest = jasmine.createSpy('sendRequest').and.returnValue({ then:function(callback){callback('test')} });
  initCommon();

  beforeEach(module('editUser', function ($provide) {
    $provide.value('sendRequest',sendRequest);
  }));

  beforeEach(function () {
    jr.storage = {};

    inject(function (_$rootScope_,$injector) {
      $rootScope = _$rootScope_;
      newUserId = $injector.get('editUser.newUserId');
    });

  });

  describe('test the functionality of editUser.newUserId', function () {
    it('should check default data', function () {
      expect(newUserId).toBeDefined();
    });
    it('execute', function () {
      newUserId();

      expect(sendRequest).toHaveBeenCalledWith('Users.newUserId');
    });
  });
});