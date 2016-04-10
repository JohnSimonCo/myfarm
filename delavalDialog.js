jr.include( '/delavalDialog.css' );
var delavalDialog = {
	Dialog: function( container, title, titleClass, buttons ) {
		var bodyElements = [];
		jr.foreach( container.children, function( element ) {
			bodyElements.push( { element: element, display: element.style.display } );
			element.style.display = 'none';
		} );
		var ce = {};
		if (typeof title == 'string')
			title=[{'span':{innerHTML:title}}];
		var dialog = jr.ec( 'div', { parentNode: container, className: 'delavalDialog', children: [
			{ 'div': { children: [
				{ 'div': { className: 'title '+titleClass, children: title } },
				{ 'div': { className: 'buttons', children: function( buttonsContainer ) {
					jr.foreach( buttons, function( button ) {
						jr.ec( 'button', { parentNode: buttonsContainer, disabled: button.disabled,innerHTML: button.text, className: button.className, 
							onclick: button.onclick 
						} );					
					} );
				} } },
				{ 'div': { className: 'content', contextIdentity: 'content' } }
			] } }
		] }, ce );
		this.getContentContainer = function() {
			return ce.content;
		};
		var delavalDialogOnResize = function() {
			var $delavalDialog = $( 'div.delavalDialog' );
			$delavalDialog.css( 'font-size', Math.max( $delavalDialog.width() / 25, 10 ) );
			$( 'div.delavalDialog div.buttons button' ).css( 'font-size', Math.max( $delavalDialog.width() / 25, 10 ) );
		};
		window.addEventListener( 'resize', delavalDialogOnResize );
		var remove = function() {
			jr.foreach( bodyElements, function( item ) {
				item.element.style.display = item.display;
			} );
			jr.remove( dialog );
			window.removeEventListener( 'resize', delavalDialogOnResize );
		};
		this.Remove = remove;
		delavalDialogOnResize();
	}
}