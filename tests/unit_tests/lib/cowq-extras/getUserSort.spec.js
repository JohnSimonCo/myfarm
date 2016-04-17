'use strict';
describe('getUserSort', function () {
  var getUserSort,
    storage;

  beforeEach(module('cowqExtras'));

  beforeEach(module(function ($provide) {
    storage = {
      get: function () {}
    };
    $provide.value('storage', storage)
  }));

  beforeEach(inject(function (_getUserSort_) {
    getUserSort = _getUserSort_;
  }));

  it('return default value', function () {
    expect(getUserSort('profileName', {profileIndex: ['index1', 'index2']})).toEqual({ profileIndex: 'index1', reverse: false })
  });
});