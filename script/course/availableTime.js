var availableTime = function() {
	var self = this;
	var beginHour = 8; //开始时间
	var endHour = 21; //结束时间
	self.UserID = getLocalItem('UserID');

	self.Hours = ko.observableArray([]); //小时数组
	for (var i = beginHour; i < endHour; i++) {
		self.Hours.push(i);
	}
	self.DayOfWeek = ko.observableArray(['日', '一', '二', '三', '四', '五', '六']); //星期数组
	self.DayOfWeekValue = ko.observableArray([0, 1, 2, 3, 4, 5, 6]); //星期的值数组
	self.Freetimes = ko.observableArray([]); //可授课时间
	self.FreetimeRemark = ko.observable(''); //可授课时间备注

	//获取可授课时间
	self.GetData = function() {
		var self = this;
		var ajaxUrl = common.gServerUrl + 'API/Teacher/GetFreetime?userid=' + getLocalItem('UserID');
		mui.ajax(ajaxUrl, {
			type: 'GET',
			success: function(responseText) {
				var teacher = JSON.parse(responseText);
				var times = JSON.parse(teacher.FreetimeJson);
				if(times)
					self.Freetimes(times);
				
				self.FreetimeRemark(common.StrIsNull(teacher.FreetimeRemark));
			}
		});
	}

	mui.plusReady(function() {
		var self = this;

		self.GetData();
	})

	//初始化单元格
	self.initCell = function(dayofweek, hour) {
		var self = this;
		var ret = {
			dayofweek: dayofweek,
			hour: hour,
			free: false
		};
		
		self.Freetimes().forEach(function(freetime) {
			if (dayofweek == freetime.DayOfWeek && freetime.Time.indexOf(hour) >= 0) {
				//console.log('true');
				ret = {
					dayofweek: dayofweek,
					hour: hour,
					free: true
				};
				return;
			}
		})

		return ret;
	}

	ko.bindingHandlers.cellValue = {
		init: function(element, valueAccessor) {

		},
		update: function(element, valueAccessor, allBindings) {
			//var self = this;
			var value = ko.unwrap(valueAccessor());
			element.value = value;
			element.onclick = function() {
				//console.log(this.value.free);
				this.value.free = !this.value.free;
				this.className = this.value.free ? 'busytime' : 'freetime';

				//获取数组中对应的位置
				var index = -1;
				//console.log(self.Freetimes());
				var freetimesLen=self.Freetimes().length;
				for (var i = 0; i < freetimesLen; i++) {
					if (self.Freetimes()[i].DayOfWeek == this.value.dayofweek) {
						index = i;
						break;
					}
				}
				if (this.value.free) {
					//若无该天的时间，则增加该天
					if (index == -1) {
						var newday = {
							DayOfWeek: this.value.dayofweek,
							Time: []
						}
						self.Freetimes().push(newday)
						index = self.Freetimes().length - 1;
					}
					var times = self.Freetimes()[index].Time;
					times.push(this.value.hour); //增加该时间段
				} else {
					if (index >= 0) {
						var times = self.Freetimes()[index].Time;
						var len = times.length;
						for (var i = 0; i < len; i++) {
							if (times[i] == this.value.hour) {
								times.splice(i, 1); //移除该时间段
								if (times.length == 0) { //若改天无数据，则移除该天
									self.Freetimes().splice(index, 1);
								}
							}
						}
					}
				}
				//console.log(this.value.free);
			}
			if (value.free) {
				element.className = 'busytime';
			} else {
				element.className = 'freetime';
			}
		}
	}

	//保存可授课时间
	self.SetFreetime = function() {
		var self = this;

		var ajaxUrl = common.gServerUrl + 'Common/Teacher?userID=' + getLocalItem('UserID');
		mui.ajax(ajaxUrl, {
			type: 'PUT',
			data: {
				FreetimeJson: JSON.stringify(self.Freetimes()),
				FreetimeRemark: self.FreetimeRemark()
			},
			success: function(responseText) {
				console.log(responseText);
				/*var freetimes = JSON.parse(responseText);
				self.Freetimes(freetimes);*/
			}
		});
		mui.back();
	}
}
ko.applyBindings(availableTime);