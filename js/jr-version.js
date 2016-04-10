(function() {
	var exports = myfarm.version = {};

	function deSerilz(data) {
		var i, ii, l, ll, deSerilzed, sd, vms, d, v;

		if(data.ddm) {
			for(i = 0, l = data.ddm.length; i < l; i++) {
				d = data.ddm[i].ver;
				j$.sort(d, j$.numericalSort, function(entry) {
					return entry.time;
				}, true);

				for(ii = 0, ll = d.length; ii < ll; ii++) {
					deSerilzed = {time: new Date(d[ii].time).printiso(), entries: []};
					sd = new JsSerilz('$', d[ii].value);
					while(sd.hasMore())
						deSerilzed.entries.push({key: sd.getString(), value: sd.getString()});

					d[ii] = deSerilzed;
				}

			}

			j$.sort(data.ddm, j$.alphabeticalSort, function(entry) {
				return entry.id;
			});
		}

		if(data.vms) {
			for(i = 0, l = data.vms.length; i < l; i++) {
				vms = data.vms[i].ver;
				j$.sort(vms, j$.numericalSort, function(entry) {
					return entry.time;
				}, true);

				for(ii = 0, ll = vms.length; ii < ll; ii++) {
					deSerilzed = {time: new Date(vms[ii].time).printiso(), entries: []};
					sd = new JsSerilz('$', vms[ii].value);
					while(sd.hasMore()) deSerilzed.entries.push(sd.getString());

					vms[ii] = deSerilzed;
				}
			}

			j$.sort(data.vms, j$.alphabeticalSort, function(entry) {
				return entry.name;
			});
		}

		return data;
	}

	exports.run = function() {
		$.when(
			$.when(
				j$.sendRequest('SrvVersion.getVersions', jr.id),
				j$.include('js/util.js')
			).then(deSerilz),
			myfarm.container,
			j$.getTemplate('jr-version.html'),
			j$.getTemplate('version/ddm.html'),
			j$.getTemplate('version/vms.html'),
			j$.include('css/jr-version.css'),
			j$.include('css/jr-verset.css')
		).then(function(data, container, template, ddm, vms) {
			console.log(data);
			container.html(template(data));

			var $version = container.find('#version');

			$version.find('button.back').click(function() {
				history.back();
			});

			$version.find('.ddm.section').each(function(i) {
				var $this = $(this), $content = $this.find('.content');

				$content.html(ddm(data.ddm[i].ver[0]));
				$this.find('select').change(function() {
					$content.html(ddm(data.ddm[i].ver[this.selectedIndex]));
				});
			});

			$version.find('.vms.section').each(function(i) {
				var $this = $(this), $body = $this.find('.container');

				$body.html(vms(data.vms[i].ver[0]));
				$this.find('select').change(function() {
					$body.html(vms(data.vms[i].ver[this.selectedIndex]));
				});
			});

			$version.find('.section.expandable').each(function(i) {
				var $this = $(this);
				$this.find('.target').click(function() {
					$this.toggleClass('expanded');
				});
			});
		});
	};
})();