'use strict';

angular.module('translate', ['server', 'util'])
.factory('translations', function() {
	return {texts: jr.translations};
})
.factory('translate', ['translations', 'translate.requestTranslation', 'translate.translationParams',
	function(translations, requestTranslation, translationParams) {
		return function(text, params) {
			if(!text) return;

			text = translations.texts[text] || requestTranslation(text);
			return translationParams(text, params);
		};
	}
])
.factory('translate.requestTranslation', ['sendRequest', 'translations', '$rootScope',
	function(sendRequest, translations, $rootScope) {
		return function(text) {
			sendRequest("SrvLanguage.getTextOnPage", {
				page: location.pathname,
				text: text
			}).then(function(translation) {
				translations.texts[text] = translation;
				$rootScope.$broadcast('translate.translationsChanged');
			});
			translations.texts[text] = text;
			return text;
		}
	}
])
.factory('translate.translationParams', ['util.escapeRegex', function(escapeRegex) {
	return function(text, params) {
		if(params) {
			angular.forEach(params, function(value, key) {
				text = text.replace(new RegExp(escapeRegex('$' + key), 'g'), value);
			});
		}
		return text;
	}
}])
.factory('translate.changeLanguage', ['sendRequest', 'translate.userLanguage', 'translations', '$rootScope',
	function(sendRequest, userLanguage, translations, $rootScope) {
		return function(language) {
			userLanguage.set(language);

			sendRequest('SrvUser.saveUserLanguage', language);
			sendRequest('SrvLanguage.newPageTranslation', {
				page: location.pathname,
				text: language
			}).then(function(newTranslations) {
				translations.texts = newTranslations;
				$rootScope.$broadcast('translate.translationsChanged', translations);
			});
		}
	}
])
.directive('translate', ['translate', function(translate) {
	return {
		restrict: 'AC',
		link: function(scope, element, attr) {
			render();

			scope.$on('translate.translationsChanged', render);

			function render() {
				element.text(translate(attr.translate));
			}
		}
	}
}])
.directive('translateBind', ['translate', '$parse', function(translate, $parse) {
	return {
		restrict: 'AC',
		link: function(scope, element, attr) {
			scope.$watch(attr.translateBind, function(text) {
				render(text);
			});

			scope.$on('translate.translationsChanged', function() {
				render($parse(attr.translateBind)(scope));
			});

			function render(text) {
				element.text(translate(text));
			}
		}
	}
}])
.filter('translate', ['translate', function(translate) {
	return translate;
}])
.factory('translatedTexts', ['translate', function(translate) {
	return function(texts) {
		return function(text, params) {
			return translate(texts[text], params);
		}
	}
}])
.factory('keepTranslated', ['$rootScope', '$cacheFactory', 'translate', function($rootScope, $cacheFactory, translate) {
	var cache = $cacheFactory('keepTranslated');
	var texts = [];
	$rootScope.$on('translate.translationsChanged', function() {
		cache.removeAll();
		texts.forEach(function(text) {
			cache.put(text, translate(text));
		});
	});
	return function(text) {
		cache.put(text, translate(text));
		texts.push(text);
		return { translation: function() {
			return cache.get(text);
		} };
	}
}])
.factory('translate.defaultUserLanguage', ['$window', '$log', function($window, $log) {
	return function(languages) {
		$log.debug('*** defaultUserLanguage')
		var language = $window.navigator.userLanguage || $window.navigator.language;

		if(language) {
			language = language.toLowerCase();
			for(var i = 0; i < languages.length; i++) {
				if(languages[i] === language) {
					return languages[i];
				}
			}
			//Reduce for example sv-se to sv
			language = language.match(/^([^-]+)/)[1];
			for(var i = 0; i < languages.length; i++) {
				if(languages[i] === language) {
					return languages[i];
				}
			}
		}

		//Default
		return 'en-us';
	}
}])
.factory('translate.userLanguage', ['storage', 'translate.defaultUserLanguage', '$log', function(storage, getDefaultLanguage, $log) {
	return {
		get: function(languages) {
			$log.debug("***This is wrong")
			return storage.get('lcid') || getDefaultLanguage(languages);
		},
		set: function(value) {
			storage.set('lcid', value);
		}
	}
}])
.run(['$rootScope', '$location', '$window', 'translate.userLanguage', 'translate.changeLanguage',
	function($rootScope, $location, $window, userLanguage, changeLanguage) {
		$rootScope.$on('$locationChangeSuccess', function() {
			var search = $location.search();
			var language = userLanguage.get([]);
			if(search.lang && search.lang != language) {
				changeLanguage(search.lang);
				delete search.lang;
				$location.search(search).replace();
				$window.location.reload();
			}
		});
	}
]);