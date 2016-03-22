var examList = function() {
	var self = this;
	
	self.examListInfo = ko.observableArray([]);
	
	self.getExamList = function() {
		var url = common.gServerUrl + '/API/Exam/GetExamInfoList';
		mui.ajax(url, {
			type: 'GET',
			success: function(responseText) {
				self.examListInfo(JSON.parse(responseText));
			}
		});
	}();
	
	self.gotoExamNotice = function(data) {
		common.transfer('examNotice.html', false, {
			eid: data.ID
		},true,false);
	};
};

ko.applyBindings(examList);
