var viewModelIndex = function() {
	var self = this;
	self.UserName = ko.observable(getLocalItem('UserName'));
	self.UserID = ko.observable(getLocalItem('UserID'));
	self.UserType = ko.observable(getLocalItem('UserType'));
	self.UnreadCount = ko.observable(0);
	self.MyHref = ko.observable('modules/my/myInfoStudent.html');
	self.hasNewMessage = ko.observable(false);
	//self.worksList = ko.observable('modules/works/worksListHeader.html');
	self.worksText = ko.observable('作品作业');

	if (self.UserType() != common.gDictUserType.teacher) {
		self.worksText('作品作业');
	}
	//跳转至消息页面
	self.goMessageList = function() {
		common.gotoMessage();
	}

	//获取未读消息数量
	self.getUnreadCount = function() {
		var self = this;
		common.getUnreadCount(function(count) {
			self.UnreadCount(count);
		});
	}

	mui.plusReady(function() {
		common.autoRefreshMessage(60000);
		common.getPushInfo();
		common.getLocalVersion();
		common.getAllSubjectsStr();
	});

	function outSet(str) {
		mui.toast(str);
		
	}

	document.addEventListener("plusready", function() {
		message = document.getElementById("message");
		// 监听点击消息事件
		plus.push.addEventListener("click", function(msg) {
			// 判断是从本地创建还是离线推送的消息
			switch (msg.payload) {
				case "LocalMSG":
					outSet("您有新消息，请查看通知列表~");
					break;
				default:
					outSet("您有新消息，请查看通知列表~");
					break;
			}
			common.refreshMessage();
			common.gotoMessage();
		}, false);

		// 监听在线消息事件
		plus.push.addEventListener("receive", function(msg) {
			if (msg.aps) { // Apple APNS message
				outSet("您有新消息，请查看通知列表~");
			} else {
				outSet("您有新消息，请查看通知列表~");
			}
			common.refreshMessage();
		}, false);
	}, false);
	
};
ko.applyBindings(viewModelIndex);