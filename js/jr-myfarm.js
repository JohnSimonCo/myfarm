j$.include('css/jr-myfarm.css');

(function() {
	var myfarm = {};

	myfarm.container = j$.getTemplate('jr-myfarm.html').then(function(template) {
		$('body').html(template());
		return $('#container');
	});
	
	j$.finished.then(function() {
		j$.route('/', function(req, next) {
			if(next) next();
			else {
				$.when(
					myfarm.container,
					j$.getTemplate('myfarm/index.html')
				).then(function(container, template) {
					container.html(template());
				});
			}
		})
		.route('/version', function(req, next) {
			j$.include('js/jr-version.js').then(function() {
				myfarm.version.run();
			});
		})
		.route('/settings', function(req, next) {
			j$.include('js/jr-settings.js').then(function() {
				myfarm.settings.run();
			});
		})
		.run();
	});

	window.myfarm = myfarm;
})();