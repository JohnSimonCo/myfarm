describe('formatDate', function () {
  var formatDate;

  beforeEach(module('util'));
  beforeEach(function () {
    inject(function ($injector) {
      formatDate = $injector.get('util.formatDate');
    })
  });

  it('should return date', function () {
    expect(formatDate('20-01-2015')).toEqual('20-01-2015')
  });
});