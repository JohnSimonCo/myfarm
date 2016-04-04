angular.module('native')
//Mock nativeInterface
.factory('nativeInterface', function() {
	return {
		callMethod: function(name, arg) {
			console.log('callMethod:', arguments)
		},
		registerCallback: function() {
			console.log('registerCallback:', arguments)
		},
		registerDevice: function() {
			console.log('registerDevice:', arguments)
		},
		forceUpdate: function() {
			this.updateHasBeenForced = true;
			console.log('forceUpdate:', arguments)
		},
		updateHasBeenForced: false
	}
});

describe('native', function() {
	beforeEach(module('native'));
	// beforeEach(inject(function($window) {
	// 	$window.appInfo = {
	// 		protocol: 'IOS 1.0',
	// 		deviceInfo: {token: 321, appVersion: '2.0'}
	// 	}
	// }))

	// it('should tell which version is compatible is which is not', inject(function(isAppCompatible, compatibleProtocols) {
	// 	compatibleProtocols.forEach(function(protocol) {
	// 		expect(isAppCompatible(protocol)).toBeTruthy();
	// 	});

	// 	var nonCompatibleProtocols = [
	// 		'Blackberry 1.0',
	// 		'IOS 0.0',
	// 		'Android 0.0'
	// 	];

	// 	nonCompatibleProtocols.forEach(function(protocol) {
	// 		expect(isAppCompatible(protocol)).toBeFalsy();
	// 	});
	// }))

	describe('IOS 1.0', function() {
		beforeEach(inject(function($window) {
			$window.appInfo = {
				protocol: 'IOS 1.0',
				deviceInfo: {token: 321, appVersion: '1.0'}
			}
		}));

		// it('should')
	});

	// it('should force update when using incompatible version', inject(function() {

	// }));
});