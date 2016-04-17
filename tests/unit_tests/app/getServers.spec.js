'use strict';
describe('getServers tests', function () {

  var getServers,
      $q;

  initCommon();

  beforeEach(function () {

    inject(function (_getServers_,_$q_) {
      getServers = _getServers_;
      $q = _$q_;
    });
});

  describe('test the functionality of getServers', function () {
    it('getServers', function () {
      var expected = {$$state:{status:0}};
      expect(getServers()).toEqual(expected);
    });
  });
});