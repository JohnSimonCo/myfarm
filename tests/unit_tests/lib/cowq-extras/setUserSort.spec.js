'use strict';
describe('setUserSort', function () {
  var setUserSort,
    storage;

  beforeEach(module('cowqExtras'));

  beforeEach(module(function ($provide) {
    storage = {
      get: function () {},
      set: function () {}
    };
    $provide.value('storage', storage);

    spyOn(storage, 'get');
    spyOn(storage, 'set');
  }));

  beforeEach(inject(function (_setUserSort_) {
    setUserSort = _setUserSort_;
  }));

  it('return default value', function () {
    setUserSort('profileName', {profileIndex: ['index1', 'index2']});

    expect(storage.get).toHaveBeenCalled();
    expect(storage.set).toHaveBeenCalled();
  });
});