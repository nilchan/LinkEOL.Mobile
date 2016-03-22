var worksIndex = function() {
	var self = this;
	var imgNo=1;
	self.isTeacher = ko.observable(false); //是否老师身份
	self.taskType = ko.observable("我的作业"); //tasks作业的意思
	self.worksBannerImg=ko.observable("../../images/workIndex1.jpg");
	self.myComment=ko.observable("上传作业");
	
	//跳转到上传作品页面
	self.goUpworks = function() {
		common.transfer("addWorks.html", true, common.extrasUp(0), false, false);
	}

	//跳转到上传作业页面
	self.goUptasks = function() {
		common.transfer("addWorks.html", true, common.extrasUp(1), false, false);
	}

	//跳转至意见反馈
	self.goFeedBack=function(){
		if(getLocalItem('UserID')>0){
			common.transfer('../my/feedBack.html');
		}else{
			mui.toast("登录后才能反馈意见~");
		}
	}
	
	self.goAllworks = function() {
		removeLocalItem('tmp.activityWorkID');
		common.transfer("worksListAllHeader.html",false,{
		},false,false);
		
	}
	
	//跳转到名师老师作品 页面
	self.goWorksFamousTea = function() {
		removeLocalItem('tmp.activityWorkID');
		common.transfer("worksListAllHeader.html",false,{
			WorkUserType:common.gDictUserType.teacher,
			isFamous:common.gTeacherWorksFamous[2].value
		},false,false);
		
	}
	
	//跳转到专业老师作品 页面
	self.goWorksMajorTea = function() {
		removeLocalItem('tmp.activityWorkID');
		common.transfer("worksListAllHeader.html",false,{
			WorkUserType:common.gDictUserType.teacher,
			isFamous:common.gTeacherWorksFamous[1].value
		},false,false);
		
	}
	
	//跳转到所有学生作品 页面
	self.goAllworksStudent = function() {
		removeLocalItem('tmp.activityWorkID');
		common.transfer("worksListAllHeader.html",false,{
			WorkUserType:common.gDictUserType.student
		},false,false);
		
	}
	
	mui.plusReady(function() {
		imgNo=Math.round(Math.random()*3+1);
		self.worksBannerImg("../../images/workIndex"+imgNo+".jpg");
		if (getLocalItem('UserID') > 0) {
			var current = plus.webview.currentWebview();
			if (common.gDictUserType.teacher == getLocalItem("UserType")) {
				self.taskType("学生作业");
				self.myComment("我的点评");
				self.isTeacher(true);
			}
		}

	})
	

	
	//退出按钮
	mui.back = function() {
		common.confirmQuit();
	}
}
ko.applyBindings(worksIndex);