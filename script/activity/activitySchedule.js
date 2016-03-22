var viewModel = function() {
	var self = this;
	var ID = 10;
	self.scheduleList = ko.observableArray([]);
	
	self.getScheduleList = function() {
		var scheduleUrl = common.gServerUrl + 'Common/ActProgram/ActProgramByActivityID?ActivityID=' + ID;
		mui.ajax(scheduleUrl, {
			dataType: 'json',
			type: "GET",
			success: function(responseText) {
				self.scheduleList(responseText);
			}
		});
	};
	
	mui.plusReady(function() {
		var web = plus.webview.currentWebview();
		if (typeof(web.aid) !== "undefined") {
			ID = web.aid;
		}
		self.getScheduleList();
	});
	
};

ko.applyBindings(viewModel);
