jr.include('/styles.css');
jr.include('/EditTranslations.css');
jr.include('/Common/lib.js');
var et = {
	init: function() {
		jr.ec( 'div', { parentNode: document.body, className: 'outerContainer', children: [
			{'div': { className: 'centeredContainer', actions: {addListener: et.l.getInitData}}},
			{'div': { className: 'clearer'}}
		]}, et.ce );
		jr.ec( 'div', {parentNode: document.body, contextIdentity: 'popup', className: 'popup', style: {display: 'none'}}, et.ce );
		jr.eventManager.addListener( 'saveTexts', et.l, et.l.saveTexts );
		jr.eventManager.addListener( 'getLanguageTexts', et.l, et.l.getLanguageTexts );
		jr.eventManager.addListener( 'addLanguage', et.l, et.l.addLanguage );
		jr.eventManager.addListener( 'deleteLanguage', et.l, et.l.deleteLanguage );
		jr.eventManager.addListener( 'getUsage', et.l, et.l.getUsage );
		jr.eventManager.addListener( 'deleteText', et.l, et.l.deleteText );
		et.a.getInitData();
	},
	a: { // ajax
		getInitData: function() {jr.ajax( 'Language', 'getInitData', null, 'getInitData' );},
		saveTexts: function(texts, textBoxes) {jr.ajax( 'Language', 'saveTexts', texts, 'saveTexts', textBoxes );},
		getLanguageTexts: function( index ) {jr.ajax( 'Language', 'getLanguageTexts', index, 'getLanguageTexts' );}
	},
	c: { // context
		languages: new Array(),
		textData: new Array(),
		lastCellIndex: null
	},
	ce: { // contextElements
		container: null, saveButton: null, table: null, thead: null, sortRow: null, filterRow: null, tbody: null, popup: null, languageSelect: null, languageDelete: null,
		rows: new Array(),
		textBoxes: new Array()
	},
	r: { // render
		container: function( texts, permissionMask ) {
			jr.ec( 'div', {parentNode: this, contextIdentity: 'container', className: 'container', actions: {clearParent: true}, children: [
				{'div': {className: 'title', children: [
					{'span': {actions: {translate: {innerHTML: 'Edit translations'}}}},
					{'button': {className: 'save', contextIdentity: 'saveButton', onclick: et.ue.saveChanges, actions: {translate: {innerHTML: 'Save'}}}},
					{'select': {className: 'floatRight', contextIdentity: 'languageSelect',
						onchange: function() {
							var ce;
							if( this.selectedIndex == 1 ) {
								ce = {modalContainer: null};
								jr.ec( document.body, {children: [
									{'div': {className: 'modalMainContainer', contextIdentity: 'modalContainer', children: [
										{'div': {className: 'modalBlockContainer'}},
										{'div': {className: 'modalInnerContainer', children: [
											{'div': {className: 'outerModalContainer', children: [
												{'div': {className: 'centeredContainer', children: [
													{'div': {className: 'container', children: [
														{'div': {className: 'title', children: [
															{'span': {actions: {translate: {innerHTML: 'New language'}}}}
														]}},
														{'table': {children: [
															{'tr': {children: [
																{'td': {className: 'first', actions: {translate: {innerHTML: 'Display string:'}}}},
																{'td': {className: 'last', children: [
																	{'input': {type: 'text', contextIdentity: 'displayString'}}
																]}}
															]}},
															{'tr': {children: [
																{'td': {className: 'first', actions: {translate: {innerHTML: 'Language code:'}}}},
																{'td': {className: 'last', children: [
																	{'input': {type: 'text', contextIdentity: 'languageCode'}}
																]}}
															]}}
														]}},
														{'div': {className: 'title', children: [
															{'button': {className: 'save', actions: {translate: {innerHTML: 'Cancel'}}, onclick: function() {jr.remove( ce.modalContainer );}}},
															{'button': {className: 'save', actions: {translate: {innerHTML: 'Add language'}}, 
																onclick: function() {
																	var parameter = ce.languageCode.value+','+ce.displayString.value;
																	jr.remove( ce.modalContainer );
																	jr.ajax( 'Language', 'addLanguage', parameter, 'addLanguage', ce );
																}
															}}
														]}}
													]}}
												]}}
											]}}
										]}}
									]}}
								]}, ce );
							} else if( this.selectedIndex == 2 ) {
								ce = {modalContainer: null};
								jr.ec( document.body, {children: [
									{'div': {className: 'modalMainContainer', contextIdentity: 'modalContainer', children: [
										{'div': {className: 'modalBlockContainer'}},
										{'div': {className: 'modalInnerContainer', children: [
											{'div': {className: 'outerModalContainer', children: [
												{'div': {className: 'centeredContainer', children: [
													{'div': {className: 'container', children: [
														{'div': {className: 'title', children: [
															{'span': {actions: {translate: {innerHTML: 'Delete language'}}}}
														]}},
														{'table': {children: [
															{'tr': {children: [
																{'td': {className: 'first', actions: {translate: {innerHTML: 'Language:'}}}},
																{'td': {className: 'last', children: [
																	{'select': {contextIdentity: 'languageDelete',
																		onchange: function() {}, children: [
																			function( select ) {
																				select.options[0] = new Option( '-', -1, true );
																				select.options[0].disabled = true;
																				jr.foreach( et.c.languages, function( language ) {
																					select.options[select.options.length] = new Option( language.label, language.index, false );
																				} );
																			}
																		]}}
																]}}
															]}},
														]}},
														{'div': {className: 'title', children: [
															{'button': {className: 'save', actions: {translate: {innerHTML: 'Cancel'}}, onclick: function() {jr.remove( ce.modalContainer );}}},
															{'button': {className: 'save', actions: {translate: {innerHTML: 'Delete language'}}, 
																onclick: function() {
																	var parameter = ce.languageDelete.options[ce.languageDelete.selectedIndex].value;
																	jr.remove( ce.modalContainer );
																	jr.ajax( 'Language', 'deleteLanguage', parameter, 'deleteLanguage', parameter );
																}
															}}
														]}}
													]}}
												]}}
											]}}
										]}}
									]}}
								]}, ce );
							}
							else if( this.selectedIndex > 3 ) {
								var option = this.options[ this.selectedIndex ];
								option.disabled = true;
								var value = parseInt( option.value,10 );
								if( value >= 0 )
									et.a.getLanguageTexts( value );
							}
							this.selectedIndex = 0;
						},
						children: [
							function( select ) {
								select.options[0] = jr.ec( new Option(), {actions: {translate: {text: 'Show language'}}, selected: true, value: -1} );
								select.options[1] = jr.ec( new Option(), {disabled: permissionMask & 0x20000 == 0, actions: {translate: {text: 'New language...'}}, selected: false, value: -1} );
								select.options[2] = jr.ec( new Option(), {disabled: permissionMask & 0x20000 == 0, actions: {translate: {text: 'Delete language...'}}, selected: false, value: -1} );
								select.options[3] = new Option( '-', -1, true );
								select.options[3].disabled = true;
								jr.foreach( et.c.languages, function( language ) {
									select.options[select.options.length] = new Option( language.label, language.index, false );
								} );
							}
					]}}
				]}},
				{'div': {className: 'body', children: [
					{'table': {contextIdentity: 'table', children: [
						{'thead': {contextIdentity: 'thead', children: [
							{'tr': {className: 'defaultPointer', contextIdentity: 'sortRow', children: [
								{'td': {className: 'first', children: [ {'span': {actions: {translate: {innerHTML: 'TextId'}}, onclick: et.ue.sort}} ]}},
								{'td': {className: 'last', children: [ {'span': {actions: {translate: {innerHTML: 'InUse'}}, onclick: et.ue.sort}} ]}}
							]}},
							{'tr': {contextIdentity: 'filterRow' ,children: [
								{'td': {className: 'first', children: [ {'input': {type:'text', style: {width: '95%'}, onkeyup: et.ue.filter}} ]}},
								{'td': {className: 'last', innerHTML: '&nbsp;'}}	
							]}}
						]}},
						{'tbody': {contextIdentity: 'tbody', children:[
							function( tbody ) {
								jr.foreach( texts, function( text ) {
									et.c.textData[ text[0] ] = {
										row: jr.ec( 'tr', {parentNode: tbody, addToArray: et.ce.rows, children: [
											{'td': {className: 'first textTop textTopPadding', innerHTML: text[0], assignments: { filterValue: text[0]?text[0].toLowerCase():''}}},
											{'td': {className: 'last centeredText', assignments: { filterValue: text[1].toString() }, children: [
												{'span': {className: text[1] > 0 ? 'textUsed' : 'textUnused', innerHTML: '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
													assignments: {textId: text[0]},
													actions: {
														attachContextMenu: { 
															onActivate: function() {
																if( text[1] == 0 )
																	this.appendOption('Remove text', function( context ) {
																		jr.ajax('Language', 'deleteText', context.textId, 'deleteText', context.parentNode.parentNode );
																	}, this.element );
															}
														}
													},
													onmouseout: function() {et.ce.popup.style.display = 'none';},
													onmousemove: function( e ) {
														if( et.ce.popup.element != this ) {
															et.ce.popup.innerHTML = 'Loading...'; 
															et.ce.popup.element = this;
															if( this.usage )
																this.showUsage.call( this );
															else
																jr.ajax('Language', 'getUsage', this.textId, 'getUsage', this );
														}
														et.im.placePopup( e );
													},
													showUsage: function() {
														et.ce.popup.innerHTML = '';
														jr.foreach( this.usage, function( usage ) {
															jr.ec( 'div', {parentNode: et.ce.popup, innerHTML: usage} );
														} );
													}
												}}
											]}}
										]} )
									};
								} );
							}
						]}}
					]}}
				]}}
			]}, et.ce );
		},
		language: function( language, texts, arrayIndex ) {
			if(language == null) {
				return;
			}
			for( var i = 0, length = et.ce.languageSelect.options.length ; i < length ; i++ ) {
				if( parseInt( et.ce.languageSelect.options[i].value,10 ) == language.index )
					et.ce.languageSelect.options[i].disabled = true;
			}
			var parent = jr.remove( et.ce.table );
			var cellIndex = et.ce.sortRow.cells.length - 1;
			jr.ec( 'td', {parentNode: et.ce.sortRow, cellIndex: cellIndex, children: [ 
				{'span': {innerHTML: language.label, onclick: et.ue.sort}},
				{'span': {style: {fontSize: '10px'}, innerHTML: '&nbsp;('}},
				{'span': {style: {fontSize: '10px'}, actions: {translate: {innerHTML: 'hide'}}, assignments: {languageIndex: language.index},
					onclick: function() {
						var cellIndex = this.parentNode.cellIndex;
						var languageIndex = this.languageIndex;
						jr.foreach( et.ce.thead.rows, function( row ) {
							jr.remove( row.cells[ cellIndex ] );
						} );
						jr.foreach( et.ce.tbody.rows, function( row ) {
							jr.remove( row.cells[ cellIndex ] );
						} );
						for( var i = 0, length = et.ce.languageSelect.options.length ; i < length ; i++ ) {
							if( parseInt( et.ce.languageSelect.options[i].value,10 ) == languageIndex )
								et.ce.languageSelect.options[i].disabled = false;
						}
						var textBoxes = new Array();
						jr.foreach( et.ce.textBoxes, function( textbox ) {
							if( textbox.context.language.index != languageIndex ) {
								textBoxes.push( textbox );
							}
						} );
						et.ce.textBoxes = textBoxes;
					}}},
				{'span': {style: {fontSize: '10px'}, innerHTML: ')'}},
				{'input':{type:'button',language:language,onclick:et.im.exportLanguage,value:jr.translate('Export')}},
				{'input':{type:'button',language:language,onclick:et.im.importLanguage,value:jr.translate('Import')}}
			]} )
			jr.ec( 'td', {parentNode: et.ce.filterRow, cellIndex: cellIndex, children: [ {'input': {type: 'text', style: {width: '95%'}, onkeyup: et.ue.filter}} ]} )
			jr.foreach( texts, function( text ) {
				var value = text[arrayIndex];
				jr.ec( 'td', {parentNode: et.c.textData[ text[0] ].row, cellIndex: cellIndex, assignments: {filterValue: value ? value.toLowerCase() : ''}, children: [
					{'textarea': {rows: 1, addToArray: et.ce.textBoxes, 
						assignments: { context: { originalValue: value, id: text[0], language: language } }, innerHTML: value ? value : '',
							onfocus: function() { 
								et.im.setRows( this, 5 ); 
								this.parentNode.parentNode.cells[0].style.fontWeight = 'bold';
								this.OnMouseMove = this.onmousemove;
								this.onmousemove = null;
								et.ce.popup.style.display = 'none';
							},
							onblur: function() { 
								et.im.setRows( this, 1 ); 
								this.parentNode.parentNode.cells[0].style.fontWeight = null; 
								et.im.setChangedColor(this); 
								this.onmousemove = this.OnMouseMove;
							},
							onmousemove: function( e ) {
								if( this.clientHeight < this.scrollHeight ) {
									et.im.placePopup( e );
									if( et.ce.popup.element != this ) {
										et.ce.popup.element = this;
										et.ce.popup.innerHTML = this.value.replace(/\n/gi, '<br />');
									}
								}
							},
							onmouseout: function() {et.ce.popup.style.display = 'none';},
							actions: {
								attachContextMenu: { 
									onActivate: function() {
										var contextMenu = this;
										contextMenu.element.onblurtemp = contextMenu.element.onblur;
										contextMenu.element.onblur = null;
										var row = contextMenu.element.parentNode.parentNode;
										contextMenu.appendOption('Copy from <b>TextId</b>', function( context ) {
											this.value = context;
										}, row.cells[0].innerHTML );
										for( var i = 1 ; i < row.cells.length - 1 ; i++ ) {
											var textbox = row.cells[ i ].childNodes[ 0 ];
											if( textbox.value.length > 0 )
												contextMenu.appendOption('Copy from <b>' + textbox.context.language.label + '</b>', function( context ) {
													this.value = context;
												}, textbox.value );	
										}
									},
									onClose: function() {
										this.element.focus();
										this.element.onblur = this.element.onblurtemp;
									}
								}
							}
					}}
				]} );
			} );
			parent.appendChild( et.ce.table );
			jr.foreach( et.ce.textBoxes, function( textbox ) {et.im.setChangedColor( textbox );} );
		}
	},
	l: { // listeners
		getInitData: {typeName: 'getInitData',
			method: function( data ) {
				if( data == null )
					document.location = '/Delaval/mvc/Pages/Show/login?url=' + encodeURIComponent( '/Delaval/mvc/Pages/Show/EditTranslations' );
				else {
					et.c.languages = data.languages;
					et.r.container.call( this, data.data, data.permissionMask );
					et.r.language( et.im.getLangauge( data.dataIndex[0] ), data.data, 2 );
					et.r.language( et.im.getLangauge( data.dataIndex[1] ), data.data, 3 );
				}
			}
		},
		saveTexts: function( success, context ) {
			if( success ) {
				jr.remove( context.modalContainer );
				jr.foreach( context.textBoxes, function( textbox ) {
					textbox.context.originalTextbox.context.originalValue = textbox.value;
					textbox.context.originalTextbox.parentNode.filterValue = textbox.value;
					et.im.setChangedColor( textbox.context.originalTextbox );
				} );
			}
		},
		getLanguageTexts: function( textData ) {
			et.r.language( et.im.getLangauge( textData.dataIndex[0] ), textData.data, 1 );
		},
		addLanguage: function( languageIndex, context ) {
			var select = et.ce.languageSelect;
			select.options[select.options.length] = new Option( context.displayString.value, languageIndex, false );
			et.c.languages.push( {
				label: context.displayString.value,
				languageCode: context.languageCode.value,
				index: languageIndex
			} );
			et.a.getLanguageTexts( languageIndex );
		},
		deleteLanguage: function( languageIndex, context ) {
			var select = et.ce.languageSelect;
			var i = -1;
			var j = -1;
			var newOptionArray = Array();
			jr.foreach( select.options, function( option ) {
				i++;
				if(option.index == languageIndex) {
					et.c.languages.splice(i,1);
				} else {
					j++;
					newOptionArray[j] = option;
				}
			} );
			select.options = newOptionArray;
			et.a.getLanguageTexts( languageIndex );
		},
		getUsage: function( texts, element ) {
			element.usage = texts;
			if( et.ce.popup.element == element )
				element.showUsage.call( element );
		},
		deleteText: function( text, row ) {
			jr.remove( row );
			var textBoxes = new Array();
			jr.foreach(et.ce.textBoxes, function( textBox ) {
				if( textBox.context.id != text ) {
					textBoxes.push( textBox );
				}
			});
			et.ce.textBoxes = textBoxes;
		}
	},
	ue: { // userEvents
		filter: function() {
			var cellIndex = this.parentNode.cellIndex;
			var filter = this.value.toLowerCase();
			jr.foreach( et.ce.rows, function( row ) {
				if( ( filter.lenght > 0 ) || ( row.cells[ cellIndex ].filterValue.indexOf(filter) >= 0 ) )
					jr.css.removeClassName(row, 'hidden');
				else
					jr.css.addClassName(row, 'hidden');				
			});
		},
		sort: function() {
			var cellIndex = this.parentNode.cellIndex;
			var parent = jr.remove( et.ce.tbody );
			jr.foreach( et.ce.rows, function( row ) {jr.remove( row );} );
			et.ce.rows.sort(function(r1, r2) {
				var fv1 = r1.cells[cellIndex].filterValue;
				var fv2 = r2.cells[cellIndex].filterValue;
				if( fv1.length > 0 && fv2.length > 0 )
					return (et.c.lastCellIndex == cellIndex ? -1 : 1) * fv1.localeCompare( fv2 );
				else if( ( fv1.length + fv2.length ) == 0 )
					return (et.c.lastCellIndex == cellIndex ? -1 : 1) * r1.cells[0].filterValue.localeCompare( r2.cells[0].filterValue );
				else
					return fv1.length > 0 ? -1 : 1;
			});
			et.c.lastCellIndex = et.c.lastCellIndex == cellIndex ? null : cellIndex;
			jr.foreach( et.ce.rows, function( row ) {et.ce.tbody.appendChild(row);} );
			parent.appendChild( et.ce.tbody );
		},
		saveChanges: function() {
			var ce = {modalContainer: null};
			var height = jQuery(window).height();
			var textBoxes = new Array();
			jr.ec( document.body, {children: [
				{'div': {className: 'modalMainContainer', contextIdentity: 'modalContainer', children: [
					{'div': {className: 'modalBlockContainer'}},
					{'div': {className: 'modalInnerContainer', children: [
						{'div': {className: 'outerModalContainer', children: [
							{'div': {className: 'centeredContainer', children: [
								{'div': {className: 'container', children: [
									{'div': {className: 'title', children: [
										{'span': {actions: {translate: {innerHTML: 'Review changes'}}}}
									]}},
									{'div': {className: 'body', style: {height: ( height - 170 ) + 'px', overflow: 'auto', paddingRight: '20px'}, children: [
										{'table': {children: [
											{'thead': {children: [
												{'tr': {children: [
													{'td': {className: 'first', children: [ {'span': {actions: {translate: {innerHTML: 'TextId'}}}} ]}},
													{'td': {children: [ {'span': {actions: {translate: {innerHTML: 'Existing value'}}}} ]}},
													{'td': {children: [ {'span': {actions: {translate: {innerHTML: 'New value'}}}} ]}},
													{'td': {className: 'last', children: [ {'span': {actions: {translate: {innerHTML: 'Remove'}}}} ]}}
												]}},
											]}},
											{'tbody': {contextIdentity: 'tbody', children: [
												function( tbody ) {
													jr.foreach(et.ce.textBoxes, function(textbox) {
														if( textbox.value != ( textbox.context.originalValue ? textbox.context.originalValue : '' ) ) {
															jr.ec( tbody, {children: [
																{'tr': {children: [
																	{'td': {className: 'first textTop', children: [
																		{'div': {innerHTML: textbox.context.id}},
																		{'hr': {}},
																		{'div': {innerHTML: textbox.context.language.label}}
																	]}},
																	{'td': {children: [ {'textarea': {rows: 5, disabled: true, innerHTML: textbox.context.originalValue ? textbox.context.originalValue : ''}} ]}},
																	{'td': {children: [
																		{'textarea': {rows: 5, addToArray: textBoxes, 
																			assignments: {context: {originalTextbox: textbox}}, innerHTML: textbox.value
																		}}
																	]}},
																	{'td': {className: 'last textTop', children: [
																		{'button': {className: 'save nobr', actions: {translate: {innerHTML: 'Remove from save'}}, 
																			assignments: {arrayIndex: textBoxes.length},
																			onclick: function() {
																				textBoxes.splice( this.arrayIndex, 1 );
																				jr.remove( this.parentNode.parentNode );
																			} 
																		}},
																		{'br': {}},
																		{'button': {className: 'save nobr', actions: {translate: {innerHTML: 'Revert change'}}, 
																			assignments: {arrayIndex: textBoxes.length},
																			onclick: function() {
																				var originalTextbox = textBoxes[ this.arrayIndex ].context.originalTextbox;
																				originalTextbox.value = originalTextbox.context.originalValue;
																				et.im.setChangedColor( originalTextbox );
																				textBoxes.splice( this.arrayIndex, 1 );
																				jr.remove( this.parentNode.parentNode );
																			} 
																		}}
																	]}}
																]}}
															]} );
														}
													} );
												}																
											]}}
										]}}
									]}},
									{'div': {className: 'title', children: [
										{'button': {className: 'save', actions: {translate: {innerHTML: 'Cancel'}}, onclick: function() {jr.remove( ce.modalContainer );}}},
										{'button': {className: 'save', actions: {translate: {innerHTML: 'Save changes'}}, onclick: function() {
											var changedValues = new Array();
											jr.foreach(textBoxes, function(textbox) {
												if( textbox.value != ( textbox.context.originalTextbox.context.originalValue ? textbox.context.originalTextbox.context.originalValue : '' ) ) {
													changedValues.push({
														index: textbox.context.originalTextbox.context.language.index,
														id: textbox.context.originalTextbox.context.id,
														text: textbox.value
													});
												}
											});
											et.a.saveTexts(changedValues, {textBoxes: textBoxes, modalContainer: ce.modalContainer} );			
										}}},
									]}}
								]}}		
							]}}
						]}},
						{'div': {className: 'clearer'}}
					]}}
				]}}
			]}, ce );
		},
		chooseFile: function(language) {
			var ce = {modalContainer: null};
			jr.ec( document.body, {children: [
				{'div': {className: 'modalMainContainer', contextIdentity: 'modalContainer', children: [
					{'div': {className: 'modalBlockContainer'}},
					{'div': {className: 'modalInnerContainer', children: [
						{'div': {className: 'outerModalContainer', children: [
							{'div': {className: 'centeredContainer', children: [
								{'div': {className: 'container', children: [
									{'div': {className: 'title', children: [
										{'span': {actions: {translate: {innerHTML: 'Choose File (' + language.languageCode + ')'}}}}
									]}},
									{'div': {className: 'body', style: {overflow: 'auto', paddingRight: '20px'}, children: [
										{'table': {children: [
											{'tbody': {contextIdentity: 'tbody', children: [
												{'tr': {children: [
													{'td': {className: 'first last', children: [ 
														{'input':{type:'file',id:'importLanguageFile',name:'file', style: {width: '500px'}}},
													]}},
												]}},
											]}},
										]}},
									]}},
									{'div': {className: 'title', children: [
										{'button': {className: 'save', actions: {translate: {innerHTML: 'Cancel'}}, onclick: function() {jr.remove( ce.modalContainer );}}},
										{'button': {className: 'save', actions: {translate: {innerHTML: 'Import'}}, onclick: function() {
													et.im.importLanguageImpl(language);
													jr.remove( ce.modalContainer );
												}
										}},
									]}}
								]}}		
							]}}
						]}},
						{'div': {className: 'clearer'}}
					]}}
				]}}
			]}, ce );
		}
	},
	im: { // internalMethods
		getLangauge: function( index ) {
			for( var i in et.c.languages )
				if( et.c.languages[i].index == index )
					return et.c.languages[i];
			return null;
		},
		setRows: function(textarea, count) {
			var row = textarea.parentNode.parentNode;
			for( var i = 1 ; i < row.cells.length - 1 ; i++ )
				row.cells[i].childNodes[0].rows = count;
		},
		setChangedColor: function( textbox ) {
			var unChanged = ( textbox.value == ( textbox.context.originalValue ? textbox.context.originalValue : '' ) );
			if( textbox.clientHeight < textbox.scrollHeight )
				textbox.style.backgroundColor = unChanged ? 'lightgray' : '#ff9999';
			else
				textbox.style.backgroundColor = unChanged ? 'white' : '#ffdddd';
		},
		placePopup: function( e ) {
			et.ce.popup.style.display = 'inline';
			et.ce.popup.style.top = ( e.pageY + 10 ) + 'px';
			var left = e.pageX + 15;
			var width = jQuery(window).width();
			if( width < left + et.ce.popup.offsetWidth ) {
				left = e.pageX - et.ce.popup.offsetWidth - 2;
			}
			et.ce.popup.style.left = left + 'px';
		},
		exportLanguage: function() {
			self.location="/ExportLanguage.vcx";
			var form = document.createElement("form");
			form.setAttribute("method", 'post');
			form.setAttribute("action", '/ExportLanguage.vcx');

			var hiddenField = document.createElement("input");
			hiddenField.setAttribute("type", "hidden");
			hiddenField.setAttribute("name", 'languageCode');
			hiddenField.setAttribute("value", this.language.languageCode);
			form.appendChild(hiddenField);
			document.body.appendChild(form);
			form.submit();
		},
		importLanguage: function() {
			et.ue.chooseFile(this.language)
		},
		importLanguageImpl: function(language) {
			var form = document.createElement("form");
			form.setAttribute("method", 'post');
			form.setAttribute("action", '/ImportLanguage.vcx');
			form.setAttribute("enctype", 'multipart/form-data');

			var hiddenField = document.createElement("input");
			hiddenField.setAttribute("type", "hidden");
			hiddenField.setAttribute("name", 'languageCode');
			hiddenField.setAttribute("value", language.languageCode);
			form.appendChild(hiddenField);
			form.appendChild($('#importLanguageFile')[0]);
	//		self.location="/ImportLanguage.vcx";
			document.body.appendChild(form);
			form.submit();
		}
	}
};
jr.init(et.init);