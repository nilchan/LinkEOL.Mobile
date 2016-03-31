var informationList = function() {
	var self = this;
	
	var userID = getLocalItem('UserID');
	
	self.newsList = ko.observableArray([]); //列表数组
	self.userName = ko.observable('我');
	self.displayCheck = ko.observable(false);
	self.isAuthor = ko.observable('false');
	
	//限制行数
	self.clampText = function() {
		var intros = document.getElementsByClassName('informationList-h3');
		for (var i = 0; i < intros.length; i++) {
			$clamp(intros[i], {
				clamp: 2
			});
		}
	}
	
	//获取资讯列表
	self.getNewsList = function() {
		var url = common.gServerUrl + 'API/News/GetAPPNewsList?userid=' + userID + '&pageSize=1000';
		mui.ajax(url, {
			type: 'GET',
			success: function(responseText) {
				self.newsList([]);
				var result = JSON.parse(responseText);
				result.forEach(function(item) {
						var obj = {
							info: item,
							selected: ko.observable(false)
						};
						self.newsList.push(obj);
				});
				self.clampText();
				common.showCurrentWebview();
			}
		});
	};
	
	//删除列表
	self.deleteNews = function() {
		self.displayCheck(true);
	}
	
	//跳转详情
	self.gotoInformationDetail = function(id) {
		common.transfer('newsDetail.html',false,{
			newsId:id
		},false,false);
	}
	
	//跳转个人信息
	self.gotoInfo = function() {
		var user = this;
		if (user.UserType == common.gDictUserType.teacher) {
			common.transfer('../../modules/teacher/teacherInfo.html', false, {
				teacherID: user.ID
			}, false, false);
		} else if (user.UserType == common.gDictUserType.student) {
			common.transfer('../../modules/student/studentInfo.html', false, {
				studentID: user.ID
			}, false, false);
		}
	}
	
	//选择列表
	self.selectOne = function(data) {
		if (data.selected()) {
			data.selected(false);
		} else {
			data.selected(true);
		}
	}
	
	//点击列表
	self.clickOne = function(data) {
		var id = data.info.ID;
		if( self.displayCheck() ) {
			self.selectOne(data);
		} else {
			self.gotoInformationDetail(id);
		}
	}
	
	//取消选择
	self.cacelSelect = function() {
		self.displayCheck(false);
		for (i in self.newsList()) {
			self.newsList()[i].selected(false);
		}
	}
	//提交选择
	self.submitSelect = function() {
		var sID = [];
		for (i in self.newsList()) {
			if (self.newsList()[i].selected()) {
				sID.push(self.newsList()[i].info.ID);
			}
		}
		if (sID.length === 0) {
			mui.toast("请至少选择一个资讯！");
			return;
		}
		plus.nativeUI.showWaiting();
		var url = common.gServerUrl + 'API/News/APPNewsDel';
		mui.ajax(url, {
			type: 'DELETE',
			contentType: "application/json",
			data: JSON.stringify(sID),
			success: function(responsText) {
				mui.toast('操作成功');
				self.cacelSelect();
				self.getNewsList();
				plus.nativeUI.closeWaiting();
			}
		});
	}
	
	//判断是否作者
	self.judgeAuthor = function() {
		if( userID === getLocalItem('UserID') ) {
			self.isAuthor(true);
		} else {
			self.isAuthor(false);
		}
	}
	
	mui.plusReady(function() {
		var web = plus.webview.currentWebview();
		if (typeof(web.userid) !== "undefined") {
			userID = web.userid;
			self.userName(web.userName);
		}
		self.getNewsList();
		self.judgeAuthor();
	});
	
	mui.init({
		beforeback: function() {
			var parent = plus.webview.currentWebview().opener();
			mui.fire(parent, 'refreshNews', {});
			return true;
		}
	});
};

ko.applyBindings(informationList);
