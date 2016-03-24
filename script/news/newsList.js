var informationList = function() {
	var self = this;
	
	self.newsList = ko.observableArray([]); //列表数组
	
	//获取资讯列表
	self.getNewsList = function() {
		var url = common.gServerUrl + 'API/News/GetAPPNewsList';
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
	
	//跳转我的资讯
	self.gotoMyInformation = function() {
		
	}
	
	//跳转发布资讯
	self.gotoAddInformation = function() {
		
	}
	
	//跳转个人信息
	self.gotoInfo = function() {
		
	}
};

ko.applyBindings(informationList);
