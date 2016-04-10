(function(undefined) {
	var exports = myfarm.settings = {};

	function deSerilz(data) {
		var i, l, phone;
		if(data.phones) {
			for(i = 0, l = data.phones.length; i < l; i++) {
				phone = data.phones[i];
				phone.created = new Date(phone.cre).printiso();
			}
		}
		data.lang = jr.me.lcid;

		data.notify = data.notify || [];

		var currentFarmExists = data.notify.some(function(entry) {
			return entry.domainId === data.vcId;
		});

		if(!currentFarmExists) {
			data.notify.push({
				domainId: data.vcId,
				domainName: data.vcName,
				notifyFarmData: {}
			});
		}

		data.notify.sort(function(a, b) {
			if(a.domainId === data.vcId) return -1;
			if(b.domainId === data.vcId) return 1;
			return a.domainName.localeCompare(b.domainName);
		});

		if(data.phones) {
			j$.sort(data.phones, j$.alphabeticalSort, function(entry) {
				return entry.name;
			});
		}

		return data;
	}

	function showSaveState(saveButton, className) {
		saveButton.addClass('showstate');
		saveButton.addClass(className);
		window.setTimeout(function() {
			saveButton.removeClass('showstate');
			saveButton.removeClass(className);
		}, 3000)
	}

	function verifyPassword(oldPassword, newPassword, verifyPassword, id) {
		var problem = checkPassword(newPassword),
			oldCorrect = jr.me.pwd == getHashCode(id + oldPassword),
			newCorrect = problem.length < 1 && newPassword !== oldPassword,
			verifyCorrect = newCorrect && verifyPassword === newPassword,
			correct = oldCorrect && newCorrect && verifyCorrect;

		return {
			oldCorrect: oldCorrect,
			newCorrect: newCorrect,
			verifyCorrect: verifyCorrect,
			problem: problem.length > 0,
			problemText: problem.join('<br>'),
			password: correct ? getHashCode(id + newPassword) : 0 
		}
	}

	function getData($elements) {
		var data = {};
		$elements.each(function() {
			var $this = $(this);
			data[$this.data('prop')] = 
				$this.is('[type="checkbox"]')
					? $this.prop('checked')
					: $this.val().trim();
		})
		return data;
	}

	function dataChanged(oldData, newData) {
		for(var key in oldData) {
			if(oldData[key] != newData[key]) return true;
		}
	}

	function reset($elements, data) {
		$elements.each(function() {
			var $this = $(this), val = data[$this.data('prop')];

			if($this.is('[type="checkbox"]'))
				$this.prop('checked', val);
			else $this.val(val);

			$this.trigger('reset');
		});
	}

	function parseFormData(formData) {
		var ret = {}, key, prevNode, lastIndex, path, i, prop, node;

		for(key in formData) {
			prevNode = ret, path = key.split('.'); lastIndex = path.length - 1;
			for(i = 0; i < path.length; i++) {
				prop = path[i]

				if(prevNode[prop]) {
					prevNode = prevNode[prop];
					continue;
				}

				node = i < lastIndex
					? $.isNumeric(path[i + 1]) ? [] : {}
					: formData[key];

				prevNode[prop] = node;

				prevNode = node;
			}
		}

		return ret;
	}

	function save(oldData, formData) {
		var sendData = parseFormData(formData);

		console.log(sendData);

		return j$.sendRequest('SrvUser.saveUserSettings', JSON.stringify(sendData))
		.then(function(data) {
			var deferred = new $.Deferred();

			if(data) deferred.resolve(data);
			else deferred.reject();

			return deferred.promise();
		})
		.then(deSerilz);
	}

	function render(data, container, template, previousState, showSuccess) {
		console.log(data);
		container.html(template(data));

		var $settings = container.find('#settings');

		var saveButton = $settings.find('.big-button.save'), 
			resetButton = $settings.find('.big-button.reset');

		function toggleSave(save) {
			saveButton.prop('disabled', !save);
		}

		function toggleReset(reset) {
			resetButton.prop('disabled', !reset);
		}

		if(showSuccess) showSaveState(saveButton, 'success');

		var holders = $settings.find('[data-prop]'),
			dataHolders = holders.not('[data-extra]'),
			originalState, originalData;

		function formChanged() {
			toggleReset(dataChanged(originalState, getData(holders)));
			toggleSave(dataChanged(originalData, getData(dataHolders)));
		}

		holders.on('input', formChanged).on('change', formChanged);

		originalState = getData(holders);
		originalData = getData(dataHolders);

		$settings.find('.big-button.back').click(function() {
			history.back();
		});

		$settings.find('.buttons .reset').click(function() {
			toggleReset(false);
			toggleSave(false);
			reset(holders, originalState);
		});

		$settings.find('.buttons .save').click(function() {
			save(data, getData(dataHolders))
			.done(function(data) {
				render(data, container, template, null, true);
			})
			.fail(function() {
				showSaveState(saveButton, 'error');
			});
		});

		$settings.find('.password-controller').controller(function() {
			var input = this.find('[data-prop="pwd"]'),
				checks = this.find('.check'),

				oldField = this.find('.field.old'),
				oldInput = oldField.find('input'),
				oldCheck = oldField.find('.check'),

				newField = this.find('.field.new'),
				newInput = newField.find('input'),
				newCheck = newField.find('.check'),

				verifyField = this.find('.field.verify'),
				verifyInput = verifyField.find('input'),
				verifyCheck = verifyField.find('.check'),

				verifyContainer = this.find('.verify-container'),
				passwordProblem = this.find('.password-problem'),

				userInputs = this.find('input[type="password"]');

			function onInput(changed) {
				var oldVal = oldInput.val(),
					newVal = newInput.val(),
					verifyVal = verifyInput.val();

				var verification = verifyPassword(
					oldVal,
					newVal,
					verifyVal,
					data.id
				);

				checks.toggleClass('hidden', !oldVal && !newVal && !verifyVal); //hide if all empty

				oldField.toggleClass('correct', verification.oldCorrect);
				newField.toggleClass('correct', verification.newCorrect);
				verifyField.toggleClass('correct', verification.verifyCorrect);

				passwordProblem.html(verification.problemText);
				passwordProblem.toggleClass('hidden', !verification.problem); //hide if no problem

				input.val(verification.password);

				if(changed) formChanged();
			}

			function toggleVerification() {
				if(newInput.val().trim()) { // if not emty
					if(verifyContainer.hasClass('hidden')) {
						verifyInput.val(''); //clear and show
						verifyContainer.removeClass('hidden');
					}
				} else {
					verifyContainer.addClass('hidden');
				}
			}

			userInputs.on('input', onInput);

			newInput.on('input', toggleVerification);

			userInputs.on('reset', function() {
				toggleVerification();
				onInput();
			});
		});

		$settings.find('select.language').change(function() {
			var language = this.value;
			jr.setStorage('lcid', language);

			j$.sendRequest('SrvUser.saveUserLanguage', language);
			j$.sendRequest('SrvLanguage.newPageTranslation', {
				page: jr.pageName?jr.pageName:location.pathname,
				text: language
			}).then(function(translations) {
				jr.translations = translations;
				if(window.android && android.setTranslation) {
					android.setTranslation(
						jr.translate('MyFarm'),
						jr.translate('AppStartupText'),
						jr.translate('AppConnectionErrorText'),
						jr.translate('AppConnectionErrorButton')
					);
				}
				data.lang = language;
				render(data, container, template, getData(holders));
			});
		});

		$settings.find('.timepicker-controller').each(function() {
			var $this = $(this),
				input = $this.find('input[type="hidden"]'),
				selects = $this.find('select'),
				hours = $this.find('.timepicker.hours'),
				minutes = $this.find('.timepicker.minutes');

			function set(milliseconds) {
				var m = milliseconds / 1000 / 60, h = Math.floor(m / 60);

				hours.val(h);
				minutes.val(m - h * 60);
			}

			function get(hours, minutes) {
				return hours * 3600000 + minutes * 60000;
			}

			input.on('reset', function() {
				val = input.val();
				set(val > 0 ? val : input.data('default-value'));
			});

			selects.change(function() {
				input.val(get(+hours.val(), +minutes.val()));
				formChanged();
			});
		});

		$settings.find('[data-prop="deviceNotifications.useQuietTime"]').controller(function($this) {
			function setQuietTime() {
				$settings.toggleClass('use-quiet-time', $this.prop('checked'));		
			}

			$this.change(setQuietTime).on('reset', setQuietTime);
		})

		$settings.find('.device-controller').each(function() {
			var $this = $(this),
				id = $this.find('input.id').val(),
				deleteInput = $this.find('input.delete'),
				nameInput = $this.find('input.name'),
				deleteButton = $this.find('.button.delete'),
				testButton = $this.find('.button.test'),
				texts = {del: jr.translate('Delete'), undo: jr.translate('Undelete')};

			function toggleDelete(del) {
				$this.toggleClass('delete', del);
				deleteButton.toggleClass('success', del);
				nameInput.prop('disabled', del);
				testButton.prop('disabled', del);

				deleteButton.text(del ? texts.undo : texts.del);
			}

			deleteButton.click(function() {
				var isDeleting = deleteInput.val() === 'false'; // convert to boolean and invert 
				deleteInput.val(isDeleting);
				toggleDelete(isDeleting);
				formChanged();
			});

			deleteInput.on('reset', function(val) {
				toggleDelete(deleteInput.val() === 'true'); // convert to boolean
			});

			testButton.click(function() {
				j$.sendRequest('SrvUser.testSend', id).then(function(success) {
					if(success) alert('Test send was successful!');
					else alert('Test send failed!');
				});
			});
		})


		if(previousState) {
			reset(holders, previousState);
			formChanged();
		} else {
			holders.trigger('reset');
		}
	}

	function getHashCode(s){var h=0,i=-1;while(++i<s.length){h=((h<<5)-h)+s.charCodeAt(i);h=h&h;}return h;}

	exports.run = function() {
		$.when(
			$.when(
				j$.sendRequest('SrvUser.getMyUser', null),
				j$.include('js/util.js')
			).then(deSerilz),
			myfarm.container,
			j$.getTemplate('jr-settings.html'),
			j$.include('css/jr-settings.css'),
			j$.include('css/jr-verset.css')
		).then(render);
	};
})();