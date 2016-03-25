var informationList = function() {
	var self = this;
	
	var userID = getLocalItem('UserID');
	userID = 37;
	
	self.newsList = ko.observableArray([]); //列表数组
	self.displayCheck = ko.observable(false);
	
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
		var url = common.gServerUrl + 'API/News/GetAPPNewsList?userid=' + userID;
		mui.ajax(url, {
			type: 'GET',
			success: function(responseText) {
				var result = JSON.parse(responseText);
				result.forEach(function(item) {
						var obj = {
							info: item,
							selected: ko.observable(false)
						};
						self.newsList.push(obj);
				});
				self.clampText();
			}
		});
	}();
	
	//删除列表
	self.deleteNews = function() {
		self.displayCheck(true);
	}
	
	//跳转详情
	self.gotoInformationDetail = function() {
		mui.toast('gotoInfo');
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
		if( self.displayCheck() ) {
			self.selectOne(data);
		} else {
			self.gotoInformationDetail(data);
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
		
	}
};

ko.applyBindings(informationList);
