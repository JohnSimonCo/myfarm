'use strict';
describe('cowq.extractData tests', function () {

  var $rootScope,
      markAnimal,
      state = false,
      action = 'positive',
      sendRequest = jasmine.createSpy('sendRequest').and.returnValue({then:function(){}}),
      getText = jasmine.createSpy('getText').and.returnValue('Monday,Tuesday'),
      prompt = jasmine.createSpy('prompt').and.returnValue({then:function(callback){
        return callback( {action:action, text:'comment'})
      }}),
      prompt3 = jasmine.createSpy('prompt3').and.returnValue({then:function(callback){
        return callback( {action:action, text:'comment'})
      }}),
      confirm = jasmine.createSpy('confirm').and.returnValue({then:function(callback){return callback()}}),
      hasTextInput = jasmine.createSpy('hasTextInput').and.callFake(function(){return state;}),
      format = jasmine.createSpy('format').and.returnValue({render:function(){return 'test'}});

  initCommon();

  beforeEach(module('cowq', function ($provide) {
    $provide.value('sendRequest',sendRequest);
    $provide.value('cowq.getText',getText);
    $provide.value('prompt',prompt);
    $provide.value('prompt3',prompt3);
    $provide.value('confirm',confirm);
    $provide.value('hasTextInput',hasTextInput);
    $provide.value('util.format',format);
  }));


  beforeEach(function () {
    jr.storage = {};

    inject(function (_$rootScope_,$injector) {
      $rootScope = _$rootScope_;
      markAnimal = $injector.get('markAnimal');
    });
  });

  describe('test the functionality of cowq.extractData', function () {
    it('should check default data', function () {
      expect(markAnimal).toBeDefined();
    });
    it('execute when no cow.markBySign', function () {
      var vcId = 1,
          cow = {};

      state = false;
      cow.nr = '11';

      markAnimal(vcId,cow);
      expect(sendRequest).toHaveBeenCalled();
      expect(confirm).toHaveBeenCalled();
    });
    it('execute when no cow.markBySign and hastextinput = true', function () {
      var vcId = 1,
          cow = {};

      state = true;
      cow.nr = '11';

      markAnimal(vcId,cow);
      expect(sendRequest).toHaveBeenCalled();
      expect(confirm).toHaveBeenCalled();
    });
    it('execute when cow.markBySign and getHasTextInput and action=positive', function () {
      var vcId = 1,
          cow = {};

      state = true;
      cow.nr = '11';
      cow.markBySign = 'yes';

      markAnimal(vcId,cow);
      expect(sendRequest).toHaveBeenCalled();
      expect(confirm).toHaveBeenCalled();
    });
    it('execute when cow.markBySign and getHasTextInput abd action = neutral', function () {
      var vcId = 1,
          cow = {};

      action = 'neutral';
      state = true;
      cow.nr = '11';
      cow.markBySign = 'yes';


      markAnimal(vcId,cow);
      expect(sendRequest).toHaveBeenCalled();
      expect(confirm).toHaveBeenCalled();
    });
  });
});