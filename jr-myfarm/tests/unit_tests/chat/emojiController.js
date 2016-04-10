'use strict';
describe('chat.emojiController tests', function () {

  var scope,
      $rootScope,
      self,
      emojiList;

  initCommon();

  beforeEach(function(){
    jr.storage= {};
  });

  beforeEach(function () {
    inject(function (_$rootScope_,$controller, _emojiList_) {
      $rootScope = _$rootScope_;
      scope = _$rootScope_.$new();

      emojiList = _emojiList_;

      self = $controller('chat.emojiController', {
        $scope: scope,
        emojiList : emojiList
      });
    });
  });

  describe('test the functionality of chat.emojiController', function () {
    it('should check default data', function () {
      expect(scope).toBeDefined();
      expect(emojiList).toBeDefined();
    });
  });
  describe('insertEmoji', function () {
    it('execute', function () {
      scope.insert = jasmine.createSpy('insert');
      
      scope.insertEmoji(':)');
      
      expect(scope.insert).toHaveBeenCalled();
      expect(scope.showEmojis).toBe(false);
    });
  });
  describe('toggleEmojis', function () {
    it('execute', function () {
      scope.showEmojis = false;
      
      scope.toggleEmojis();

      expect(scope.showEmojis).toBe(true);
    });
  });
  describe('hideEmojis', function () {
    it('execute', function () {
      scope.showEmojis = true;

      scope.hideEmojis();
      
      expect(scope.showEmojis).toBe(false);
    });
  });
});