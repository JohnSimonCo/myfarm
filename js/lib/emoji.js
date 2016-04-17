'use strict';

jr.include('/jr-myfarm/js/lib/escape-html.js');

angular.module('emoji', ['util', 'escapeHtml'])
.factory('emojies', ['util.escapeRegex', 'escapeHtml', 'util.format', function(escapeRegex, escapeHtml, createFormat) {
	var emojiFormat = createFormat('<img src="{0}" title="{1}" alt="{2}" class="emoji">');

	return angular.forEach([
		{
			match: [':)', ':-)'],
			to: {
				src: '/Resources/emoji/happy.png',
				title: 'Happy'
			}
		},
			{
			match: [':(', ':-('],
			to: {
				src: '/Resources/emoji/sad.png',
				title: 'Sad'
			}
		},
			{
			match: [':D', ':-D'],
			to: {
				src: '/Resources/emoji/bigsmile.png',
				title: 'Big smile'
			}
		},
		{
			match: [':o', ':-o'],
			to: {
				src: '/Resources/emoji/o.png',
				title: 'Surprised'
			}
		},
		{
			match: [';)', ';-)'],
			to: {
				src: '/Resources/emoji/wink.png',
				title: 'Wink'
			}
		},
			{
			match: [':p', ':-p'],
			to: {
				src: '/Resources/emoji/tongue.png',
				title: 'Tongue out'
			}
		},
			{
			match: ['x)', 'xd'],
			to: {
				src: '/Resources/emoji/x).png',
				title: 'X smiley'
			}
		},
			{
			match: [':*'],
			to: {
				src: '/Resources/emoji/inlove.png',
				title: 'Kiss'
			}
		},
		{
			match: [':|'],
			to: {
				src: '/Resources/emoji/neutral.png',
				title: 'Neutral'
			}
		},
		{
			match: [':[]'],
			to: {
				src: '/Resources/emoji/square-mouth.png',
				title: 'Square mouth'
			}
		},
		{
			match: [";'(", ":'("],
			to: {
				src: '/Resources/emoji/crying.png',
				title: 'Crying'
			}
		},
			{
			match: ['(lamp)'],
			to: {
				src: '/Resources/emoji/lamp.png',
				title: 'Lamp'
			}
		},
			{
			match: ['(sun)'],
			to: {
				src: '/Resources/emoji/sun.png',
				title: 'Sun'
			}
		},
			{
			match: ['(moon)'],
			to: {
				src: '/Resources/emoji/moon.png',
				title: 'Moon'
			}
		},
			{
			match: ['(time)'],
			to: {
				src: '/Resources/emoji/time.png',
				title: 'Time'
			}
		},
			{
			match: ['<3', '(heart)'],
			to: {
				src: '/Resources/emoji/heart.png',
				title: 'Heart'
			}
		},
			{
			match: ['(star)', '(yellow star)'],
			to: {
				src: '/Resources/emoji/yellow-star.png',
				title: 'Yellow star'
			}
		},
			{
			match: ['(blue star)'],
			to: {
				src: '/Resources/emoji/blue-star.png',
				title: 'Blue star'
			}
		},
		{
			match: ['(green star)'],
			to: {
				src: '/Resources/emoji/green-star.png',
				title: 'Green star'
			}
		},
		{
			match: ['(red star)'],
			to: {
				src: '/Resources/emoji/red-star.png',
				title: 'Red star'
			}
		},
		{
			match: ['(milk full)'],
			to: {
				src: '/Resources/emoji/milk-full.png',
				title: 'Milk full'
			}
		},
		{
			match: ['(milk empty)'],
			to: {
				src: '/Resources/emoji/milk-empty.png',
				title: 'Milk empty'
			}
		},
		{
			match: ['(milking)'],
			to: {
				src: '/Resources/emoji/milking.png',
				title: 'Milking'
			}
		},
		{
			match: ['(udder)'],
			to: {
				src: '/Resources/emoji/udder.png',
				title: 'Udder'
			}
		},
		{
			match: ['(vaccine)'],
			to: {
				src: '/Resources/emoji/vaccine.png',
				title: 'Vaccine'
			}
		},
		{
			match: ['(flag)'],
			to: {
				src: '/Resources/emoji/flag.png',
				title: 'Flag'
			}
		},
		{
			match: ['(heat)'],
			to: {
				src: '/Resources/emoji/heat.png',
				title: 'Heat'
			}
		},
		{
			match: ['(calf)'],
			to: {
				src: '/Resources/emoji/calf.png',
				title: 'Calf'
			}
		},
		{
			match: ['(cow)'],
			to: {
				src: '/Resources/emoji/cow.png',
				title: 'Cow'
			}
		},
		{
			match: ['(cows)'],
			to: {
				src: '/Resources/emoji/cows.png',
				title: 'Cows'
			}
		},
		{
			match: ['(delete cow)'],
			to: {
				src: '/Resources/emoji/delete-cow.png',
				title: 'Delete cow'
			}
		},
		{
			match: ['(feed)'],
			to: {
				src: '/Resources/emoji/feed.png',
				title: 'Feed'
			}
		},
		{
			match: ['(picture)'],
			to: {
				src: '/Resources/emoji/picture.png',
				title: 'Picture'
			}
		},
		{
			match: ['(health)'],
			to: {
				src: '/Resources/emoji/health.png',
				title: 'Health'
			}
		},
		{
			match: ['(bcs)'],
			to: {
				src: '/Resources/emoji/bcs.png',
				title: 'BCS'
			}
		},
		{
			match: ['(fire)'],
			to: {
				src: '/Resources/emoji/fire.png',
				title: 'Fire'
			}
		},
		{
			match: ['(tap)'],
			to: {
				src: '/Resources/emoji/tap.png',
				title: 'Tap'
			}
		},
		{
			match: ['(examine)'],
			to: {
				src: '/Resources/emoji/examine.png',
				title: 'Examine'
			}
		},
		{
			match: ['(list)'],
			to: {
				src: '/Resources/emoji/list.png',
				title: 'List'
			}
		},
		{
			match: ['(notification)'],
			to: {
				src: '/Resources/emoji/notification.png',
				title: 'Notification'
			}
		},
		{
			match: ['(message)'],
			to: {
				src: '/Resources/emoji/message.png',
				title: 'Message'
			}
		},
		{
			match: ['(farm)'],
			to: {
				src: '/Resources/emoji/farm.png',
				title: 'Farm'
			}
		},
		{
			match: ['(fan)'],
			to: {
				src: '/Resources/emoji/fan.png',
				title: 'Fan'
			}
		},
		{
			match: ['(dump milk)'],
			to: {
				src: '/Resources/emoji/dump-milk.png',
				title: 'Dump milk'
			}
		},
		{
			match: ['(tank)'],
			to: {
				src: '/Resources/emoji/tank.png',
				title: 'Tank'
			}
		},
		{
			match: ['(auto)'],
			to: {
				src: '/Resources/emoji/auto.png',
				title: 'Auto'
			}
		},
		{
			match: ['(semen)'],
			to: {
				src: '/Resources/emoji/semen.png',
				title: 'Semen'
			}
		},
		{
			match: ['(service)'],
			to: {
				src: '/Resources/emoji/service.png',
				title: 'Service'
			}
		},
		{
			match: ['(temp)'],
			to: {
				src: '/Resources/emoji/temp.png',
				title: 'Temp'
			}
		},
		{
			match: ['(manual)'],
			to: {
				src: '/Resources/emoji/manual.png',
				title: 'Manual'
			}
		}
	],
	function(emoji) {
		emoji.to.alt = emoji.match[0];
		emoji.generated = emojiFormat.render(emoji.to.src, emoji.to.title, emoji.to.alt);
		emoji.match = emoji.match.map(function(match) {
			return new RegExp(escapeRegex(escapeHtml(match)), 'ig');
		});
	});
}])
.factory('emojify', ['emojies', function(emojies) {
	return function(string) {
		angular.forEach(emojies, function(emoji) {
			angular.forEach(emoji.match, function(match) {
				string = string.replace(match, emoji.generated);
			});
		});

		return string;
	};
}])
.directive('emojify', ['emojify', function(emojify) {
	return {
		restrict: 'AC',
		link: function(scope, element, attr) {
			scope.$watch(attr.emojify, function(value) {
				element.html(emojify(value));
			});
		}
	};
}])
.factory('emojiList', ['emojies', function(emojies) {
	return emojies.map(function(emoji) {
		return emoji.to;
	});
}]);