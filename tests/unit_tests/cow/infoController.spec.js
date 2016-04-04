'use strict';
describe('cow.infoController tests', function () {

  var scope,
      self,
      $rootScope,
      $httpBackend,
      myfarm,
      infoIndices,
      infoIndicesExtended,
      fetchCow,
      fetchCowControll = true,
      markAnimal;

  initCommon();

  beforeEach(module('cow', function ($provide) {
    $provide.value('hasTextInput',function(){});
  }));

  beforeEach(function(){
    jr.storage= {};
  });

  beforeEach(function () {
    inject(function (_$rootScope_,$controller,_$httpBackend_) {
      $rootScope = _$rootScope_;
      scope = _$rootScope_.$new();

      $httpBackend = _$httpBackend_;
      myfarm = myfarmMock();
      fetchCow = jasmine.createSpy('fetchCow').and.returnValue({then:function(callback){callback(fetchCowControll)}});
      markAnimal = jasmine.createSpy('markAnimal');
      infoIndices = jasmine.createSpy('infoIndices');
      infoIndicesExtended = jasmine.createSpy('infoIndicesExtended');

      scope.cow = {};
      scope.cow.toBeCulled = 1;
      scope.data = {};
      scope.data.profiles = {};
      scope.data.profiles.fieldNames = ['test'];

      self = $controller('cow.infoController', {
        $scope: scope,
        myfarm: myfarm,
        fetchCow: fetchCow,
        markAnimal: markAnimal,
        infoIndices: infoIndices,
        infoIndicesExtended: infoIndicesExtended
      });
    });

    spyOn($,'map').and.callFake(function(input,callback){callback('name','test')});
    spyOn($,'extend').and.returnValue(1);

    $httpBackend.whenPOST('/Delaval/mvc/SrvLanguage/getTextOnPage').respond(200,{});
    $httpBackend.whenPOST('/Delaval/mvc/SrvMyFarm/getAllData').respond(200,{});
    $httpBackend.whenPOST('/Delaval/mvc/FarmAdmin/getFarmsOnline').respond(200,{});
  });

  describe('test the functionality of cow.infoController', function () {
    it('should check default data', function () {
      expect(scope).toBeDefined();
      expect(fetchCow).toBeDefined();
      expect(markAnimal).toBeDefined();
      expect(infoIndices).toBeDefined();
      expect(infoIndicesExtended).toBeDefined();
    });
  });
  describe('watchers', function () {
    it('cow when Permission', function () {
      scope.cow.fetchCow = 1;
      scope.data.users = {};
      scope.data.users.test = {};
      scope.data.users.test.UserName = 'test';
      scope.data.perm =  0x100;
      scope.cow.notes = {};
      scope.cow.notes.test = {user:'test'};

      scope.$digest();
      expect(scope.fetchCow).toBe(1);
    });
    it('cow when NO NO Persmission', function () {
      scope.cow.fetchCow = 1;
      scope.data.users = {};
      scope.data.users.test = {};
      scope.data.users.test.UserName = 'test';
      scope.data.perm =  0;
      scope.cow.notes = null;

      scope.$digest();
      expect(scope.fetchCow).toBe(1);
    });
  });
  describe('onNotification ', function () {
    it('execute', function () {
      scope.data = {};
      scope.data.vcId = 1;
      scope.cow = 2;
      scope.onNotification();

      expect(markAnimal).toHaveBeenCalledWith(scope.data.vcId,scope.cow);
    });
  });
  describe('hasEditPermission', function () {
    it('execute', function () {
      scope.data.perm = 1;
      expect(scope.hasEditPermission()).toBe(0);
    });
  });
  describe('editNotification', function () {
    it('execute', function () {
        expect(scope.editNotification()).toBeUndefined();
    });
  });
  describe('toggleFetch', function () {
    it('execute when cow', function () {
      scope.toggleFetch();

      expect(scope.cow.fetchCow).toBe(true);
    });
    it('execute when NO cow', function () {
      scope.cow.fetchCow = 'test';
      changeFetchCowControll(null);

      scope.toggleFetch();

      expect(scope.cow.fetchCow).toBe('test');
    });
  });


  function myfarmMock(){
    var temp = {};
    temp.data = {then:function(callback){callback({writeMessagePermission:'test'})}};
    return temp;
  }

  function changeFetchCowControll(input)
  {
    fetchCowControll = input;
  }
});

