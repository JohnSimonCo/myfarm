'use strict';
describe('profile module test', function () {

  var deSerializeProfiles,
    storage;

  beforeEach(module('profile'));

  beforeEach(function () {
    module(function ($provide) {

      storage = {
        get: function () {
          return {storageObj: 'someValue'}
        },
        set: function () {
        }
      };

      $provide.value('storage', storage)
    })
  });

  beforeEach(inject(function (_deSerializeProfiles_) {
    deSerializeProfiles = _deSerializeProfiles_;
  }));

  describe('doSerializeProfiles', function () {
    var data = {
      fieldNames: ['field1', 'field2'],
      deLaval: {
        profiles: ['profile1', 'profile2']
      }
    };

    it('serialize profiles', function () {
      var expectedProfiles = {
        fieldNames: ['field1', 'field2'],
        profiles: {0: 'profile1', 1: 'profile2'},
        sortedProfiles: [{key: 0, value: 'profile1'}, {key: 1, value: 'profile2'}]
      };

      expect(deSerializeProfiles(data)).toEqual(expectedProfiles);
    });

    it('serialize with my profile', function () {
      data.myProfile = {
        profiles: ['myProfile1', 'myProfile2']
      };

      var expectedProfiles = {
        fieldNames: ['field1', 'field2'],
        profiles: {0: 'myProfile1', 1: 'myProfile2'},
        sortedProfiles: [{key: 0, value: 'myProfile1'}, {key: 1, value: 'myProfile2'}, {
          key: 0,
          value: 'profile1'
        }, {key: 1, value: 'profile2'}]
      };

      expect(deSerializeProfiles(data)).toEqual(expectedProfiles);
    });
  });
});