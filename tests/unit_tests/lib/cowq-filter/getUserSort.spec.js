describe('getUserSort', function () {
  var getUserSort;

  initCommon();

  beforeEach(module('cowqFilter', function ($provide) {
    $provide.value('storage', {
      get: function () {
        return [true, false]
      }
    });
  }));

  beforeEach(function () {
    jr.storage = {
      get: function () {
        return {name: 'asd'}
      }
    };

    inject(function ($injector) {
      getUserSort = $injector.get('getUserSort');
    })
  });

  it('should user sort', function () {
    expect(getUserSort('profileName', {profileIndex: [1, 2, 3]})).toEqual({profileIndex: 1, reverse: false})
  });
});