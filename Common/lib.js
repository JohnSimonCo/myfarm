jr.include('/Common/lib.css');
jr.include('/Common/contextMenu.js');
jr.lib = {
	init: function() {
		jr.ecActions.add( 'makeDragable', jr.lib.dragAndDrop.makeDragable );
		jr.ecActions.add( 'makeDroppable', jr.lib.dragAndDrop.makeDroppable );
	},
	calculate: {
		mousePosition: function (e) {
			e = e || window.event;
			return ( e.pageX || e.pageY ) ? { x: e.pageX, y: e.pageY } : { x: e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft, y: e.clientY + document.body.scrollTop + document.documentElement.scrollTop };
		},
		elementPosition: function (element) {
			var x = 0, y = 0;
			var el = element;
			while (el.parentNode && el.parentNode != document) {
				y -= el.scrollTop;
				x -= el.scrollLeft;
				el = el.parentNode;
			}
			while (element) {
				x += element.offsetLeft;
				y += element.offsetTop;
				element = element.offsetParent;
			}
			return { x: x, y: y };
		},
		mouseOffset: function (elementPosition, mousePosition) {
			return { x: mousePosition.x - elementPosition.x, y: mousePosition.y - elementPosition.y };
		}
	},
	dragAndDrop: {
		makeDragable: function( context, parameters ) {
			parameters.dragAndDrop.AddDragable( context.element, parameters.onclone );
		},
		makeDroppable: function( context, parameters ) {
			parameters.dragAndDrop.AddDroppable( context.element );
		}
	},
	DragAndDrop: function( onmouseoverdoppable, onmouseoutdroppable, ondrop, onrelsease ) {
		this.DragableElements = new Array();
		this.DroppableElements = new Array();
		this.onmouseoverdoppable = onmouseoverdoppable;
		this.onmouseoutdroppable = onmouseoutdroppable;
		this.ondrop = ondrop;
		this.onrelease = onrelsease;
		this.active = { mouseOffset: null, element: null, clone: null, droppable: null, blockClone: null };
		this.disable = function( element ) {
			element.onmousedown = null;
		};
		this.enable = function( element ) {
			element.onmousedown = function( e ) { this.dragAndDrop.Activate( this, jr.lib.calculate.mousePosition( e ) ); return false; };	
		};
		this.AddDragable = function( element, onclone ) {
			element.dragAndDrop = this;
			if( !element.dragAndDropData )
				element.dragAndDropData = { };
			element.dragAndDropData.drag = { onclone: onclone ? onclone : this.defaultClone };
			this.enable( element );
		};
		this.defaultClone = function( element, mousePosition ) {
			var elementPosition = jr.lib.calculate.elementPosition(element);
			if( mousePosition )
				this.active.mouseOffset = jr.lib.calculate.mouseOffset( elementPosition, mousePosition );
			this.active.blockClone = jr.ec( 'div', { parentNode: document.body, style: {
				position: 'absolute',
				backgroundColor: '#ffffff',
				left: ( elementPosition.x + 1 ) + 'px',
				top: ( elementPosition.y + 1 ) + 'px',
				width: ( element.offsetWidth + 1 ) + 'px', 
				height: ( element.offsetHeight + 1 ) + 'px',
				filter: 'alpha(opacity=50)',
				opacity: 0.5,
				cursor: 'hand',
				zIndex: 100001
			} } );
			return jr.ec( element.cloneNode( true ), { style: { 
				width: element.offsetWidth + 'px', 
				height: element.offsetHeight + 'px', 
				zIndex: 100002, 
				position: 'absolute' } } );
		};
		this.AddDroppable = function( element ) {
			this.DroppableElements.push( element );
			if( !element.dragAndDropData )
				element.dragAndDropData = { };
		};
		this.Activate = function( element, mousePosition ) {
			this.active = { 
				mouseOffset: jr.lib.calculate.mouseOffset( jr.lib.calculate.elementPosition( element ), mousePosition ), 
				element: element };
			document.body.actionObject = this;
			document.onmousemove = function( e ) { 
				document.body.actionObject.onmousemove( e ? jr.lib.calculate.mousePosition( e ) : document.body.actionObject.active.lastMousePosition ); 
				return false; 
			};
			document.onmouseup = function() {
				document.body.actionObject.onmouseup();
				document.onmousemove = null;
				document.onmouseup = null;
				return false;
			};
		};
		this.onmouseup = function() {
			if( this.active.clone ) {
				jr.remove( this.active.blockClone );
				if( this.onrelease )
					this.onrelease();
				else
					jr.remove( this.active.clone );
				if( this.ondrop && this.active.droppable )
					this.ondrop( this.active.element, this.active.droppable, this );
				for( var i = 0, droppableElement = this.DroppableElements[ i ] ; i < this.DroppableElements.length ; droppableElement = this.DroppableElements[ ++i ] ) {
					droppableElement.onmouseover = droppableElement.dragAndDropData.drop.onmouseover;
					droppableElement.onmouseout = droppableElement.dragAndDropData.drop.onmouseout;
					droppableElement.dragAndDropData.drop = null;
				}
			}
			this.active = {};
		};
		this.onmousemove = function( mousePosition ) {
			this.active.lastMousePosition = mousePosition;
			if( !this.active.clone ) {
				for( var i = 0, droppableElement = this.DroppableElements[ i ] ; i < this.DroppableElements.length ; droppableElement = this.DroppableElements[ ++i ] ) {
					droppableElement.dragAndDropData.drop = { onmouseover: droppableElement.onmouseover, onmouseout: droppableElement.onmouseout };
					droppableElement.onmouseover = function() {
						if (document.body.actionObject.onmouseoverdoppable)
							document.body.actionObject.onmouseoverdoppable.call(this, document.body.actionObject);
						document.body.actionObject.active.droppable = this;
					};
					droppableElement.onmouseout = function() {
						if (document.body.actionObject.onmouseoutdroppable)
							document.body.actionObject.onmouseoutdroppable.call(this, document.body.actionObject);
						document.body.actionObject.active.droppable = null;
					};
				}
				this.active.clone = this.active.element.dragAndDropData.drag.onclone.call( this.active.element, this, mousePosition );
				document.body.appendChild( this.active.clone );
				new jr.CycledAction( this.active.mouseOffset, { x: -15, y: -20 }, 15, null, function( instance ) { if( document.onmousemove ) document.onmousemove(); } );
			}
			jr.ec( this.active.clone, { style: {
				top: ( mousePosition.y - this.active.mouseOffset.y ) + 'px',
				left: ( mousePosition.x - this.active.mouseOffset.x ) + 'px' } } );
		};
	}
};
jr.init(jr.lib.init);