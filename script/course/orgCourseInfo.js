var orgCourseInfo=function(){
	var self=this;
	self.ID=ko.observable();
	self.OrgID = ko.observable(1);//机构id
	self.CourseName = ko.observable(1);//课程名称
	self.CourseAbout = ko.observable(1);//课程简介
	self.Introduce = ko.observable(1);//课程介绍
	self.RegStudent = ko.observable(1);//报名人数
	self.RegMoney = ko.observable(1);//报名费用
	self.NowRegStudent=ko.observable();//已报名人数
	self.OrgName=ko.observable();//机构名称
	self.UserFavCount=ko.observable();
	self.Photo=ko.observable();	
	
	self.getCourseInfo=function(){
		var ajaxUrl=common.gServerUrl+'API/Org/OrgCourseInfoByID?courseId='+self.ID();
		mui.ajax(ajaxUrl,{
			type:'GET',
			success:function(responseText){
				var result=JSON.parse(responseText);
				console.log(JSON.stringify(result));
				self.OrgID(result.OrgID);
				self.CourseName(result.CourseName);
				self.CourseAbout(result.CourseAbout);
				self.Introduce(result.Introduce);
				self.RegStudent(result.RegStudent);
				self.RegMoney(result.RegMoney);
				self.NowRegStudent(result.NowRegStudent);
				self.OrgName(result.OrgName);
				self.UserFavCount(result.UserFavCount);
				self.Photo(result.Photo);
			}
		});
	}
	
	//关闭分享窗口
	self.closeShare = function() {
		mui('#sharePopover').popover('toggle');
	}

	//分享功能
	var ul = document.getElementById("sharePopover");
	var lis = ul.getElementsByTagName("li");
	for (var i = 0; i < lis.length; i++) {
		lis[i].onclick = function() {
			mui('#sharePopover').popover('toggle');
			plus.nativeUI.showWaiting();
			//Share.sendShare(this.id, shareTitle, shareContent, shareUrl + TUserID, shareImg, common.gShareContentType.teacher);

		};
	}
	
	//跳转至机构详情
	self.goOrg=function(){
		common.transfer('../org/orgInfo.html',false,{
			oid:self.OrgID
		})
	}
	
	//报名
	
	
	
	mui.plusReady(function(){
		var thisWeb=plus.webview.currentWebview();
		if(typeof thisWeb.cid !=='undefined'){
			self.ID(thisWeb.cid);
		}
		self.getCourseInfo();
	})
}
ko.applyBindings(orgCourseInfo);
