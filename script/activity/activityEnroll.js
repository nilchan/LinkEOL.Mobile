var viewModel = function() {
	var self = this;
	
	var guideTeacher = new mui.PopPicker();
	var ID;
	var addWorkFlag = false;
	
	self.userID 		  = getLocalItem('UserID');
	self.recommendTeacher = ko.observable('');
	self.guideTeacherID   = ko.observable(0);
	self.guideTeacherName = ko.observable('请选择指导老师');
	self.subjectID        = ko.observable(0);
	self.subjectName      = ko.observable('');
	
	
	self.getGuideTeacher = function() {
		guideTeacher.show(function(items) {
			self.guideTeacherID(items[0].value);
			self.guideTeacherName(items[0].text);
			self.subjectID(items[0].sid);
			self.subjectName(items[0].sname);
		});
	}
	
	self.getActivity = function() {
		mui.ajax(common.gServerUrl + "API/Activity/GetActivityInfoByID?ID=" + ID, {
			dataType: 'json',
			type: "GET",
			success: function(responseText) {
				var tmpTeachers = [];
				addWorkFlag = responseText.NeedWorks;
				if(common.StrIsNull(responseText.Subjects) != ''){
					var subjectsJsonO = JSON.parse(responseText.Subjects);
					subjectsJsonO.forEach(function(item){
						var teacher = {
							value: 0,
							text: '',
							sid: 0,
							sname: ''
						}
						teacher.value = item.UserID;
						teacher.text = item.DisplayName;
						teacher.sid = item.SubID;
						teacher.sname = item.SubName;
						tmpTeachers.push(teacher);
					});
					guideTeacher.setData(tmpTeachers);
				}
			}
		})
	};
	
	self.gotoEnrollSuccess = function() {
		if(self.guideTeacherID() == 0){
			mui.toast('请选择指导老师');
			return;
		}
		
		var url = common.gServerUrl + "API/ActivityRegister";
		var s = '[{"SubID":"'+self.subjectID()+'","SubName":"'+self.subjectName()+'","UserID":"'+self.guideTeacherID()+'","DisplayName":"'+self.guideTeacherName()+'"}]';
		
		mui.ajax(url, {
			dataType: 'json',
			type: "POST",
			data: {
				"ActivityID": ID,
				"UserID": self.userID,
				"Subjects": s,
				"TeacherID": self.guideTeacherID(),
				"TeacherName": self.guideTeacherName(),
			},
			success: function(responseText) {
				if( addWorkFlag ) {
					common.transfer('/modules/works/addWorks.html', true, {
						aid: ID
					});
				} else {
					common.transfer('activityEnrollSuccess.html', true, {
						aid: ID,
						needWorks: addWorkFlag
					});
				}
			}
		});
	}
	
	mui.plusReady(function() {
		var web = plus.webview.currentWebview();
		if (typeof(web.aid) !== "undefined") {
			ID = web.aid;
		}
		self.getActivity();
	});
}

ko.applyBindings(viewModel);
