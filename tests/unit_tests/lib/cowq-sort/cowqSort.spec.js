'use strict';
describe('getUserSort tests', function () {
  var getUserSort,
      setUserSort,
      storage;

  beforeEach(module('cowqSort'));

  beforeEach(module(function ($provide) {
    storage = {
      get: function () { return {value: 1}},
      set: function () { return {} }
    };
    $provide.value('storage', storage);
  }));

  beforeEach(function () {
    inject(function (_getUserSort_, _setUserSort_) {
      getUserSort = _getUserSort_;
      setUserSort = _setUserSort_
    })
  });

  it('getUserSort functionality', function () {
    var profile = { profileIndex: ['index1', 'index2'] };
    var profileName = 'profileName';

    expect(getUserSort(profileName, profile)).toEqual({profileIndex: 'index1', reverse: false});
  });

  it('setUserSort functionality', function () {
    spyOn(storage, 'set');

    setUserSort();

    expect(storage.set).toHaveBeenCalled()
  });
});