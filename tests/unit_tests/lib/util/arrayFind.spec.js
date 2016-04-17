describe('arrayFind', function () {
  var arrayFind;

  beforeEach(module('util'));
  beforeEach(function () {
    inject(function ($injector) {
      arrayFind = $injector.get('util.arrayFind');
    })
  });

  it('should return 1', function () {
    expect(arrayFind([1, 2, 3], function () { return true })).toEqual(1)
  });

  it('should return null', function () {
    expect(arrayFind([1, 2, 3], function () { return false })).toEqual(null)
  });
});