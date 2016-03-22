var viewModel = function() {
	var self = this;
	var ID = 0;
	self.calendarList = ko.observableArray([]);
	
	self.getCalendarList = function() {
		var calendarUrl = common.gServerUrl + 'Common/ActivitySchedule/ActivityScheduleByActivityID?ActivityID=' + ID;
		mui.ajax(calendarUrl, {
			dataType: 'json',
			type: "GET",
			success: function(responseText) {
				self.calendarList(responseText);
			}
		});
	};
	
	mui.plusReady(function() {
		var web = plus.webview.currentWebview();
		if (typeof(web.aid) !== "undefined") {
			ID = web.aid;
		}
		self.getCalendarList();
	});
	
};

ko.applyBindings(viewModel);
