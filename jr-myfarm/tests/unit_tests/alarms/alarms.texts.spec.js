'use strict';
describe('alarms.texts tests', function () {

  var $rootScope,
      texts,
      translatedTexts;

  initCommon();

  beforeEach(function () {
    inject(function (_$rootScope_,_translatedTexts_,$injector) {
      $rootScope = _$rootScope_.$new();
      texts = $injector.get('alarms.texts');
      translatedTexts = _translatedTexts_;
    });
  });

  describe('test the functionality of alarms.texts', function () {
    it('should check default data', function () {
      expect(texts).toBeDefined();
    });
    it('check usage', function () {
      expect(texts('No permission')).toBe('Sorry, you have no permission for this...');
    });
  });
});
