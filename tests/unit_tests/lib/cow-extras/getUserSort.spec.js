describe('getUserCollapsed', function () {
  var getUserSort;

  initCommon();

  describe('inject with mocks', function () {
    beforeEach(module('cowExtras', function ($provide) {
      $provide.value('storage', {get: function () {
        return [true, false]
      }});
    }));

    injectFactory();

    it('should return boolean array', function () {
      expect(getUserSort()).toEqual([true, false])
    });
  });

  describe('without mocks', function () {
    injectFactory();

    it('should return true', function () {
      expect(getUserSort(0)).toEqual({
        sortCol: 0,
        reverse: false
      })
    });
  });

  function injectFactory() {
    beforeEach(function () {
      jr.storage = {
        get: function () {
          return {name: 'asd'}
        }
      };

      inject(function ($injector) {
        getUserSort = $injector.get('cow.getUserSort');
      })
    });
  }
});