var examNotice = function() {
	var self = this;
	var examEnroll;
	var examid = 0;

	self.examInfo = ko.observableArray([]); //考级信息
	self.IsCanRegister = ko.observable(true); //是否可以注册
	self.IsUserStatNew = ko.observable(false); //考级记录状态
	self.examFeeArray = ko.observableArray([]); //考级级别费用信息
	self.ExamContactsArray = ko.observableArray([]); //考级联系人信息
	self.searchGradeTimeText = ko.observable(''); //查询考场日期文字

	//分享的参数
	var shareTitle = "民乐考级，你实力的最好证明";
	var shareContent = "民乐考级报名入口";
	var shareUrl = "http://mp.weixin.qq.com/s?__biz=MzIwOTA4MDMzOA==&mid=407221960&idx=1&sn=e98eb33d137aa83a227cf63894ff5f8b#rd";
	var shareImg = "";

	//获取考级信息
	self.getExamInfo = function() {
		var userid = getLocalItem("UserID");
		if (common.StrIsNull(userid) == '') {
			userid = 0;
		}

		mui.ajax(common.gServerUrl + "Common/Exam/ExamInfo?userid=" + userid + '&examid=' + examid, {
			Type: 'GET',
			success: function(responseText) {
				var result = JSON.parse(responseText);
				var RegEndTime = result.RegEndTime.split(' ')[0].split('-');
				regEndtime = RegEndTime.join('');
				var nowDate = common.getNowDate().split(' ')[0].split('-');
				nowDatetime = nowDate.join('');
				if (Number(nowDatetime) > Number(regEndtime)) {
					self.IsCanRegister(false);
				}
				self.examInfo(result);
				self.IsUserStatNew(self.examInfo().IsUserStat);
				//console.log(JSON.stringify(self.examInfo()));
				if (self.examInfo().SearchGradeNumTimeChar != '') {
					self.searchGradeTimeText('(' + self.examInfo().SearchPlaceTimeChar.split('年')[1] + '开放)');
				}

				var ExamFee = eval("(" + result.ExamFee + ")");
				var Contacts = eval("(" + result.Contacts + ")");
				ExamFee.sort(function(a, b) {
					return Number(a.Id) > Number(b.Id) ? 1 : -1;
				})
				self.examFeeArray(ExamFee);
				self.ExamContactsArray(Contacts);
				common.showCurrentWebview();
				examEnroll = common.preload("examEnroll.html", {
					subjectArray: self.examInfo().Subject,
					examid: self.examInfo().ID,
					ExamFee: self.examInfo().ExamFee
				});
				//common.showCurrentWebview();
			}

		})
	}

	//跳转至报名入口
	self.goExamEnroll = function() {
		if (getLocalItem('UserID') > 0) {
			if (self.IsCanRegister() == false) {
				mui.toast("已经过了报名时间，欢迎下次报名~");
				return;
			}
			examEnroll.show();
		} else {
			common.transfer('../account/login.html');
		}

		/*common.transfer("examEnroll.html", true, {
			subjectArray: self.examInfo().Subject,
			examid: self.examInfo().ID,
			ExamFee: self.examInfo().ExamFee

		});*/
	}

	//跳转至查询成绩页面
	self.goExamScore = function() {
		if (self.examInfo().IsGrade) {
			common.transfer("examScore.html", true, {
				examid: self.examInfo().ID
			})
		} else {
			mui.toast("尚未到查询时间，请耐心等待...");
		}

	}

	//跳转至报名记录列表
	self.goexamEnrollList = function() {
		if (self.IsUserStatNew()) {
			common.transfer("examEnrollList.html", true, {
				examid: self.examInfo().ID
			})
		} else {
			mui.toast("尚未报名，请先报名...");
		}

	}

	//跳转至查询考场
	self.gotoExamplace = function() {
		if (self.examInfo().IsPlace) {
			common.transfer("examPlace.html", true, {
				examid: self.examInfo().ID
			})
		} else {
			mui.toast("尚未到查询时间，请耐心等待...");
		}
	}



	//关闭分享窗口
	self.closeShare = function() {
		mui('#sharePopover').popover('toggle');
	}

	//分享考级信息
	var ul = document.getElementById("sharePopover");
	var lis = ul.getElementsByTagName("li");
	for (var i = 0; i < lis.length; i++) {
		lis[i].onclick = function() {
			//console.log('123');
			Share.sendShare(this.id, shareTitle, shareContent, shareUrl, shareImg);
			mui('#sharePopover').popover('toggle');
		};
	}

	window.addEventListener('refreshEnroll', function(event) {
		if(event.detail.enrollId>0 && typeof event.detail.IsUserStat!="undefined"){
			self.IsUserStatNew(event.detail.IsUserStat);
		}
		//self.PhotoCount(event.detail.PhotoCount);
		//console.log(event.detail.IsUserStat);
		//self.examInfo().IsUserStat = event.detail.IsUserStat;
		//console.log(self.IsUserStatNew());
	});
	
	window.addEventListener('reloadNotice', function(event) {
		self.getExamInfo();
	});


	mui.plusReady(function() {
		var thiswebview = plus.webview.currentWebview();
		if (typeof(thiswebview.eid) != "undefined") {
			examid = thiswebview.eid;
		}
		self.getExamInfo(); //获取考级信息
		Share.updateSerivces(); //初始化分享服务
	})


}
ko.applyBindings(examNotice);