var my_student = function() {
	var self = this;
	self.ID = ko.observable(0);
	self.DisplayName = ko.observable('请登录');
	self.Photo = ko.observable('../../images/my-default.png');
	self.FavCount = ko.observable(0);
	self.UserID = ko.observable(getLocalItem('UserID'));
	self.UserType = ko.observable(getLocalItem('UserType'));

	self.goMyUserAttented = function() { //关注
		common.transfer('myAttended.html', true, {}, true);
	}
	self.goMyinfo = function() { //个人详细信息
		common.transfer('myInfo.html', true, {}, true, false);
	}
	self.goMoreInfo = function() { //更多
		common.transfer('moreInfo.html', false, {}, true);
	}
	self.goMyOrders = function() { //订单
		common.transfer('myOrders.html', true,{Photo:self.Photo()});
	}
	self.goMyDownloads = function() { //下载
		common.transfer('../works/mydownloadHeader.html', true);
	}
	self.goMessageList = function() { //消息
		common.transfer('messageList.html', true);
	}
	self.goMyAttention = function() { //收藏
		common.transfer('myAttention.html', true);
	}
	self.goHelp = function() { //帮助
		common.transfer('../my/help.html', false);
	}
	self.qrcodeEvent = function() {
		if(self.UserID()>0){
			common.transfer("qrcode.html",false,{},false,true);
		}else{
			mui.toast("亲~，登录后才能扫一扫")
		}
	}
	self.getStudent = function() { //获取资料
		var ajaxUrl = common.gServerUrl + "API/Account/GetInfo?userid=" + self.UserID() + "&usertype=" + self.UserType();
		mui.ajax(ajaxUrl, {
			dataType: 'json',
			type: 'GET',
			success: function(responseText) {
				//console.log(responseText);
				self.ID(responseText.ID);
				self.DisplayName(responseText.DisplayName);
				if (responseText.Photo)
					self.Photo(common.getPhotoUrl(responseText.Photo));
				self.FavCount(responseText.FavCount);
				//self.UserID(responseText.UserID);
			}
		})
	};
	
		//跳转到作品详情页面
	self.goWorksDetails = function(data) {
			common.transfer("WorksDetails.html", false, {
				works: data
			}, false, false)
		}
	
	mui.plusReady(function() {
		if (self.UserID() > 0) {
			self.getStudent();
		}
	});
	
	window.addEventListener('refreshMyinfo', function(event) {
		if (event.detail.userScore != "") {
			self.Score(event.detail.userScore);
		}
		if (event.detail.displayName != "") {
			self.DisplayName(event.detail.displayName);
		}
		if (event.detail.imgPath != "") {
			self.Photo(event.detail.imgPath);
		}
	});
	
	mui.back = function() {
		var qrp = document.getElementById("qrcodePopover");
		if (qrp.className.indexOf("mui-active") > 0) {
			mui('#qrcodePopover').popover('toggle');
		} else {
			common.confirmQuit();
		}
		
	}
}

ko.applyBindings(my_student);
var qrcode = new QRCode(document.getElementById("qrcode"), {
	width: 200, //设置宽高
	height: 200
});

qrcode.makeCode(common.gWebsiteUrl+'modules/student/studentInfo.html?id=' + self.UserID());