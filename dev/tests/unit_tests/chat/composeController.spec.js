'use strict';
describe('chat.composeController tests', function () {

  var scope,
      $rootScope,
      self,
      sendMessage,
      editMessage,
      deleteMessage;

  initCommon();

  beforeEach(function(){
    jr.storage= {};
  });

  beforeEach(function () {
    inject(function (_$rootScope_,$controller) {
      $rootScope = _$rootScope_;
      scope = _$rootScope_.$new();

      sendMessage = jasmine.createSpy('sendMessage');
      editMessage = jasmine.createSpy('editMessage');
      deleteMessage = jasmine.createSpy('deleteMessage');

      self = $controller('chat.composeController', {
        $scope: scope,
        'chat.sendMessage': sendMessage,
        'chat.editMessage': editMessage,
        'chat.deleteMessage': deleteMessage
      });
    });
  });

  describe('test the functionality of chat.composeController', function () {
    it('should check default data', function () {
      expect(scope).toBeDefined();
      expect(sendMessage).toBeDefined();
      expect(editMessage).toBeDefined();
      expect(deleteMessage).toBeDefined();
    });
  });
  describe('$on test', function () {
    it('editMessage', function () {
      var message = {};
      message.text = 'test';
      message.id = 1;
      $rootScope.$broadcast('editMessage',message);
      expect(scope.message).toBe('test');
      expect(scope.id).toBe(1);
    });
  });
  describe('changed', function () {
    it('execute', function () {
      expect(scope.changed()).toBe(true);
    });
  });
  describe('send', function () {
    it('when editing TRUE', function () {
      var message = {};
      message.text = 'test';
      message.id = 1;
      spyOn(scope,'$emit');

      $rootScope.$broadcast('editMessage',message);
      scope.send();

      expect(editMessage).toHaveBeenCalled();
      expect(scope.$emit).toHaveBeenCalledWith('messageEdited');
    });
    it('when editing FALSE', function () {
      var message = {};
      message.text = 'test';
      message.id = undefined;
      spyOn(scope,'$emit');

      $rootScope.$broadcast('editMessage',message);
      scope.send();

      expect(sendMessage).toHaveBeenCalled();
    });
  });
  describe('delete', function () {
    it('execute', function () {
      var expected = '';
      scope.id = 1;

      scope.delete();

      expect(deleteMessage).toHaveBeenCalledWith(1);
      expect(scope.message).toEqual(expected);
    });
  });
});