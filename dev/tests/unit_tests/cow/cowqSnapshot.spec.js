'use strict';
describe('cowqSnapshot tests', function () {

  var cowqSnapshot;

  initCommon();

  beforeEach(module('cow', function ($provide) {
    $provide.value('cowq.selectCows',mock);
    $provide.value('cowq.sort',sortCow);
    $provide.value('getUserSort',mock);
    $provide.value('getUserProfileName',mock);
  }));

  beforeEach(function () {
    jr.storage= {};

    inject(function (_cowqSnapshot_) {
      cowqSnapshot = _cowqSnapshot_;
    });
  });

  describe('test the functionality of cowqSnapshot', function () {
    it('should check default data', function () {
      expect(cowqSnapshot).toBeDefined();
    });
    it('execute', function () {
      var data ={},
          expected =['1','2','3'];
      
      data.profiles = {};
      data.profiles.profiles = ['test'];

      expect(cowqSnapshot(data,1,'12:12:12')).toEqual(expected);
    });
  });
});

function mock(){
  return true;
}

function sortCow(){
  return ['1','2','3'];
}