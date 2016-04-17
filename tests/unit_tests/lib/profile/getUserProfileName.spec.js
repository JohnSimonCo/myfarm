'use strict';
describe('getUserProfile', function () {
  var getUserProfileName,
    storage;

  beforeEach(module('profile'));

  beforeEach(function () {
    module(function ($provide) {
      storage = {
        get: function () {
          return {storageObj: 'someValue'}
        },
        set: function () {
        }
      };

      $provide.value('storage', storage)
    })
  });

  beforeEach(inject(function (_getUserProfileName_) {
    getUserProfileName = _getUserProfileName_;
  }));

  it('without passing profiles', function () {
    expect(getUserProfileName()).toEqual(storage.get());
  });
  it('with passing profiles', function () {
    var profiles = {profiles: ['profile1', 'profile2']};

    spyOn(storage, 'get');
    expect(getUserProfileName(profiles)).toEqual('0');
    expect(storage.get).toHaveBeenCalled()
  });
});