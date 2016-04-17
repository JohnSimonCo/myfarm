'use strict';

jr.include('css/overview-chat.css');
angular.module('overviewChat', ['chat'])
.controller('overview.chatController', ['$scope', 'myfarm', 'chat.extractData', 'isMessageUnread',
	function($scope, myfarm, extractData, isMessageUnread) {
		myfarm.data.then(extractData).then(function(data) {
			$scope.data = data;

			generateUnread(data);
		});

		$scope.$on('chat.update', function(event, data) {
			$scope.$apply(function() {
				generateUnread(data);
			});
		});

		function generateUnread(data) {
			$scope.unread = data.list.filter($scope.isMessageUnread);
		}

		$scope.isMessageUnread = function(message) {
			return isMessageUnread(message, $scope.data);
		};
	}
])
.directive('bubbleIcon', ['$timeout', '$window', function($timeout, window) {
	var $window = $(window);

	//Declare fractions (constants)
	var sizeFract = 0.25,
		fontSizeFract = 0.75,
		xFract = 0,
		yFract = 0.6;
	return {
		restrict: 'E',
		link: function(scope, element, attr) {
			var img = element.find('img'),
				div = element.find('div');

			scope.$watch(attr.unreadCount, function(value) {
				div.text(value);
			});

			img.load(function() {
				div.css('display', 'block');
				position();
			});

			$window.on('resize', position);

			scope.$on('$destroy', function() {
				$window.off('resize', position);
			});

			function position() {
				//Let CSS decide position and size when image is hidden (on a small screen)
				if(img.css('display') === 'none') {
					div.css('width', '');
					div.css('height', '');
					div.css('font-size', '');
					div.css('line-height', '');
					return;
				}

				var imgPos = img.position(),
					imgHeight = img.height(),
					divSize = imgHeight * sizeFract;

				div.width(divSize).height(divSize);
				div.css('font-size', divSize * fontSizeFract + 'px');
				div.css('line-height', divSize + 'px');

				//add width if needed
				div.css('left', imgPos.left);
				div.css('top', imgPos.top + imgHeight * yFract);
			}
		}
	};
}])
.directive('messageText', ['chatify', function(chatify) {
	//Regular expression that does the following:
	//Includes the first sentence, 60 characters or line and then proceeds to add 10 more non newline characters
	var CLIP_MESSAGE = /[^.?!\n\r]{1,60}[^\n\r]{0,10}/;

	function clipMessage(message) {
		return message.match(CLIP_MESSAGE)[0];
	}

	return {
		restrict: 'AC',
		link: function(scope, element, attr) {
			scope.$watch(attr.messageText, function(message) {
				var clippedMessage = clipMessage(message);

				element.html(chatify(clippedMessage));

				if(message.length > clippedMessage.length) {
					element.addClass('ellipsis');
				}
			});
		}	
	}
}]);