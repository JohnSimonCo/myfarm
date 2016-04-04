describe('buildUrl', function () {
  var buildUrl,
      urlObj,
      path,
      search,
      hash;

  beforeEach(module('util'));
  beforeEach(function () {
    inject(function (_buildUrl_) {
      buildUrl = _buildUrl_;
    });

    urlObj = {
      base: 'http://address.com/'
    };

    path = 'url-path';
    search = {prop1: 'value1'};
    hash = 'hashValue';
  });

  it('should return valid url based on parameters', function () {
    urlObj.path = path;
    urlObj.search = search;
    urlObj.hash = hash;
    expect(buildUrl(urlObj)).toEqual('http://address.com/#/url-path?prop1=value1#hashValue');
  });

  it('should return valid url without parameters', function () {
    expect(buildUrl(urlObj)).toEqual('http://address.com/#/');
  });
});