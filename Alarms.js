jr.include( '/Alarms.css' );
jr.include( '/util.js' );
var delavalAlarms = {
    texts: null,
    init: function() {
		delavalAlarms.texts = {
			animal: jr.translate('Animal'),
			noAlarms: jr.translate('No alarms found'),
			cancel: jr.translate('Cancel'),
			dismissed: jr.translate('Confirmed'),
			dismiss: jr.translate('Do you want to confirm this alarm?'),
			by: jr.translate('by'),
			noPermission: jr.translate("Sorry, you have no permission for this...")
		};
    },
    getIcon: function( icon, black ) {
		var stringEnd = black ? 'b' : 'w';
		switch(icon){
			case 'None' : return "icon";
			case 'Communication': return "list_comerror_" + stringEnd;
			case 'Tank': return "list_milktank_" + stringEnd;
			case 'Temperature': return "list_temp_" + stringEnd;
			case 'Cleaning': return "list_cleaning_" + stringEnd;
			case 'MilkFilter': return "list_filter_" + stringEnd;
			case 'Vacuum': return "list_vakuum2_" + stringEnd;
			case 'Animal': return "list_cow_" + stringEnd;
			default: return "list_cow_" + stringEnd;
		}
    },
    getMessage: function( alarm ) {
		var message = alarm.message || '';
//		if( alarm.animal ) {
//			var ch = message.charAt( message.length - 1 );
//			if( ch !== '.' && ch !== '!' ) message += '.';
//			message += ' ' + delavalAlarms.texts.animal + ' ' + alarm.animal;
//		}
		if(!alarm.dismissDate&&!alarm.dismissUser&&alarm.tryToDismissUser)
			alarm.dismissUser='('+alarm.tryToDismissUser+')'
		if (alarm.dismissUser) {
			var now=new Date(),cnfTime=new Date(alarm.dismissDate),tm='';
			if (alarm.dismissDate) {
				tm=cnfTime.print()				
				if(now.getDate()===cnfTime.getDate()&&now.getMonth()===cnfTime.getMonth())
					tm=cnfTime.printhm();
			}
			message+="<br/>" + delavalAlarms.texts.dismissed+'&nbsp;'+tm+'&nbsp;'+delavalAlarms.texts.by+'&nbsp;'+alarm.dismissUser;
		}
		return message;
    },
    Alarms: function( container, id, initData, ajaxError ) {
		container = container || document.body;
		var table;
		var onresize = function() { 
			$( 'table.alarms' ).css( 'font-size', Math.max( $( 'table.alarms' ).width() / 24, 10 ) );
			$( 'table.alarms td.first img' ).css( 'height', $( 'table.alarms' ).width() / 6 );
			$( 'table.alarms button' ).css( 'font-size', Math.max( $( 'table.alarms' ).width() / 15, 10 ) );
			var table_height = $( 'table.alarms' ).height();
			if( table_height < $( container ).height() * 0.99 ) {
				$( 'div.alarms' ).css( 'height', $( container ).height() * 0.99 );
			} else {
				$( 'div.alarms' ).css( 'height', $( 'table.alarms' ).height() );
			}
		},
		insertAlarm=function(table,a){
			var style = a.dismissDate ? 'standard' : a.severity>=5 ? 'fatal' : 'notification';
			jr.ec( 'tr', { className: style, parentNode: table, rowIndex: 0, 
				assignments: { alarm: a },
				children: [
				{ 'td': { className: 'first', children:
					{ 'img': { src: '/Delaval/ResAlarm/' + delavalAlarms.getIcon( a.icon, style!=='fatal' ) + '.png' } }	
				} },
				{ 'td': { className: 'last', children: [
					{ 'div': { className: 'row1', innerHTML: a.sourceDevice } },
					{ 'div': { className: 'row2', innerHTML: new Date(a.time).printisom() } },
					{ 'div': { className: 'row3', innerHTML: delavalAlarms.getMessage( a ) } }
				] } }
			], onclick: function() {
				if(!this.alarm.dismissDate)
					if(!(initData.perm&2))
						window.alert(delavalAlarms.texts.noPermission);
					else if(window.confirm(delavalAlarms.texts.dismiss+'\n'+a.sourceDevice+'\n'+new Date(a.time).printisom()+'\n'+delavalAlarms.getMessage( a ))) {
						jr.ajax('SrvAlarms','confirm',{id:id,guid:this.alarm.guid}, 'alarmConfirm', null, null, ajaxError);
					}
			} } );
		};
		this.resize=function(){onresize();};
		var getArray = function( data ){
			var d=new JsSerilz('$',data),sz=d.getInt(),arr=[];
			while(--sz>=0) arr.push(d.getString());
			return arr;
		};
		var createTable = function() {
			container.innerHTML = '';
			var div = jr.ec('div', {parentNode: container, className: 'alarms'});
			var table =  jr.ec( 'table', { parentNode: div, className: 'alarms', 
				children: function( table ) {
					if( alarms && alarms.length > 0 ) {
						jr.foreach( alarms, function( a ) {
							insertAlarm( table, a );
						} );
					}
					else {
						jr.ec( 'tr', { className: 'standard', parentNode: table, children: { 'td': { className: 'first last', children: 
						{ 'div': { className: 'row1', innerHTML:delavalAlarms.texts.noAlarms } } 
						} } } );
						}
					} } );
			return div;
		};
		var sortAlarms = function( alarmsObject ) {
			alarmsObject.sort( function( o1, o2 ) {
				if(o1.dismissDate && o2.dismissDate || !o1.dismissDate && !o2.dismissDate)
					return o1.time>o2.time?1:-1;
				else
					return o1.dismissDate?-2:2;
			} );
		};
		var alarms=initData.list;
		sortAlarms( alarms );
		table = createTable();
		jr.eventManager.addListener( 'alarmConfirm', null, function( data ) { if (data !== null) alert('Internal application error:\n\r'+data); } );
		
//		$( window ).resize( onresize );
		var findIndex = function( func ) { for( var i = 0 ; i < alarms.length ; i++ ) { if( func( alarms[i] ) ) return i; } return -1; };
		jr.eventManager.addListener( 'alarmUpdate', null, function( update ) {
			if( update ) {
				while( update.length > 0 ) {
					var newAlarm = update.pop();
					var i = newAlarm.guid ? findIndex( function( item ) { return item.guid === newAlarm.guid; } ) : -1;
					if( i >= 0 )
						alarms[ i ] = newAlarm;
					else
						alarms.push( newAlarm );
				}
			}
			sortAlarms( alarms );
			table = createTable();
			onresize();
		} );
    }
};
jr.init( function() {
    delavalAlarms.init();
} );
