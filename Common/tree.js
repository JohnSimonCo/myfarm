jr.lib.tree = {
	include: function( returnFunction ) {
		jr.ecActions.add( 'insertTree', function( context, parameters ) {
			var tree = new jr.lib.tree.Tree( context.element, parameters.onExpand );
			if( parameters.eventTypeName && parameters.listenerMethod )
				( parameters.eventManager ? parameters.eventManager : jr.eventManager ).addListener( parameters.eventTypeName, tree, parameters.listenerMethod );
		} );
		if( returnFunction )
			returnFunction();
	},
	Tree: function( parentNode, onExpand, data, expandedHTML, collapsedHTML, blankHTML ) {
		this.data = data;
		this.onExpand = onExpand;
		this.expandedHTML = expandedHTML ? expandedHTML : '<font face="Lucida Console">-&nbsp;</font>';
		this.collapsedHTML = collapsedHTML ? collapsedHTML : '<font face="Lucida Console">+&nbsp;</font>';
		this.blankHTML = blankHTML ? blankHTML : '<font face="Lucida Console">&nbsp;&nbsp;</font>';
		this.expandedNodes = {};
		this.container = parentNode;
		this.update = function( data ) {
			jr.clearHTML( this.container );
			if( data )
				this.data = data;
			if( this.data )
				this.onExpand.call( this, this.data );
		};
		this.appendNode = function( id, data, childCount, onCreate ) {
			return new jr.lib.tree.TreeNode( this, null, id, data, childCount, onCreate );
		};
		this.update();
	},
	TreeNode: function( tree, parentNode, id, data, childCount, onCreate ) {
		this.tree = tree;
		this.parentNode = parentNode;
		this.id = id;
		this.data = data;
		this.onCreate = onCreate;
		this.childCount = childCount;
		this.level = parentNode ? parentNode.level + 1 : 0;
		this.expanded = false;
		this.appendNode = function( id, data, childCount, onCreate ) {
			return new jr.lib.tree.TreeNode( this.tree, this, id, data, childCount, onCreate );
		};
		this.expand = function() {
			this.collapse();
			this.expanded = true;
			this.tree.expandedNodes[ this.id ] = true;
			this.renderActionContainer();
			this.tree.onExpand.call( this, this.data );
		};
		this.collapse = function() {
			this.expanded = false;
			this.tree.expandedNodes[ this.id ] = false;
			while( this.contextElements.nodeContainer.children.length > 1 )
				this.contextElements.nodeContainer.removeChild( this.contextElements.nodeContainer.children[1] );
			this.renderActionContainer();
		};
		this.renderActionContainer = function() {
			this.contextElements.actionContainer.style.marginLeft = (this.level * 10) + 'px';
			this.contextElements.actionContainer.innerHTML = this.childCount == 0 ? this.tree.blankHTML : this.expanded ? this.tree.expandedHTML : this.tree.collapsedHTML;
		};
		this.render = function() {
			this.renderActionContainer();
			this.onCreate.call( this.contextElements.innerContainer, this.data );
		};
		this.getNodeContainer = function() { return this.contextElements.node; };
		this.getInnerNodeContainer = function() { return this.contextElements.innerContainer; };
		this.contextElements = {};
		this.container = jr.ec( 'div', { parentNode: parentNode ? parentNode.container : tree.container, contextIdentity: 'nodeContainer', children: [ 
			{ 'div': { contextIdentity: 'node', children: [
				{ 'span': { contextIdentity: 'actionContainer', style: { cursor: 'default' }, 
					assignments: {
						node: this,
						onclick: function() { if( this.node.expanded ) this.node.collapse(); else this.node.expand(); }
					} } },
				{ 'span': { contextIdentity: 'innerContainer', className: 'treeInnerContainer', assignments: { treeNode: this } } },
			] } }
		] }, this.contextElements );
		this.render();
		if( tree.expandedNodes[ id ] )
			this.expand();
	}
};
