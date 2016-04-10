'use strict';
describe('setProfile', function () {
  var setProfile,
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

  beforeEach(inject(function (_setProfile_) {
    setProfile = _setProfile_;
  }));

  it('setting profile', function () {
    spyOn(storage, 'set');

    setProfile('profileName');
    expect(storage.set).toHaveBeenCalledWith('profile', 'profileName');
  });
});