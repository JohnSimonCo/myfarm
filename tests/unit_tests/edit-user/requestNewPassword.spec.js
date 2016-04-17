'use strict';
describe('editUser.requestNewPassword tests', function () {

  var $rootScope,
      requestNewPassword,
      sendRequest = jasmine.createSpy('sendRequest').and.returnValue({ then:function(callback){callback('test')} });

  initCommon();

  beforeEach(module('editUser', function ($provide) {
    $provide.value('sendRequest',sendRequest);
  }));

  beforeEach(function () {
    jr.storage = {};

    inject(function (_$rootScope_,$injector) {
      $rootScope = _$rootScope_;
      requestNewPassword = $injector.get('editUser.requestNewPassword');
    });

  });

  describe('test the functionality of editUser.requestNewPassword', function () {
    it('should check default data', function () {
      expect(requestNewPassword).toBeDefined();
    });
    it('execute', function () {
      requestNewPassword(1,1);

      expect(sendRequest).toHaveBeenCalledWith('Users.newPassword',{target:1, user:1});
    });
  });
});