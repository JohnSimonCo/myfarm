'use strict';

angular.module('app', ['j$', 'server', 'translate', 'password', 'ngRoute'])
    .factory('acceptFarmEula', ['sendRequest', function(sendRequest) {
        return function(farmId) {
            return sendRequest('SrvUser.acceptFarmEula', farmId);
        }
    }])
    .factory('acceptUserEula', ['sendRequest', function(sendRequest) {
        return function(userId) {
            return sendRequest('SrvUser.acceptUserEula', userId);
        }
    }])
    .controller('eulaController', ['$scope', '$location', 'handleLoginResponse', 'redirectToLogin',
        function($scope, $location, handleLoginResponse, redirectToLogin) {
            $scope.handleEulaResponse = function(response) {
                //Response is same as for login
                handleLoginResponse(response);
            };
            $scope.decline = function() {
                redirectToLogin();
            };
        }
    ])
    .controller('farmEulaController', ['$scope', '$location', 'acceptFarmEula', function($scope, $location, acceptFarmEula) {
        var data = $location.search();
        $scope.farmName = data.farmName;
        $scope.accept = function() {
            acceptFarmEula(data.farmId).then($scope.handleEulaResponse);
        }
    }])
    .controller('userEulaController', ['$scope', '$location', 'acceptUserEula', function($scope, $location, acceptUserEula) {
        var data = $location.search();
        $scope.userName = data.userName;
        $scope.accept = function() {
            acceptUserEula(data.userId).then($scope.handleEulaResponse);
        }
    }])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/farm', {
                templateUrl: 'farm.html',
                controller: 'farmEulaController'
            })
            .when('/user', {
                templateUrl: 'user.html',
                controller: 'userEulaController'
            })
            .otherwise({
                resolve: {
                    redirect: ['$q', 'redirectToLogin', function($q, redirectToLogin) {
                        redirectToLogin();
                        return $q.reject();
                    }]
                }
            });
    }])
    .run(['sendRequest', function(sendRequest) {
        sendRequest.when('SrvUser.acceptFarmEula', 'MOCK ID').respond({
            success: false,
            reason: 'eula_user',
            userId: 'MOCK ID',
            userName: 'John Rapp',
            farmName: 'Bredsjö'
        });
        sendRequest.when('SrvUser.acceptUserEula', 'MOCK ID').respond({
            success: true
        });
    }]);