describe('hour', function () {
  var hour;

  beforeEach(module('util'));

  beforeEach(function () {
    inject(function ($injector) {
      hour = $injector.get('util.hour');
    })
  });

  it('should return 1hr', function () {
    expect(hour(3600)).toEqual('01:00');
  });

  it('should return an empty string', function () {
    expect(hour(1000000)).toEqual('');
  });
});