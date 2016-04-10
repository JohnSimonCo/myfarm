jr.include('/stat.js');
jr.include('/filter.js');
jr.init( function() {
	var
		count=0,
		robots={},
		animals={},
		sd,
		robot=function(name, vcId, vcName) {
			this.name = name;
			this.vcId = vcId;
			this.vcName = vcName;
			this.milkings = [];
		},
		animal=function(name) {
			this.name = name;
			this.milkings = [];
		},
		milking=function(animalGuid, m) {
			this.animal = animalGuid;
			this.robotId = m.robotId;
			this.events = m.events;
			this.milkHg = m.milkHg;
			this.milkingTimeEnd = m.milkingTimeEnd;
			this.milkingTimeSec = m.milkingTimeSec;
		},
		getInt = function() {
			var i = sd.getString();
			return i ? parseInt(i) : 0;
		},
		msEvents = function(d) {
			this.kickOff =				[0,0,0,0];
			this.nrTries =				[0,0,0,0];
			this.failClean =			[0,0,0,0];
			this.failAttach =			[0,0,0,0];
			this.nrTries =				[0,0,0,0];
			// Time in deci seconds
			this.timeAttachTeatLast =	[0,0,0,0];
			this.timeAttachTeatTotal =	[0,0,0,0];
			sd = new JsSerilz('#', d);
			this.timeVc =				getInt();
			this.timeClean =			getInt();
			this.timeAttach =			getInt();
			this.timeMilking =			getInt();
			this.timeSpray =			getInt();
			this.timeOutOfStall=		getInt();
			this.failSpray =			getInt() > 0;
			var i = -1;
			while (++i < 4)
				if ((this.nrTries[i] = getInt()) > 0) {
					this.timeAttachTeatTotal[i]=	getInt();
					var timeLast =					getInt();
					this.timeAttachTeatLast[i] =	timeLast === 0 ? this.timeAttachTeatTotal[i] : timeLast;
					this.kickOff[i] =				getInt();
					this.failClean[i] =				getInt();
					this.failAttach[i] =			getInt();
				}
		},
		farmData = function(data) {
			var rr = {};
			for (var ri in data.robots) {
				var r = data.robots[ri];
				(rr[r.index] = r).guid = ri;
			}
			for (var ai in data.animals) {
				var a = data.animals[ai], anim = new animal(a.animalName), hasMilking = 0;
				for (var mi in a.milkings) {
					var m = a.milkings[mi];
					m.robotName = rr[m.indexRobot].robotName;
					m.robotId = rr[m.indexRobot].guid;
					m.events = new msEvents(m.milkingEvents);
					if(m.events.timeMilking > 0) {
						count++;
						var rid = rr[m.indexRobot].guid, rob = robots[rid], milk = new milking(a.animalGuid, m);
						if (!rob)
							robots[rid] = rob = new robot(rr[m.indexRobot].robotName, data.vcId, data.vcName);
						if (!hasMilking) {
							hasMilking = 1;
							animals[a.animalGuid] = anim;
						}
						rob.milkings.push(milk);
						anim.milkings.push(milk);
for(var k in m.events.nrTries)
	if(m.events.nrTries[k] > 1)
		console.log(m.events);
					}
					var ee = 0;
					ee++;
				}
			}
			for (var ai in animals)
				animals[ai].milkings.sort(function(o1,o2){
					return o1.milkingTimeEnd > o2.milkingTimeEnd ? 1 : -1;
				});
			for (var ri in robots)
				robots[ri].milkings.sort(function(o1,o2){
					return o1.milkingTimeEnd > o2.milkingTimeEnd ? 1 : -1;
				});
		};
	stat.init();
	filter.init();
	jr.eventManager.addListener('myConf', jr.eventManager, function(data) {
		if(data){
			document.body.style.width='1200px';
			var i = -1;
			while (++i < data.length)
				farmData(data[i]);
	console.log(count + " milkings");
			new stat.instance(document.body).prepare(data);
		}});
	jr.ajax( 'SrvMyFarm', 'getAllRobotEvents', null, 'myConf' );
} );
