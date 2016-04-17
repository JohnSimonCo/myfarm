describe('timeDiff', function () {
  var timeDiff;

  beforeEach(module('util'));

  beforeEach(function () {
    inject(function ($injector) {
      timeDiff = $injector.get('util.timeDiff');
    })
  });

  it('should should return 5 min diff', function () {
    expect(timeDiff(360000, 3600)).toEqual('00:05');
  });
  it('should return null', function () {
    expect(timeDiff(360000)).toEqual(null);
  });
});