'use strict';
describe('getUserProfileName', function () {
  var getUserProfileName,
    storage;

  beforeEach(module('cowqExtras'));

  beforeEach(module(function ($provide) {
    storage = {
      get: function () {
        return 'profileName'
      }
    };
    $provide.value('storage', storage)
  }));

  beforeEach(inject(function (_getUserProfileName_) {
    getUserProfileName = _getUserProfileName_;
  }));

  it('should return profile name', function () {
    var profiles = {profiles: {profileName: {profileProp: 'prop1'}}};
    expect(getUserProfileName(profiles)).toEqual('profileName');
  });

  it('should return profile name', function () {
    var profiles = {
      profiles: {
        profileName1: {
          profileIndex: 1,
          profileProp: 'prop1'
        }
      }
    };
    expect(getUserProfileName(profiles)).toEqual('profileName1');
  });
});