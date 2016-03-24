var informationList = function() {
	var self = this;
	
	var userID = getLocalItem('UserID');
	userID = 37;
	
	self.newsList = ko.observableArray([]); //列表数组
	
	//获取资讯列表
	self.getNewsList = function() {
		var url = common.gServerUrl + 'API/News/GetAPPNewsList?userid=' + userID;
		mui.ajax(url, {
			type: 'GET',
			success: function(responsText) {
				self.newsList(JSON.parse(responsText));
				self.clampText();
			}
		});
	}();
	
	//限制行数
	self.clampText = function() {
		var intros = document.getElementsByClassName('informationList-h3');
		for (var i = 0; i < intros.length; i++) {
			$clamp(intros[i], {
				clamp: 2
			});
		}
	}
	
	//跳转详情
	self.gotoInformationDetail = function() {
		
	}
};

ko.applyBindings(informationList);
