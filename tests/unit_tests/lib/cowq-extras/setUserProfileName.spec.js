'use strict';
describe('setUserProfileName', function () {
  var setUserProfileName,
    storage;

  beforeEach(module('cowqExtras'));

  beforeEach(module(function ($provide) {
    storage = {
      set: function () {}
    };
    $provide.value('storage', storage);

    spyOn(storage, 'set');
  }));

  beforeEach(inject(function (_setUserProfileName_) {
    setUserProfileName = _setUserProfileName_;
  }));

  it('should storage set be called', function () {
    setUserProfileName('profileName');
    expect(storage.set).toHaveBeenCalledWith('cowq.profile', 'profileName');
  });
});