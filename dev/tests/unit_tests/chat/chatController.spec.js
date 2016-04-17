'use strict';
describe('actionbarController tests', function () {

  var scope,
      $rootScope,
      self,
      data,
      pageVisible,
      $timeout,
      isMessageUnread;

  initCommon();

  beforeEach(function(){
    jr.storage= {};
  });

  beforeEach(function () {
    inject(function (_$rootScope_,$controller, _pageVisible_, _$timeout_) {
      $rootScope = _$rootScope_;
      scope = _$rootScope_.$new();

      pageVisible = _pageVisible_;
      $timeout = _$timeout_;
      isMessageUnread = jasmine.createSpy('isMessageUnread').and.returnValue(false);
      data = {};

      self = $controller('chatController', {
        $scope: scope,
        data: data,
        pageVisible: pageVisible,
        $timeout: $timeout,
        isMessageUnread: isMessageUnread
      });
    });
  });

  describe('test the functionality of actionbarController', function () {
    it('should check default data', function () {
      expect(scope).toBeDefined();
      expect(pageVisible).toBeDefined();
      expect($timeout).toBeDefined();
      expect(isMessageUnread).toBeDefined();
    });
  });
  describe('select', function () {
    it('execute when message is the same', function () {
      spyOn($rootScope,'$broadcast');
      scope.selectedMessage = 'test';
      scope.select('test');
      expect(scope.selectedMessage).toBe(null);
      expect($rootScope.$broadcast).toHaveBeenCalled();
    });
    it('execute when message is NOT the same', function () {
      spyOn($rootScope,'$broadcast');
      scope.selectedMessage = 'test';
      scope.select('test2');
      expect(scope.selectedMessage).toBe('test2');
      expect($rootScope.$broadcast).toHaveBeenCalled();
    });
  });
  describe('$broadcast', function () {
    it('chat.update', function () {
      spyOn(scope,'$apply');
      $rootScope.$broadcast('chat.update');
      expect(scope.$apply).toHaveBeenCalled();
    });
    it('messageEdited', function () {
      $rootScope.$broadcast('messageEdited');
      expect(scope.selectedMessage).toBe(null);
    });
  });
  describe('isMessageUnread', function () {
    it('execute', function () {
      scope.isMessageUnread();
      expect(isMessageUnread).toHaveBeenCalled();
    });
  });
});