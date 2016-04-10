jr.lib.contextMenu = {
	init: function() {
		jr.ecActions.add( 'attachContextMenu', jr.lib.contextMenu.create );
	},
	create: function( context, parameters ) {
		new jr.lib.contextMenu.ContextMenu( context.element, parameters.onActivate, parameters.onClose );
	},
	ContextMenu: function( element, onActivate, onClose ) {
		this.element = element;
		this.onActivate = onActivate;
		this.onClose = onClose;
		element.contextMenu = this;
		element.oncontextmenu = function( e ) {
			var mousePosition = jr.lib.calculate.mousePosition( e );
			this.contextMenu.contextElements = {};
			jr.ec( 'div', { parentNode: document.body, contextIdentity: 'div', children: [
				{ 'div': { className: 'blockDiv', 
					assignments: { contextMenu: this.contextMenu },
					onmousedown: function() { if( this.contextMenu.onClose ) this.contextMenu.onClose.call( this.contextMenu ); jr.remove( this.parentNode ); return false; },
					ononcontextmenu: function() { return this.onmousedown(); }
				} },
				{ 'div': { className: 'contextMenu', contextIdentity: 'container',  style: {
					top: mousePosition.y + 'px',
					left: mousePosition.x + 'px'
				} } }
			] }, this.contextMenu.contextElements );
			this.contextMenu.onActivate.call( this.contextMenu );
			return false;
		};
		this.appendOption = function( text, onclick, context ) {
			new jr.lib.contextMenu.Option( this, text, onclick, context );
		};
	},
	Option: function( contextMenu, text, onclick, context ) {
		this.contextMenu = contextMenu;
		this.onclick = onclick;
		this.context = context;
		jr.ec( 'div', { parentNode: contextMenu.contextElements.container, className: onclick ? 'activeOption' : 'inactiveOption', innerHTML: text,
			assignments: { option: this },
			onclick: onclick ? function() {
				if( this.option.contextMenu.onClose )
					this.option.contextMenu.onClose.call( this.option.contextMenu );
				jr.remove( this.option.contextMenu.contextElements.div );
				this.option.onclick.call( this.option.contextMenu.element, this.option.context );
			} : null } );
	}
};
jr.init(jr.lib.contextMenu.init);