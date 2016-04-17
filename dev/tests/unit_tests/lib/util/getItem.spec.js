describe('getItem', function () {
  var getItem;

  beforeEach(module('util'));
  beforeEach(function () {
    inject(function ($injector) {
      getItem = $injector.get('util.getItem');
    })
  });

  it('should return 1', function () {
    expect(getItem([1, 2, 3], function () { return true} )).toEqual(1)
  });

  it('should return undefined', function () {
    expect(getItem([1, 2, 3], function () { return false} )).toEqual(undefined)
  });
});