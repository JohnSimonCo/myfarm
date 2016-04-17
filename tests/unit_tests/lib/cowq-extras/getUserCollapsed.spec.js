'use strict';
describe('getUserCollapsed', function () {
  var getUserCollapsed,
    storage;

  beforeEach(module('cowqExtras'));

  beforeEach(module(function ($provide) {
    storage = {
      get: function () {}
    };
    $provide.value('storage', storage)
  }));

  beforeEach(inject(function (_getUserCollapsed_) {
    getUserCollapsed = _getUserCollapsed_;
  }));

  it('return default value', function () {
    expect(getUserCollapsed()).toEqual(false)
  });
});