var viewModel = function() {
	var self = this;
	self.subjectText = ko.observable("请选择科目");
	self.starText = ko.observable("请选择星级");
	var subjectName, starName;
	var Subject, starID;
	mui.plusReady(function() {
		subjectName = new mui.PopPicker({
			layer: 2
		});
		subjectName.setData(common.getAllSubjectsBoth());

		starName = new mui.PopPicker();
		starName.setData(common.gJsonTeacherLever);
		self.starText(common.gJsonTeacherLever[0].text);
		self.starID = common.gJsonTeacherLever[0].value;
	});
	//科目获取
	self.setSubject = function() {
		subjectName.show(function(items) {
			self.subjectText(items[1].text);
			Subject = items[1];
		});
	};
	self.setStar = function() {
		starName.show(function(items) {
			self.starText(items[0].text);
			starID = items[0];
		});
	};
	self.gotoTeacherList = function() {
		if( typeof(self.Subject) === "undefined" ) {
			mui.toast("请选择科目");
			return ;
		}
		if( typeof(self.starID) === "undefined" ) {
			mui.toast("请选择星级");
			return ;
		}
		
		common.transfer("../../modules/teacher/teacherListHeader.html", false, {
			Subject: self.Subject,
				starText: self.starID
		});
	};
}

ko.applyBindings(viewModel);