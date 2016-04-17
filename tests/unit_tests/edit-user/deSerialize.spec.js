'use strict';
describe('editUser.deSerialize tests', function () {

  var $rootScope,
      deSerialize,
      sendRequest = jasmine.createSpy('sendRequest').and.returnValue({ then:function(callback){callback('test')} }),
      newUserId = jasmine.createSpy('newUserId').and.returnValue({then:function(){return {id:1}}}),
      $location = jasmine.createSpy('$location'),
      $ngSilentLocation = {},
      getItem = jasmine.createSpy('getItem').and.returnValue(user(true)),
      $httpBackend,
      $q;

      initCommon();

  beforeEach(module('editUser', function ($provide) {
    $provide.value('editUser.newUserId',newUserId);
    $provide.value('util.getItem',getItem);
    $provide.value('$location',$location);
    $provide.value('$ngSilentLocation',$ngSilentLocation);
  }));

  beforeEach(function () {
    jr.storage = {};

    $ngSilentLocation.silent =  jasmine.createSpy('$ngSilentLocation.silent');


    inject(function (_$rootScope_,$injector,_$q_,_$httpBackend_) {
      $q = _$q_;
      $httpBackend = _$httpBackend_;
      $rootScope = _$rootScope_;
      deSerialize = $injector.get('editUser.deSerialize');
    });

    $httpBackend.whenPOST('/Delaval/mvc/SrvLanguage/getTextOnPage').respond(201, '');
  });

  describe('test the functionality of editUser.deSerialize', function () {
    it('should check default data', function () {
      expect(newUserId).toBeDefined();
      expect(sendRequest).toBeDefined();
      expect(newUserId).toBeDefined();
      expect(getItem).toBeDefined();
      expect($location).toBeDefined();
    });
    it('execute when user', function () {
      var data = {},
          userId = 1;

      data.target = 'test';
      deSerialize(data,userId);
    });
    it('execute when NO user', function () {
      var data = {},
          userId = 1,
          deferred = $q.defer();

      data.target = 'target1';
      data.allRoles = ['role1','role2'];

      var expected = deSerialize(data,userId);

      deferred.resolve();
      $rootScope.$apply();
      expect(expected.$$state.status).toBe(1);
    });
  });


  function user(){
    var data;

    data = {
      id:1,
      status:'ok',
      firstName:'TestFirstName',
      lastName:'TestLastName',
      email:'test@gmail.com',
      domainId: 'test',
      roles: ['role1','role2']
    };

    return data;
  }
});
