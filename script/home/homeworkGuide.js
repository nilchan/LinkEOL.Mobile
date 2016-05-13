var homeworkGuide = function() {
	var self = this;
	
	self.guideInfoS = ko.observableArray([{"Orgs": "", "TeachRelations": "", "Works": "", "Comments": "", "Messages": ""}]);
	self.guideInfoT = ko.observableArray([]);

	self.getHomeworkGuideInfo = function() {
		if(!common.hasLogined()) return;
		
		mui.ajax(common.gServerUrl + "API/Common/GetHomeworkGuideInfo", {
			dataType: 'json',
			type: "GET",
			success: function(responseText) {
				var result = responseText;
				if(result.UserType == common.gDictUserType.student){
					self.guideInfoS(result);
				}
				else if(result.UserType == common.gDictUserType.teacher){
					self.guideInfoT(result);
				}
			}
		});
	};

	//跳转个人信息
	self.gotoMyInfo = function() {
		common.transfer('../my/myInfo.html', true, {}, false, false);
	}

	//跳转设置授课老师
	self.gotoInstructTeacher = function() {
		common.transfer('../my/myTeacherList.html', true, {}, false, false);
	}

	//跳转设置授课学生
	self.gotoInstructStudent = function() {
		common.transfer('../my/myStudentList.html', true, {}, false, false);
	}

	//跳转上传作品
	self.gotoAddWorks = function() {
		common.transfer('../works/addWorks.html', true, {}, false, false);
	}

	//跳转交作业
	self.gotoHomeWork = function() {
		common.transfer('../works/worksList.html', true, {
			displayCheck: true,
			homeWork: true
		}, false, true);
	}

	//跳转消息列表
	self.gotoMessageList = function() {
		common.transfer('../my/messageList.html', true, {}, false, true);
	}

	//跳转作业点评
	self.goHomeWorkComment = function() { //作业点评
		common.transfer('../comment/commentListHeader.html', true, {
			workType: common.gTeacherCommentType[1].value
		}, false, false);
	}
	
	//跳转收支明细
	self.gotoAccountDetails = function() {
		common.transfer('../my/accountDetailsHeader.html', true, {}, false, true);
	}

	mui.plusReady(function() {
		self.getHomeworkGuideInfo();
	});

	window.addEventListener("refreshGuideInfo", function(event) {
		self.getHomeworkGuideInfo();
	});

};
ko.applyBindings(homeworkGuide);