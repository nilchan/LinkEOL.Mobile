var home = function() {
	var self = this;
	var teacherTest;
	self.Teachers = ko.observableArray([]);
	self.count = 3;
	self.UnreadCount = ko.observable(0);
	self.getUserID = ko.observable();
	self.indexSubject = ko.observableArray([]);
	self.slideshow = ko.observableArray([]);
	self.slideshowStarUrl = ko.observable();
	self.slideshowStarPic = ko.observable();
	self.slideshowEndUrl = ko.observable();
	self.slideshowEndPic = ko.observable();
	self.activitys = ko.observableArray([]);
	self.newsTitleArray =ko.observableArray([]);

	self.getTeachers = function() {
		mui.ajax(common.gServerUrl + "API/Teacher/GetIndexTeachers?count=" + self.count, {
			dataType: 'json',
			type: "GET",
			success: function(responseText) {
				//console.log(responseText);
				self.Teachers(responseText);
				self.clampDes();

				//common.showCurrentWebview();
			}
		});
	};
	
	//跳转新闻列表
	self.gotoNewsList = function() {
		common.transfer('../news/newsList.html', false);
	}

	self.clampDes = function() {
		var intros = document.getElementsByClassName('teacher-list-p1');
		var introsLen=intros.length;
		for (var i = 0; i < introsLen; i++) {
			$clamp(intros[i], {
				clamp: 2
			});
		}
	}

	self.gotoActivityWorks = function() {
		mui.toast('敬请期待~');
	}
	
	self.goHelp=function(){
		common.transfer('userGuide.html');
	}

	//跳转至老师详情
	self.gotoTeacher = function() {
		common.transfer('../../modules/teacher/teacherInfo.html', false, {
			teacherID: this.UserID
		}, false, false);
	}

	//跳转至所有科目
	self.gotoMore = function() {
		common.transfer('../../modules/home/allSubject.html');
	}

	//跳转至消息页面
	self.goMessageList = function() {
		self.UnreadCount(0);
		var page5 = common.getIndexChild(4);
		if (page5) {
			mui.fire(page5, 'refreshMessageStatusFalse', {});
		}
		common.gotoMessage();
	}

	//获取未读消息数量
	self.getUnreadCount = function() {
		common.getUnreadCount(function(count) {
			self.UnreadCount(count);
		});
	}

	//跳转老师列表
	self.gotoTeachers = function(indexS) {
		var udata;
		if (indexS) {
			udata = {
				id: indexS.id,
				subjectClass: indexS.subjectClass
			}
		}
		common.transfer('../../modules/teacher/teacherListHeader.html', false, {
			data: udata
		});
	}

	self.gotoTeacherTest = function() {
		//teacherTest.show();
		if(typeof teacherTest=='undefined'){
			teacherTest = common.preload('../../modules/teacher/teacherListHeader.html', {}, 'teacherListHeader.html')
		}
		teacherTest.show();
	}

	self.initSlidershow = function() {
		self.slideshowStarUrl(self.slideshow()[0].Url);
		self.slideshowStarPic(self.slideshow()[0].PicPath);
		var length = self.slideshow().length;
		self.slideshowEndUrl(self.slideshow()[length - 1].Url);
		self.slideshowEndPic(self.slideshow()[length - 1].PicPath);
		mui.init();
		var gallery = mui('.mui-slider');
		gallery.slider({
			interval: 5000
		});
	}

	self.getSlideshow = function() {
		mui.ajax(common.gServerUrl + "Common/Slider/GetList?module=10", {
			dataType: 'json',
			type: "GET",
			success: function(responseText) {
				self.slideshow(responseText);
				self.initSlidershow();

				//plus.navigator.closeSplashscreen(); //关闭启动界面
			}
		});
	}

	self.getActivity = function() {
		mui.ajax(common.gServerUrl + "API/Activity/GetActivityList?pageSize=4", {
			dataType: 'json',
			type: "GET",
			success: function(responseText) {
				self.activitys(responseText);
			}
		});
	};
	
	//首页新闻咨询轮播
	self.getHeadlineNewsList=function(){
		var ajaxUrl=common.gServerUrl+'Common/News/GetHeadlineNewsList';
		mui.ajax(ajaxUrl,{
			type:'GET',
			success:function(responseText){
				var result=JSON.parse(responseText);
				self.newsTitleArray(result);
			}
		})
	}

	self.gotoactivityList = function() {
		common.showIndexWebview(1, false);
	}

	gotoActivityInfo = function(data) {
		common.transfer('/modules/activity/activityInfo.html', false, {
			aid: data.ID
		});
	}

	//四合一的请求
	self.getHomeData = function() {
		var ajaxUrl = common.gServerUrl + "API/Common/GetHomeData";
		mui.ajax(ajaxUrl, {
			dataType: 'json',
			type: "GET",
			data: {
				userId: getLocalItem('UserID'),
				sliderModule: 10,
				teacherCount: 4,
				activityCount: 4,
				msgLastTime: getLocalItem('msgLastTime')
			},
			success: function(responseText) {
				var result = responseText;
				self.activitys(result.Activities);
				self.slideshow(result.Sliders);
				self.initSlidershow();
				self.Teachers(result.Teachers);
				self.clampDes();
				self.UnreadCount(result.MessageCount);
				self.UnreadCount(0);
				self.getUserID(getLocalItem('UserID'));
				self.getHeadlineNewsList();
				common.showCurrentWebview();
				plus.navigator.closeSplashscreen(); //关闭启动界面
				teacherTest = common.preload('../../modules/teacher/teacherListHeader.html', {}, 'teacherListHeader.html')
			}
		});
	};


	self.gotoweb = function(ss) {
		if (common.StrIsNull(ss.Url) == "") {
			return;
		}
		if (ss.Url[0] == '/') {
			var id = parseInt(common.getQueryStringByName('id', ss.Url));
			if (id > 0) {
				common.transfer(ss.Url, false, {
					aid: id
				});
			} else {
				common.transfer(ss.Url, false);
			}

		} else {
			common.transfer('web.html', false, {
				url: ss.Url
			});
		}

	}

	//跳转至考级页面
	self.gotoExam = function() {
		//mui.toast('敬请期待~');
		//return;
		//common.transfer("../exam/examNotice.html", false, {}, false, false);
		common.transfer("../exam/examList.html", false, {}, false, true);
	}


	self.indexSubject(common.getAllSubjectsIndex());

	var teacherList;
	mui.plusReady(function() {
		$A.gC('index-banner')[0].style.height = document.body.clientWidth * 7 / 15 + 'px';
		plus.runtime.setBadgeNumber(0);
		/*self.getSlideshow();
		self.getTeachers();
		self.getActivity();*/
		self.getHomeData();
		//teacherList=plus.webview.create('../../modules/teacher/teacherListHeader.html')

	});

	mui.back = function() {
		common.confirmQuit();
	}

	window.addEventListener("refreshMessageStatus", function(event) {
		self.UnreadCount(1);
		self.getUnreadCount();
	});

	window.addEventListener("refreshMessageStatusFalse", function(event) {
		self.UnreadCount(0);
	});


};
ko.applyBindings(home);