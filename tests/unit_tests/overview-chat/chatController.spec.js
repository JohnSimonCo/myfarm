'use strict';
describe('overview.chatController tests', function () {
  var scope,
    $rootScope,
    self;

  initCommon();

  beforeEach(module('chat', function ($provide) {
    $provide.value('myfarm', {
      data: {
        then: function () {
          return {
            then: function (callback) {
             return callback({
               data: 'some data',
               list: {
                 filter: function () {
                   return {}
                 }
               }
             })
            }
          }
        }
      }
    });

    $provide.value('isMessageUnread', function () {
      return {data: 'message data'}
    })
  }));

  beforeEach(function () {
    inject(function (_$rootScope_, $controller) {
      $rootScope = _$rootScope_;
      scope = _$rootScope_.$new();

      self = $controller('overview.chatController', {
        $scope: scope,
        'chat.exctractData': {}
      })

    })
  });

  describe('functionality of overview.chatController', function () {
    it('test default data', function () {
      expect(scope.data).toBeDefined();
      expect(scope.unread).toBeDefined();
    });
    it('isMessageUnread', function () {
      expect(scope.isMessageUnread()).toEqual({data: 'message data'});
    });
  });
});