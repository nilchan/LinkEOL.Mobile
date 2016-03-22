var viewModel = function() {
	var self = this;
	var ID = 10;
	self.rehearsalList = ko.observableArray([]);
	
	self.getRehearsalList = function() {
		var rehearsalUrl = common.gServerUrl + 'Common/ActRehearsal/ActRehearsalByActivityID?ActivityID=' + ID;
		mui.ajax(rehearsalUrl, {
			dataType: 'json',
			type: "GET",
			success: function(responseText) {
				self.rehearsalList(responseText);
			}
		});
	};
	
	mui.plusReady(function() {
		var web = plus.webview.currentWebview();
		if (typeof(web.aid) !== "undefined") {
			ID = web.aid;
		}
		self.getRehearsalList();
	});
	
};

ko.applyBindings(viewModel);
