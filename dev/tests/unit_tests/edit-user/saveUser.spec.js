'use strict';
describe('editUser.saveUser tests', function () {

  var $rootScope,
      saveUser,
      sendRequest = jasmine.createSpy('sendRequest').and.returnValue({ then:function(callback){callback('test')} });

  initCommon();

  beforeEach(module('editUser', function ($provide) {
    $provide.value('sendRequest',sendRequest);
  }));

  beforeEach(function () {
    jr.storage = {};

    inject(function (_$rootScope_,$injector) {
      $rootScope = _$rootScope_;
      saveUser = $injector.get('editUser.saveUser');
    });

  });

  describe('test the functionality of editUser.saveUser', function () {
    it('should check default data', function () {
      expect(saveUser).toBeDefined();
    });
    it('execute', function () {
      saveUser(1);

      expect(sendRequest).toHaveBeenCalledWith('Users.saveUser',1);
    });
  });
});