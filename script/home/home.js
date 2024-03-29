var home = function() {
	var self = this;
	var teacherTest;
	self.Teachers = ko.observableArray([]);
	self.Orgs = ko.observableArray([]);
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
	self.newsTitleArray = ko.observableArray([]);

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
		common.transfer('../news/newsListHeader.html', false, {}, false, false);
	}

	self.clampDes = function() {
		var intros = document.getElementsByClassName('teacher-list-p1');
		var introsLen = intros.length;
		for (var i = 0; i < introsLen; i++) {
			$clamp(intros[i], {
				clamp: 2
			});
		}
	}

	self.gotoActivityWorks = function() {
		common.transfer('../activity/activityInfo.html', false, {
			aid: 73
		});
	}

	self.goHelp = function() {
		var gotoUrl = 'homeworkGuide-S.html';
		if (getLocalItem('UserType') == common.gDictUserType.teacher) {
			gotoUrl = 'homeworkGuide-T.html';
		}
		common.transfer(gotoUrl, false);
	}

	//跳转至老师详情
	self.gotoTeacher = function() {
		common.transfer('../../modules/teacher/teacherInfo.html', false, {
			teacherID: this.UserID
		}, false, false);
	}

	//跳转机构详情
	self.gotoOrgDetail = function(data) {
		common.transfer('../org/orgInfo.html', false, {
			oid: data.ID
		}, false, false);
	};

	//跳转至所有科目
	self.gotoMore = function() {
		/*common.transfer('../../modules/account/binding.html');
		return;*/
		common.transfer('../../modules/home/allSubject.html');
	}

	//跳转至消息页面
	self.goMessageList = function() {
		common.gotoMessage();
		//		var page5 = common.getIndexChild(4);
		//		if (page5) {
		//			mui.fire(page5, 'refreshMessageStatusFalse', {});
		//		}
	}

	self.gotoCourseList = function() {
		common.transfer('../course/orgCourseList.html', false);
	}

	self.gotoVIP = function() {
		common.transfer('../home/gallery.html', false);
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
		/*if(typeof teacherTest=='undefined'){
			teacherTest = common.preload('../../modules/teacher/teacherListHeader.html', {}, 'teacherListHeader.html')
		}
		teacherTest.show();*/
		common.transfer('../../modules/teacher/teacherListHeader.html', false, {}, false, false, 'teacherListHeader.html');
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

	//首页新闻资讯轮播
	self.getHeadlineNewsList = function() {
		var ajaxUrl = common.gServerUrl + 'Common/News/GetHeadlineNewsList';
		mui.ajax(ajaxUrl, {
			type: 'GET',
			success: function(responseText) {
				var result = JSON.parse(responseText);
				marqueeText(22, 50, 4000, result.length);
				self.newsTitleArray(result);
				self.newsTitleArray.push(result[0]);
				
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
				msgLastTime: getLocalItem('msgLastTime'),
				orgCount: 4
			},
			success: function(responseText) {
				var result = responseText;
				self.activitys(result.Activities);
				self.slideshow(result.Sliders);
				self.initSlidershow();
				self.Teachers(result.Teachers);
				self.Orgs(result.Orgs);
				self.clampDes();
				self.UnreadCount(result.MessageCount);
				plus.runtime.setBadgeNumber(result.MessageCount);
				self.getUserID(getLocalItem('UserID'));
				self.getHeadlineNewsList();
				common.showCurrentWebview();
				plus.navigator.closeSplashscreen(); //关闭启动界面
				//teacherTest = common.preload('../../modules/teacher/teacherListHeader.html', {}, 'teacherListHeader.html')
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

	//机构
	self.goOrgList = function() {
		common.transfer('../org/orgList.html');
	}

	//精品班/名师讲座
	self.goActivityList = function() {
		mui.fire(plus.webview.getWebviewById('modules/activity/activityList.html'), 'setActive', {
			activePage: 1
		})
		common.showIndexWebview(1);

	}

	//高考培训
	self.goorgToCourseList = function() {
		common.transfer('../course/orgCoursesListHeader.html', false, {}, false, false);
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
		//		plus.runtime.setBadgeNumber(0);
		/*self.getSlideshow();
		self.getTeachers();
		self.getActivity();*/
		self.getHomeData();
		//teacherList=plus.webview.create('../../modules/teacher/teacherListHeader.html')
	});

	mui.back = function() {
		common.confirmQuit();
	}

	var marquee = $A.gI('marquee-view');
	var scrollRow = function(height, speed) {
			setTimeout(function() {
				marquee.scrollTop++;
				if (marquee.scrollTop % height !== 0) {
					scrollRow(height, speed);
				}
			}, speed);
		}
		/**
		 * 
		 * @param {Number} height 滚动的高度（px）
		 * @param {Number} speed  滚动的速度（毫秒）
		 * @param {Number} inter  滚动的间隔 （毫秒）
		 * @param {Number} count  滚动的条目数 （毫秒）
		 */
	function marqueeText(height, speed, inter, count) {
		scrollRow(height, speed);
		setInterval(function() {
			scrollRow(height, speed);
			if (marquee.scrollTop === count * height) {
				marquee.scrollTop = 0;
			}
		}, inter);
	}
	

	window.addEventListener("refreshMessage", function(event) {
		self.UnreadCount(event.detail.count);
	});

};
ko.applyBindings(home);