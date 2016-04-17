'use strict';

jr.include('css/chat.css');

angular.module('chat', ['j$', 'util', 'myfarm', 'translate', 'pageVisible'])
.factory('chat.getMessageIndex', ['util.findIndex', function(findIndex) {
	return function(messages, id) {
		return findIndex(messages, function(test) {
			return test.id === id;
		});
	};
}])
.factory('chat.extractData', ['myfarm.cacheByFarm', '$filter', function(cacheByFarm, $filter) {
	var orderBy = $filter('orderBy');
	return cacheByFarm('chat.extractData', function(data) {
		return data.messages
			? $.extend(data.messages, {list: orderBy(data.messages.list, '-time')})
			: {list: []};
	});
}])
// .factory('chat.data', ['myfarm.cacheByFarm', 'chat.extractData', '$q',
// 	function(cacheByFarm, extractData, $q) {
// 		return cacheByFarm('chat.data', function(data) {
// 			return data.then(function(serializedData) {
// 				var data = extractData(serializedData);
// 				if(data) return data;
// 				else return $q.reject();
// 			});
// 		});
// 	}
// ])
.factory('chat.socket', ['onBroadcast', 'chat.extractData', 'chat.getMessageIndex', '$rootScope', '$filter',
	function(onBroadcast, extractData, getMessageIndex, $rootScope, $filter) {
		var updates = [], data, currentId, messages, orderBy = $filter('orderBy');

		function updateData(update) {
			var index;
			if(update.isDeleted) {
				index = getMessageIndex(messages, update.id);
				messages.splice(index, 1);
			} else if(update.isChanged) {
				index = getMessageIndex(messages, update.id);
				messages[index] = update;
			} else if(update.isNew) {
				messages.push(update);
			}

			//Sort messages
			data.list = orderBy(messages, '-time');
		}

		return {
			listen: function(id) {
				onBroadcast(id, 'chat', function(update) {
					if(id !== currentId) return; //Ignore updates from previous farms

					if(data) {
						updateData(update);
						$rootScope.$broadcast('chat.update', data);
					} else {
						updates.push(update);
					}
				});
			},
			run: function(id, serializedData) {
				currentId = id;
				data = extractData(serializedData);
				messages = data.list;
				while(updates.length > 0) {
					updateData(updates.pop());
				}
			}
		}
	}
])
.controller('chatController', ['$scope', 'data', 'chat.readMessages', 'pageVisible', '$timeout', 'util.getTime', 'isMessageUnread',
	function($scope, data, readMessages, pageVisible, $timeout, getTime, isMessageUnread) {
		$scope.data = data;
		updateRead();

		$scope.$on('chat.update', function(event, data) {
			$scope.$apply(function() {
				pageVisible.then(updateRead);
			});
		});

		$scope.$on('messageEdited', function() {
			$scope.selectedMessage = null;
		});

		$scope.select = function(message) {
			$scope.selectedMessage = message === $scope.selectedMessage ? null : message;
			$scope.$broadcast('editMessage', $scope.selectedMessage);
		};

		$scope.isMessageUnread = function(message) {
			return isMessageUnread(message, $scope.data);
		};

		function updateRead() {
			readMessages();
			$timeout(updateTime, 2000);
		}
		function updateTime() {
			//Use the same time as the last message
			if($scope.data.list.length > 0) {
				data.lastReadTime = $scope.data.list[0].time;
			}
		}
	}
])
.factory('chat.sendMessage', ['sendRequest', 'farmId', function(sendRequest, getId) {
	return function(message) {
		sendRequest('SrvChat.addMessage', {
			vcId: getId(),
			text: message
		});
	}
}])
.factory('chat.editMessage', ['sendRequest', 'farmId', function(sendRequest, getId) {
	return function(id, message) {
		sendRequest('SrvChat.changeMessage', {
			vcId: getId(),
			id: id,
			text: message
		});
	}
}])
.factory('chat.deleteMessage', ['sendRequest', 'farmId', function(sendRequest, getId) {
	return function(id) {
		sendRequest('SrvChat.deleteMessage', {
			vcId: getId(),
			id: id
		});
	}
}])
.factory('chat.readMessages', ['sendRequest', 'farmId', function(sendRequest, getId) {
	return function() {
		sendRequest('SrvMyFarm.hasReadMessages', getId());
	}
}])
.factory('isMessageUnread', [function() {
	return function(message, data) {
		return message.time > data.lastReadTime && message.fromId !== data.userId;
	}	
}])
.controller('chat.composeController', ['$scope', 'chat.sendMessage', 'chat.editMessage', 'chat.deleteMessage',
	function($scope, sendMessage, editMessage, deleteMessage) {

		var originalMessage, emptyMessage = {text: ''};
		function setMessage(message) {
			originalMessage = message;
			$scope.message = message.text;
			$scope.id = message.id;

			//id is undefined (falsey) when not editing
			$scope.editing = !!message.id;
		}
		setMessage(emptyMessage);

		$scope.$on('editMessage', function(event, message) {
			setMessage(message || emptyMessage)
		});

		$scope.changed = function() {
			return $scope.message === originalMessage.text;
		};
		$scope.send = function() {
			if($scope.message) {
				if($scope.editing) {
					editMessage($scope.id, $scope.message);
					$scope.$emit('messageEdited');
				} else {
					sendMessage($scope.message);
				}
			}
			setMessage(emptyMessage);
		};
		$scope.delete = function() {
			deleteMessage($scope.id);
			setMessage(emptyMessage);
		}

	}
])
.controller('chat.emojiController', ['$scope', 'emojiList', function($scope, emojiList) {
	$scope.emojiList = emojiList;
	$scope.showEmojis = false;

	$scope.insertEmoji = function(emoji) {
		$scope.$parent.message = $scope.insert(emoji);
		$scope.showEmojis = false;
	};
	$scope.toggleEmojis = function() {
		$scope.showEmojis = !$scope.showEmojis;
	};
	$scope.hideEmojis = function() {
		$scope.showEmojis = false;
	};
}])
	.factory('cowify', ['$rootScope', 'util.format', 'util.findIndex', '$log', function($rootScope, createFormat, findIndex, $log) {
		var linkFormat = createFormat('<a href="#/cowq/cow/{0}">{0}</a>');
		return function(string) {
			var cows = $rootScope.data.cows.cows;
			return string.replace(/\d+/g, function(number) {
				if(!cows) { return number; }
				
				var existingCow = cows.filter(function(cow) {
					return cow.nr == number;
				}).length > 0;
				return existingCow ? linkFormat.render(number) : number;
			});
		}
	}])
	.factory('chatify', ['escapeHtml', 'emojify', 'cowify', function(escapeHtml, emojify, cowify) {
		return function(string) {
			var pipe = [escapeHtml, emojify, cowify];
			//Run string through pipe
			return pipe.reduce(function(string, fn) {
				return fn(string);
			}, string);
		}
	}])
	.directive('chatify', ['chatify', function(chatify) {
		return {
			restrict: 'AC',
			link: function(scope, element, attr) {
				scope.$watch(attr.chatify, function(value) {
					element.html(chatify(value));
				});
			}
		};
	}]);