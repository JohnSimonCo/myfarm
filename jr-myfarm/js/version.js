'use strict';

jr.include('css/version.css');
jr.include('css/verset.css');

angular.module('version', ['j$', 'util', 'server', 'translate'])
.factory('version.data', ['sendRequest', '$filter', 'JsSerilz', '$q',
	function(sendRequest, $filter, JsSerilz, $q) {
		var sort = $filter('orderBy'),
			VMS_REGEX_REPLACE = /(<END>\$)[\s\S]+$/,
			VMS_REGEX_WITH = '$1';

		function deSerialize(data) {
			if(data.ddm) {
				data.ddm.forEach(function(d) {
					d.ver = sort(d.ver, 'time', true);

					d.ver = d.ver.map(function(v) {
						var deSerialized = {time: v.time, items: []};
						var sd = new JsSerilz('$', v.value);

						while(sd.hasMore()) {
							deSerialized.items.push([
								sd.getString(),
								sd.getString()
							]);
						}
						return deSerialized;
					});
				});

				data.ddm = sort(data.ddm, 'id');
			}

			if(data.vms) {
				data.vms.forEach(function(vms) {
					vms.ver = sort(vms.ver, 'time', true);

					vms.ver = vms.ver.map(function(v) {
						var deSerialized = {time: v.time, items: []};
						var sd = new JsSerilz('$', v.value.replace(VMS_REGEX_REPLACE, VMS_REGEX_WITH)); //remove the unwanted content after <END>

						while(sd.hasMore()) {
							deSerialized.items.push(sd.getString());
						}

						return deSerialized;
					});
				});

				data.vms = sort(data.vms, 'id');
			}
			return data;
		}

		return function(id) {
			return sendRequest('SrvVersion.getVersions', id).then(function(data) {
				if(!data) return $q.reject();
				else return deSerialize(data);
			});
		};
	}
])
.controller('versionController', ['$scope', 'data',
	function($scope, data) {
		$scope.data = data;
	}
])
.controller('version.ddmController', ['$scope',
	function($scope) {
		$scope.ddm.selectedVer = $scope.ddm.ver[0];
	}
])
.controller('version.vmsController', ['$scope',
	function($scope) {
		$scope.vms.selectedVer = $scope.vms.ver[0];

		$scope.toggleExpand = function() {
			$scope.expanded = !$scope.expanded;
		}
	}
]);