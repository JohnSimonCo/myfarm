'use-strict';

angular.module('milkdata', [])
.factory('getCowDataNew', ['myfarm.cacheByFarm', 'getWeekMilkings', '$q', 'MilkData', 'AnimalData', function(cacheByFarm, getWeekMilkings, $q, MilkData, AnimalData) {
	return cacheByFarm('cow.getCowDataNew', function(vcId) {
		var getFileIndexFromTime=function(time) {
			return Math.floor((time - 1415318400000) / 604800000) - 60;
		}
		var now = new Date().getTime(), indexNow = getFileIndexFromTime(now), twoDaysAgo = getFileIndexFromTime(now - 172800000), i = indexNow, ii = 2;
		var weeksToFetch=[];
		weeksToFetch.push(i);
		weeksToFetch.push(--i);
		while (i > 0 && --ii >= 0)
			weeksToFetch.push(--i);

		weeksToFetch.sort(function(a, b) {
			return a - b;
		});

		var promises = weeksToFetch.map(function(week) {
			return getWeekMilkings(vcId, week);
		});

		var done = $q.all(promises).then(function(datas) {
			return datas
			.map(function(data) {
				return new MilkData(data);
			})
			.reduce(function(previous, current) {
				if(previous == null) { return current; }

				previous.mergeWithLaterWeek(current);
				return previous;
			}, null);
		});

		return done.then(function(data) {
			var minTime = new Date().getTime(), maxTime = 0, maxProd = 0;
			var useImperialUnits = false;	// *** Finns i svaret på getAllData. Om true, ska stå pound istället för kg i GUI
			var cc=2.204622621;
			data.animals.forEach(function(a) {
				if (useImperialUnits) {
					a.milkings.forEach(function(m){
						m.pounds=1;
						m.totalYield =		Math.round(cc * m.totalYield *	 10) / 10;
						m.totalYieldLF =	Math.round(cc * m.totalYieldLF * 10) / 10;
						m.totalYieldLR =	Math.round(cc * m.totalYieldLR * 10) / 10;
						m.totalYieldRF =	Math.round(cc * m.totalYieldRF * 10) / 10;
						m.totalYieldRR =	Math.round(cc * m.totalYieldRR * 10) / 10;
						m.averageFlow =		Math.round(cc * m.averageFlow * 100) / 100;
						m.averageFlowLF =	Math.round(cc * m.averageFlowLF * 100) / 100;
						m.averageFlowLR =	Math.round(cc * m.averageFlowLR * 100) / 100;
						m.averageFlowRF =	Math.round(cc * m.averageFlowRF * 100) / 100;
						m.averageFlowRR =	Math.round(cc * m.averageFlowRR * 100) / 100;
					});
				};
				var p = a.production = new AnimalData(a);
				if (p.startDate < minTime)
						minTime = p.startDate;
				if (p.endDate > maxTime)
						maxTime = p.endDate;
				if (p.maxProd > maxProd)
						maxProd = p.maxProd;
			});
			data.maxProd = maxProd;
			data.minTime = minTime;
			data.maxTime = maxTime;

			data.animals.forEach(function(animal) {
				animal.production.days.forEach(function(day) {
					day.mlk.forEach(function(milking) {
						milking.o.hour24 = milking.prodPerDay;
					});
				});
			});

			return data;
		});
	});
}])
.factory('getWeekMilkings', ['$http', function($http) {
	return function(vcId, week) {
		return $http({
			method: 'GET',
			url: '/GetWeekMilkings.vcx',
			params: {
				vcId: vcId,
				index: week
			},
			responseType: 'arraybuffer',
			cache: false,
			timeout: 20000 //20 sec
		}).then(function(response) {
			return new Uint8Array(response.data);
		});
	};
}])
.factory('AnimalData', [function() {
	var AnimalData = function(animal) {
		this.days = [];
		var mm = animal.milkings;
		if (mm.length > 0) {
			this.startTime = new Date(mm[0].endOfMilkingTime);
			this.endTime = new Date(mm[mm.length - 1].endOfMilkingTime);
			this.startTime.setHours(0,0,0,0);
			this.endTime.setHours(0,0,0,0);
			this.startTime = this.startTime.getTime();
			this.endTime = this.endTime.getTime();
			var nrDays = (this.endTime - this.startTime) / 86400000 + 1, day=[];
			this.days.length = Math.round(nrDays);
			var m=[], prevTime = 0, pt, i = -1;
			while (++i < mm.length) {
				var  mo = mm[i], o = {o:mo};
				m.push(o);
				if (prevTime && (pt = mo.endOfMilkingTime - prevTime) < 129600000) {
					o.prodTime = pt / 3600000;
					o.prodPerDay = mo.totalYield / o.prodTime * 24;
					var dayInd = Math.floor((mo.endOfMilkingTime - this.startTime) / 86400000), d;
					if (!(d=this.days[dayInd]))
						d=this.days[dayInd]={mlk:[], kg:0, time:0};
					d.mlk.push(o);
				}
				prevTime = mo.endOfMilkingTime;
			}
			i = -1;
			while (++i < this.days.length) {
				var o = this.days[i], op = 0 ? null : this.days[i - 1], ii = 0;
				if (o) {
					var td = o.mlk[0], tm = (td.o.endOfMilkingTime - this.startTime - (i * 86400000)) / 3600000, f = tm / td.prodTime;
					if (f > 1)
						f = 1;
					o.kg = f * o.mlk[0].o.totalYield;
					o.time = f *o.mlk[0].prodTime;
					if (op) {
						f = 1 - f;
						op.kg += f * o.mlk[0].o.totalYield;
						op.time += f * o.mlk[0].prodTime;
						op.prodPerDay = op.kg / (op.time / 24);
					}
					while (++ii < o.mlk.length) {
						o.kg += o.mlk[ii].o.totalYield;
						o.time += o.mlk[ii].prodTime;
					}
					o.prodPerDay = o.kg / (o.time / 24);
				}
			}
			i = 0;
			this.maxProd = 0;
			while (++i < this.days.length - 1) {
				var o = this.days[i];
				if (o) {
					o.prodPerDay = o.kg / (o.time / 24);
					if (o.prodPerDay > this.maxProd)
						this.maxProd = o.prodPerDay;
				}
			}
			ii = 8;
			var sum = 0, cnt = 0;
			while (--ii >=0 && --i >= 0)
				if (this.days[i]) {
					sum += this.days[i].prodPerDay;
					cnt++;
				}
			this.prod7d = cnt ? sum / cnt : 0;
			this.startDate = this.startTime;
			this.endDate = this.endTime + 86400000 - 1;
			var oo=0;
			oo++;
		}
	}
	return AnimalData;
}])
.factory('MilkData', [function() {
	var 
	buf,
	bufInd,
	bufLen,
	Milking=function(fixLen) {
		var indBefore = bufInd, len = getBufShort();
		this.endOfMilkingTime =	getBufLong();
		this.guidHash =			getBufInt();
		this.animalNumber =		getBufInt();
		var version =			getBufByte();
		if (version === 1) {
			var combinedMap0 =	getBufInt();
			this.activity =		getBufByte();	if (this.activity === 255) this.activity = -1;
			this.lactation =	getBufByte();
			var combinedMap1h =	getBufInt();
			var combinedMap1l =	getBufInt();
			var combinedMap2h =	getBufInt();
			var combinedMap2l =	getBufInt();
			var combinedMap3 =	getBufInt();
			var combinedMap4 =	getBufInt();
			var combinedMap5=	getBufShort(),
				aver=function(arr) {
					var sum = 0, count = 0, i = -1;
					while (++i < arr.length)
						if (arr[i] > 0) {
							sum += arr[i];
							count++;
						}
					return count ? Math.round(sum / count * 100) / 100 : 0;
				};
			this.expectedYieldPercentDiff =	(((combinedMap1h & 0x7FF00000) >> 20) - 1200) / 20;
			this.averageFlow =				(((combinedMap1h & 0x7F) << 2) + (combinedMap1l >> 30)) * 10;
			this.averageConductivity =		((combinedMap1l & 0xFFE00) >> 9) / 100;
			if (combinedMap0 !== -1) {
				this.conductivityLF=		this.averageConductivity;
				this.conductivityLR=		(combinedMap0 & 0x000003ff) / 100;
				this.conductivityRF=		((combinedMap0 & 0x000FFC00) >> 10) / 100;
				this.conductivityRR=		((combinedMap0 & 0x3FF00000) >> 20) / 100;
				this.averageConductivity =	aver([this.conductivityLF, this.conductivityLR, this.conductivityRF, this.conductivityRR]);
				if (combinedMap3 !== -1) {
					this.averageFlowLF =	this.averageFlow;
					this.averageFlowLR =	(combinedMap3 & 0x000003ff) * 10;
					this.averageFlowRF =	((combinedMap3 >> 10) & 0x000003ff) * 10;
					this.averageFlowRR =	((combinedMap3 >> 20) & 0x000003ff) * 10;
					this.averageFlow =		aver([this.averageFlowLF, this.averageFlowLR, this.averageFlowRF, this.averageFlowRR]);
//					this.peakFlowLF =		(combinedMap5 & 0x000003ff) * 10;
//					this.peakFlowLR =		(combinedMap4 & 0x000003ff) * 10;
//					this.peakFlowRF =		((combinedMap4 >> 10) & 0x000003ff) * 10;
//					this.peakFlowRR =		((combinedMap4 >> 20) & 0x000003ff) * 10;
				}
			}
				var value =					(combinedMap1h & 0xFFF80) >> 7;
			this.occ =						value === 0x1fff ? -1 : value;
				value =						(combinedMap1l & 0x3FF00000) >> 20;
			this.mdi =						value === 0x3FF ? -1 : (value / 100);
				value =						(combinedMap1l & 0x1FF);
			this.performance =				value === 0x1FF ? -1 : value;

			this.totalYield =				(combinedMap2l &		0x1FFF) * 0.01;
			this.expectedSpeed =			((combinedMap2l &		0x3FFE000) >> 13) / 1000;
			this.carryOver =				(((combinedMap2h &		0x3F) << 6) + (combinedMap2l >> 26)) / 100;
			this.pulsationRatio =			((combinedMap2h &		0x1FC0) >> 6);
			this.cleaningProgramNr =		(combinedMap2h &		0x1E000000) >> 25;
				value =						(combinedMap2h &		0x1FFE000) >> 13;
			this.blood =					value === 0xFFF? -1 : (value * 4);

			this.lactationDay =				getBufLong();
			this.secMilkingTime =			getBufShort();
				value =						getBufByte();
			this.breed =					value === 255 ? -1 : value;
			this.flags =					getBufShort();
			this.totalYieldLF =				getBufFloat100();
			this.totalYieldLR =				getBufFloat100();
			this.totalYieldRF =				getBufFloat100();
			this.totalYieldRR =				getBufFloat100();
			this.expectedYieldLF =			getBufFloat100();
			this.expectedYieldLR =			getBufFloat100();
			this.expectedYieldRF =			getBufFloat100();
			this.expectedYieldRR =			getBufFloat100();
			this.carryoverYieldLF =			getBufFloat100();
			this.carryoverYieldLR =			getBufFloat100();
			this.carryoverYieldRF =			getBufFloat100();
			this.carryoverYieldRR =			getBufFloat100();
			this.expectedSpeedLF =			getBufFloat1000();
			this.expectedSpeedLR =			getBufFloat1000();
			this.expectedSpeedRF =			getBufFloat1000();
			this.expectedSpeedRR =			getBufFloat1000();
			this.bloodLF =					getBufShort0();
			this.bloodLR =					getBufShort0();
			this.bloodRF =					getBufShort0();
			this.bloodRR =					getBufShort0();
			var s='', i=len-(bufInd-indBefore), ch;
			while(--i>=0 && (ch=getBufByte()))
				s+=String.fromCharCode(ch);
			this.robot =					s;
			s='';
			while(--i>=0 && (ch=getBufByte()))
				s+=String.fromCharCode(ch);
			this.milkDestination =			s;
			s='';
			while(--i>=0 && (ch=getBufByte()))
				s+=String.fromCharCode(ch);
			this.events=s;
		}
		bufInd = indBefore + (fixLen ? fixLen : len);
	},
	Animal=function(animalNr,nrMilkings) {
		this.animalNr =		animalNr;
		this.nrMilkings =	nrMilkings;
		this.milkings =		[];
		this.addMilkingsAtEnd = function(other) {
			var nrNewMilkings = other.nrMilkings, i = -1;
			while (++i < nrNewMilkings)
				this.milkings.push(other.milkings[i]);
			this.nrMilkings += nrNewMilkings;
		};
	},
	setBuf=function(bytearr) {
		buf = bytearr;
		bufInd = 0;
		bufLen = bytearr.byteLength;
	},
	getBufByte=function() {
		return buf[bufInd++];
	},
	getBufShort=function() {
		bufInd += 2;
		return	  ((buf[bufInd-2] & 0xFF) << 8)
				| ((buf[bufInd-1] & 0xFF));
	},
	getBufShort0=function() {
		bufInd += 2;
		var val = ((buf[bufInd-2] & 0xFF) << 8)
				| ((buf[bufInd-1] & 0xFF));
		return val === 65535 ? -1 : val;
	},
	getBufFloat100=function() {
		bufInd += 2;
		var val = ((buf[bufInd-2] & 0xFF) << 8)
				| ((buf[bufInd-1] & 0xFF));
		return val === 65535 ? -1 : val / 100;
	},
	getBufFloat1000=function() {
		bufInd += 2;
		var val = ((buf[bufInd-2] & 0xFF) << 8)
				| ((buf[bufInd-1] & 0xFF));
		return val === 65535 ? -1 : val / 1000;
	},
	getBufInt=function() {
		bufInd += 4;
		return	  ((buf[bufInd-4] & 0xFF) << 24)
				| ((buf[bufInd-3] & 0xFF) << 16)
				| ((buf[bufInd-2] & 0xFF) << 8)
				| ((buf[bufInd-1] & 0xFF));
	},
	getBufLong=function() {
		var result, i=8;
		while(--i >= 0) {
			var b=buf[bufInd++];
			if(result)
				result+=b?(b>=16?'':'0')+b.toString(16):'00';
			else if (b)
				result=b.toString(16);
		}
		return result?parseInt(result,16):0;
	};


	return function(data) {
		setBuf(data);
		this.totalFixSize =		getBufInt();
		this.milkingFixSize =	getBufInt();
		this.nrAnimals =		getBufInt();
		this.animals =			[];
		this.getNrMilkings = function() {
			var sum=0, i=-1, len=this.nrAnimals;
			while (++i < len)
				sum += this.animals[i].nrMilkings;
			return sum;
		},
		this.getAnimal = function(animalNr) {
			if (this.nrAnimals) {
				var iLeft = 0, iRight = this.nrAnimals - 1, i = Math.floor(this.nrAnimals / 2);
				while (true) {
					var an = this.animals[i];
					if (an.animalNr === animalNr)
						return an;
					if (animalNr < an.animalNr)
						iRight = i - 1;
					else
						iLeft = i + 1;
					if (iRight < iLeft)
						return null;
					else if (iRight === iLeft)
						i = iLeft;
					else
						i = iLeft +  Math.floor((iRight - iLeft) / 2) + 1;
				}
			}
			return null;
		},
		this.mergeWithLaterWeek = function(laterWeek) {
			var i = -1;
			while (++i < laterWeek.nrAnimals) {
				var newAnimal = laterWeek.animals[i];
				var myAnimal = this.getAnimal(newAnimal.animalNr);
				if (myAnimal)
					myAnimal.addMilkingsAtEnd(newAnimal);
				else {
					this.animals.push(newAnimal);
					this.nrAnimals++;
					this.animals.sort(function(a, b){return a.animalNr-b.animalNr;});
				}
			}
		};
		var i=-1;
		while (++i < this.nrAnimals) {
			var animalNr = getBufInt();
			var nrMilkings = getBufShort();
			this.animals.push(new Animal(animalNr, nrMilkings));
		}
		i = -1;
		while (++i < this.nrAnimals) {
			var ii = -1, a = this.animals[i];
			while (++ii < a.nrMilkings)
				a.milkings.push(new Milking(this.milkingFixSize));
		}
		while (bufInd < bufLen) {
			var extraMilking = new Milking();
			var newAnimal = this.getAnimal(extraMilking.animalNumber);
			if (newAnimal) {
				i = newAnimal.nrMilkings;
				while (--i >= 0 && newAnimal.milkings[i].endOfMilkingTime > extraMilking.endOfMilkingTime) {}
				if (i >= 0 && (newAnimal.milkings[i].endOfMilkingTime === extraMilking.endOfMilkingTime || newAnimal.milkings[i].guidHash === extraMilking.guidHash))
					newAnimal.milkings[i] = extraMilking;
				else {
					newAnimal.milkings.splice(i + 1, 0, extraMilking);
					newAnimal.nrMilkings++;
				}
			}
			else {
				newAnimal = new Animal(extraMilking.animalNumber, 1);
				newAnimal.milkings.push(extraMilking);
				this.animals.push(newAnimal);
				this.nrAnimals++;
				this.animals.sort(function(a, b){return a.animalNr-b.animalNr;});
			}
		}
	};
}])