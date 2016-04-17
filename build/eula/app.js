"use strict";angular.module("app",["j$","server","translate","password","ngRoute"]).factory("acceptFarmEula",["sendRequest",function(a){return function(b){return a("SrvUser.acceptFarmEula",b)}}]).factory("acceptUserEula",["sendRequest",function(a){return function(b){return a("SrvUser.acceptUserEula",b)}}]).controller("eulaController",["$scope","$location","handleLoginResponse","redirectToLogin",function(a,b,c,d){a.handleEulaResponse=function(a){c(a)},a.decline=function(){d()}}]).controller("farmEulaController",["$scope","$location","acceptFarmEula",function(a,b,c){var d=b.search();a.farmName=d.farmName,a.accept=function(){c(d.farmId).then(a.handleEulaResponse)}}]).controller("userEulaController",["$scope","$location","acceptUserEula",function(a,b,c){var d=b.search();a.userName=d.userName,a.accept=function(){c(d.userId).then(a.handleEulaResponse)}}]).config(["$routeProvider",function(a){a.when("/farm",{templateUrl:"farm.html",controller:"farmEulaController"}).when("/user",{templateUrl:"user.html",controller:"userEulaController"}).otherwise({resolve:{redirect:["$q","redirectToLogin",function(a,b){return b(),a.reject()}]}})}]).run(["sendRequest",function(a){a.when("SrvUser.acceptFarmEula","MOCK ID").respond({success:!1,reason:"eula_user",userId:"MOCK ID",userName:"John Rapp",farmName:"Bredsj�"}),a.when("SrvUser.acceptUserEula","MOCK ID").respond({success:!0})}]);