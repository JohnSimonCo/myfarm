'use strict';
describe('cow.renderCell tests', function () {

  var $rootScope,
      simpleGraph = {},
      format = jasmine.createSpy('format').and.callFake(function(){return function(){}}),
      renderGraph;

  initCommon();

  beforeEach(module('cow', function ($provide) {
    $provide.value('simpleGraph',simpleGraph);
    $provide.value('util.format',format);
  }));

  beforeEach(function () {
    jr.storage = {};

    inject(function (_$rootScope_,$injector) {
      $rootScope = _$rootScope_;
      renderGraph = $injector.get('cow.renderGraph');
    });

    simpleGraph.Clear = jasmine.createSpy('simpleGraph.Clear');
    simpleGraph.setFont = jasmine.createSpy('simpleGraph.setFont');
    simpleGraph.addLine = jasmine.createSpy('simpleGraph.addLine');
    simpleGraph.paint = jasmine.createSpy('simpleGraph.paint');

    $.fn.appendTo = jasmine.createSpy('appendTo').and.returnValue(1);
  });

  describe('test the functionality of cow.renderCell', function () {
    xit('should check default data', function () {
      expect(renderGraph).toBeDefined();
    });
    xit('execute', function () {
      var detailCow  = {},
          time,
          detailData  = {},
          element = {};

      detailData.mlk = [1,2,3];
      detailData.sum7 = [
        {getDayYield: function(){return 0}},
        {getDayYield: function(){return 0}},
        {getDayYield: function(){return 0}}
      ];

      element.empty = jasmine.createSpy('element.empty');
      element.parent = function(){ return {
        width: function(){return 100},
        height: function(){return 100}
      }};
      element[0] = {};
      element.offsetHeight = 10;
      element.offsetTop = 10;
      //spyOn($.fn, 'appendTo');

      time = '12:12';
      
      renderGraph(detailCow,time,detailData,element);

      expect($.fn.appendTo).toHaveBeenCalled();
      expect(element.empty).toHaveBeenCalled();
      expect(simpleGraph.Clear).toHaveBeenCalled();
      expect(simpleGraph.setFont).toHaveBeenCalled();
      expect(simpleGraph.addLine).toHaveBeenCalled();
      expect(simpleGraph.paint).toHaveBeenCalled();
    });
  });
});