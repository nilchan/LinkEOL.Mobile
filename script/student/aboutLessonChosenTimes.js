var LessonChosenTimes = function() {
	var self = this;
	var beginHour = 8; //开始时间
	var endHour = 21; //结束时间
	self.Adjusting = ko.observable(false); //是否正在调整时间

	self.WeekIndex = ko.observable(0); //0：当前周；-1：上一周；1：下一周……
	self.Hours = ko.observableArray([]); //小时数组
	for (var i = beginHour; i <= endHour; i++) {
		self.Hours.push(i);
	}
	self.CurrentDay = ko.observable((new Date()).getDate()); //当前天
	self.CurrentMonth = ko.observable(newDate().getMonth()); //当前月
	self.DayOfWeek = ko.observableArray(['日', '一', '二', '三', '四', '五', '六']); //星期数组
	self.TheMonth = ko.computed(function() { //显示的月份
		//var self = this;
		var date = new Date();
		date.setDate(date.getDate() - date.getDay() + self.WeekIndex() * 7 + 6);
		return date.getMonth() + 1 + '月';
	}, self)
	self.BeginDate = ko.computed(function() { //开始日期
		//var self = this;
		var beginDate = new Date();
		beginDate.setDate(beginDate.getDate() - beginDate.getDay() + self.WeekIndex() * 7);
		return beginDate;
	})
	self.DateOfWeek = ko.computed(function() { //星期对应的日期
		//var self = this;
		var beginDate = new Date();
		var arr = new Array();
		beginDate.setDate(beginDate.getDate() - beginDate.getDay() + self.WeekIndex() * 7);
		for (var i = 0; i < 7; i++) {
			var tmpDate = newDate(beginDate);
			tmpDate.setDate(tmpDate.getDate() + i);
			arr.push(tmpDate);
		}

		return arr;
	})
	self.Freetimes = ko.observableArray([]); //所有可选课时
	//self.Chosen = ko.observable(false);		//是否已选择了课时
	self.ChosenTimes = ko.observableArray([]); //已选课时数组，元素必须为字符串格式，如'2015-09-17 14:00:00'

	//获取所有可授课时间
	self.GetData = function(teacherUesrID) {
		if(!teacherUesrID || teacherUesrID <= 0)
			return;
			
		var self = this;
		var ajaxUrl = common.gServerUrl + 'API/Teacher/GetFreetimeRemain?userid=' + teacherUesrID;
		
		mui.ajax(ajaxUrl, {
			type: 'GET',
			success: function(responseText) {
				var freetimes = JSON.parse(responseText);
				//console.log(responseText);
				self.Freetimes(freetimes);
			}
		})
	}

	mui.plusReady(function() {
		var web = plus.webview.currentWebview(); //页面间传值
		if(typeof(web.userID) !== "undefined") {
			self.GetData(web.userID);
		}
	})

	//选择课时后确定返回
	self.back = function() {
		//var self = this;
		if (self.ChosenTimes().length <= 0) {
			mui.toast('请选择至少一个课时');
		} else {
			mui('#popChooseTime').popover('toggle');
		}
	}

	//初始化课时单元格
	self.initCell = function(date, hour) {
		//var self = this;
		var ret = null;
		self.Freetimes().forEach(function(freetime) {
			if (self.WeekIndex() == freetime.WeekIndex && date.getDay() == freetime.DayOfWeek &&
				freetime.Time.indexOf(hour) >= 0) {
				ret = new Date(2000 + now.getYear() % 100, date.getMonth(), date.getDate());
				ret.setHours(hour);
				ret.setMinutes(0);
				ret.setSeconds(0);
				ret.setMilliseconds(0);
				
				ret = ret.format('yyyy-MM-dd hh:mm:ss');

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
			if (value) {
				if (self.ChosenTimes.indexOf(value) >= 0) {
					element.className = 'busytime';
				} else {
					element.className = 'freetime';
				}
				
				element.onclick = function() {
					if (self.ChosenTimes.indexOf(value) >= 0) {
						self.ChosenTimes.remove(value);
						element.className = 'freetime';
					} else {
						self.ChosenTimes.push(value);
						element.className = 'busytime';
					}
				}
			}
		}
	};
}
//ko.applyBindings(LessonChosenTimes, document.getElementById('popChooseTime'));