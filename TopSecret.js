jr.include('/cli.css');
jr.include('/buttons.css');
var topSecret = {
	init: function() {
	},
	instance:	function(){
		var 
		ce={},
		root=document.body,
		data = null,
		setProps=function() {
			ce['save'].innerHTML = jr.translate("Saving...");
			ce['save'].disabled = true;
			var newProps = {};
			for(var prop in data) {
				if(data.hasOwnProperty(prop)){
					var val = ce[prop];
					val = val.type == 'checkbox' ? val.checked : val.value;
					newProps[prop]=val;
				}
			}
			jr.ajax('TopSecret', 'setProperties', {props: newProps}, 'getProps' );
		},
		isChanged=function isChanged() {
			var changed = false;
			for(var prop in data) {
				if(data.hasOwnProperty(prop)){
					var val = ce[prop];
					val = val.type == 'checkbox' ? val.checked : val.value;
					if(val != data[prop]) {
						changed = true;
					}
				}
			}
			ce['save'].disabled = !changed;
		},
		getProps=function(d) {
			data = d.props;
			var a=[], rows=[], even=false;
			rows.push({'tr': {style:{background:even?'#E8E8E8':'lightblue',height:'20px'},children:[
				{td:{colSpan: 2, style:{'text-align':'center',padding:'5px'}, width: '200px', align:'left',children:{'span':{innerHTML:jr.translate('$mb Mb left on disk',{mb: d.megabyteLeft})}}}},
			]}});
			even=!even;
			for(var prop in data) {
				if(data.hasOwnProperty(prop)){
					var val = data[prop];
					var input = {'input':{contextIdentity:prop}};
					if(typeof val == 'boolean') {
						input.input.type='checkbox';
						input.input.checked=val;
					} else {
						input.input.type='input';
						input.input.value=data[prop];
					}
					rows.push({'tr': {style:{background:even?'#E8E8E8':'lightblue',height:'20px'},children:[
						{td:{style:{padding:'5px'}, width: '200px', align:'left',children:{'span':{innerHTML:prop}}}},
						{td:{style:{padding:'5px'}, align:'left',children:input}},
					]}});
					even=!even;
				}
			}
			rows.push({'tr': {style:{background:even?'#E8E8E8':'lightblue',height:'20px'},children:[
				{td:{style:{padding:'5px'}, colSpan: 2, align:'center', children:{'button':{style:{'font-size':'18px','padding-left':'10px','padding-right':'10px'},disabled:'true',contextIdentity:'save',onclick:setProps,innerHTML:'Save'}}}},
			]}});
			a.push({'div':{children:[
				{'table':{style:{'border-spacing':'0px'},children: rows}}
			]}});
			if(ce['mainDiv'])
				root.removeChild(ce['mainDiv']);
			jr.ec(root, {children:[{'div':{contextIdentity:'mainDiv',children:a}}]},ce);
			$(root).css('background-color', data.backgroundColor);
			$('input[type=checkbox]').click(isChanged);
			$('input[type=input]').keyup(isChanged);
			$('tr:first-of-type td:first-of-type').css('border-top-left-radius', '6px');
			$('tr:first-of-type td:last-of-type').css('border-top-right-radius', '6px');
			$('tr:last-of-type td:last-of-type').css('border-bottom-right-radius', '6px');
			$('tr:last-of-type td:first-of-type').css('border-bottom-left-radius', '6px');
			isChanged();
		};
		jr.eventManager.addListener('getProps', jr.eventManager, function(data) {if(data)getProps(data);else root.innerHTML=jr.translate("Sorry, you have no permission for this...");});
		jr.ajax( 'TopSecret', 'getProperties', null, 'getProps' );
	}
}
jr.init( function() {
    topSecret.init();
	new topSecret.instance();
} );
