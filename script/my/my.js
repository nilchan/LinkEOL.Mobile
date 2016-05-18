var my = function() {
	var self = this;
	self.ID = ko.observable(0);
	self.DisplayName = ko.observable('登录');
	self.Photo = ko.observable('../../images/my-default.png');
	self.Province = ko.observable(''); //省份
	self.City = ko.observable(''); //城市
	self.District = ko.observable(''); //地区
	self.PhotoCount = ko.observable(0); //照片数量
	self.starCount = ko.observable(0); //星级
	self.UserID = ko.observable(getLocalItem('UserID'));
	self.UserType = ko.observable(getLocalItem('UserType'));
	self.Score = ko.observable(0); //我的关注
	self.auths = ko.observableArray([]); //认证数组
	self.IDAuthApproved = ko.observable(0);
	self.hasNewMessage = ko.observable(false); //有新消息
	self.isAllInfo = ko.observable(false);
	self.AccountBalance = ko.observable(0.00); //账户余额
	self.unReadMessage = ko.observable(0); //未读消息
	self.BankCardNum = ko.observable(0); //银行卡数量
	self.subjectID = ko.observable(); //科目id
	self.UserFavCount = ko.observable(0); //我的关注
	self.IDAuth = ko.observable(false); //身份认证
	self.inviteCode = ko.observable(''); //邀请码
	self.IsFamous = ko.observable(false);
	self.ProTitleAuth = ko.observable(false);
	self.EduAuth = ko.observable(false);
	self.WeixinAPP = ko.observable('');
	self.AliPay = ko.observable('');
	
	self.goIntructStudentList = function() { //授课学生
		common.transfer('myStudentList.html', true, {
			isGetStudent: true
		}, false, false);
	}
	self.goIntructTeacherList = function() { //授课老师
		common.transfer('myTeacherList.html', true, {
			isGetStudent: true
		}, false, false);
	}
	self.goMyCollection = function() { //我的收藏
		common.transfer('myCollection.html', true, {}, false, false);
	}
	self.goMyinfo = function() { //个人信息
		common.transfer('myInfo.html', true, {}, true, false);
	}
	self.goMoreInfo = function() { //更多
		common.transfer('moreInfo.html', false, {}, false);
	}
	self.goMyAccount = function() { //我的账户
		common.transfer('myAccountInfo.html', true, {
			Photo: self.Photo(),
			bankCardNum: self.BankCardNum(),
			WeixinAPP: self.WeixinAPP(),
			AliPay: self.AliPay()
		}, false, true);
	}
	self.goMessageList = function() {
//		var index = plus.webview.getLaunchWebview() || plus.webview.getWebviewById('indexID'); //取消“我”红点
//		if (UserType() == common.gDictUserType.student) {
//			mui.fire(index, 'refreshMessageStatusFalse', {});
//		}
//		if (UserType() == common.gDictUserType.teacher && common.gDictAuthStatusType.Authed == IDAuthApproved()) {
//			mui.fire(index, 'refreshMessageStatusFalse', {});
//		}
//		if (UserType() == common.gDictUserType.teacher && common.gDictAuthStatusType.Authed != IDAuthApproved()) {
//			mui.fire(index, 'refreshMessageStatus', {});
//		}
//		self.hasNewMessage(false); //取消消息列表红点
//		var page1 = common.getIndexChild(0); //取消铃铛红点
//		if (page1) {
//			mui.fire(page1, 'refreshMessageStatusFalse', {});
//		}
		common.transfer('messageList.html', true);
	}
	self.goMyAlbum = function() { //我的相册
		common.transfer('myAlbum.html', true);
	}
	self.goHelp = function() { //帮助
		common.transfer('../my/help.html', false);
	}
	self.goMyworks = function() { //个人作品
		common.transfer("../works/worksListMyHeader.html", true, {}, false, false);
	}
	self.goWorkComment = function() { //作品点评
		common.transfer('../comment/commentListHeader.html', true, {
			workType: common.gTeacherCommentType[0].value
		}, false, false);
	}
	self.goHomeWorkComment = function() { //作业点评
		common.transfer('../comment/commentListHeader.html', true, {
			workType: common.gTeacherCommentType[1].value
		}, false, false);
	}
	self.goMyCourse = function() { //课程表
		common.transfer('../course/myCourse.html', true, {}, false, false);
	}
	self.goMyAttention = function() { //我的关注
		common.transfer('myAttention.html', true, {
			subjectID: self.subjectID()
		}, false, false);
	}
	self.qrcodeEvent = function() {
		if (self.UserID() > 0) {
			common.transfer("qrcodeEvent.html", false, {}, false, false);
		} else {
			mui.toast("亲~登录后才能扫一扫哦")
		}
	}
	self.goClassmateWorks = function() { //同学作业
		common.transfer('../works/classmateWorksHeader.html', true, {}, false, false);
	}
	self.goMyTicket = function() { //我的购票
		common.transfer('myTicketsEntrance.html', true);
	}

	self.getInfo = function() {
		var ajaxUrl = common.gServerUrl + "API/Account/GetInfo?userid=" + self.UserID() + "&usertype=" + self.UserType();
		//console.log(ajaxUrl);
		mui.ajax(ajaxUrl, {
			dataType: 'json',
			type: 'GET',
			success: function(responseText) {
				//console.log(JSON.stringify(responseText));
				self.ID(responseText.ID);
				self.DisplayName(responseText.DisplayName);
				self.Province(setStr('Province', responseText, ''));
				if (common.StrIsNull(self.Province()) != '') {
					self.isAllInfo(true);
				}
				self.AccountBalance('￥' + (responseText.AccountBalance).toFixed(2)); //余额
				self.City(setStr('City', responseText, ''));
				self.District(setStr('District', responseText, ''));
				self.Photo(setStr('Photo', responseText, '../../images/my-default.png'));
				if (responseText.PhotoCount)
					self.PhotoCount(responseText.PhotoCount);
				if (responseText.UserFavCount)
					self.UserFavCount(responseText.UserFavCount);
				if (responseText.Star)
					self.starCount(responseText.Star);
				if (responseText.UserCardCount)
					self.BankCardNum(responseText.UserCardCount);
				if (responseText.SubjectID)
					self.subjectID(responseText.SubjectID);
				if (responseText.IDAuth)
					self.IDAuth(responseText.IDAuth);
				if (responseText.MyInviteCode)
					self.inviteCode(responseText.MyInviteCode);
				if (responseText.IsFamous)
					self.IsFamous(responseText.IsFamous);
				if (responseText.ProTitleAuth)
					self.ProTitleAuth(responseText.ProTitleAuth);
				if (responseText.EduAuth)
					self.EduAuth(responseText.EduAuth);
				if (responseText.WeixinAPP)
					self.WeixinAPP(responseText.WeixinAPP);
				if (responseText.AliPay)
					self.AliPay(responseText.AliPay);
//				console.log('f:'+self.IsFamous() + '~A:' + self.IDAuth() +'~P:' +self.ProTitleAuth() + '~E:' + self.EduAuth());

			}
		})
	}

	//初始值设定 field-->字段名 jsonArray-->json fieldValue-->自定义值
	function setStr(field, jsonArray, fieldValue) {
		var result;
		if (common.StrIsNull(jsonArray[field]) == '') {
			result = fieldValue;
		} else {
			if (field == 'Photo') {
				result = common.getPhotoUrl(jsonArray[field]);
			} else {
				result = jsonArray[field];
			}
		}
		return result;
	}

	//跳转至意见反馈
	self.goFeedBack = function() {
		if (getLocalItem('UserID') > 0) {
			common.transfer('feedBack.html');
		} else {
			mui.toast("登录后才能反馈意见~");
		}
	}

	//跳转至我的邀请码
	self.goInviteCode = function() {
		common.transfer('invitationCode.html', true, {
			inviteCode: self.inviteCode(),
			disPlayName: self.DisplayName()
		}, false, true);
	}
	
	self.goRecharge = function() {
		common.transfer('recharge.html', true);
	}
	
	mui.plusReady(function() {
		if (self.UserID() > 0) {
			self.getInfo();
			common.getUnreadCount(function(count) {
//				if (count > 99) {
//					self.unReadMessage('+' + count);
//				} else {
					self.unReadMessage(count);
//				}

			});
			var urlPart = 'modules/student/studentInfo.html?id=';
			if (self.UserType() == common.gDictUserType.teacher) {
				urlPart = 'modules/teacher/teacherInfo.html?id=';
			}
			else if (self.UserType() == common.gDictUserType.org) {
				urlPart = 'modules/org/orgInfo.html?id=';
			}

			var qrcode = new QRCode(document.getElementById("qrcode"), {
				width: 200, //设置宽高
				height: 200
			});

			qrcode.makeCode(common.gWebsiteUrl + urlPart + self.UserID());
		}

	})

	window.addEventListener('refreshPhotoCount', function(event) {
		self.PhotoCount(event.detail.PhotoCount);
	});

	window.addEventListener('refreshMyinfo', function(event) {
		if (typeof event.detail.Province != "undefined") {
			//省
			self.Province(event.detail.Province);
			self.isAllInfo(true);
		}
		if (typeof event.detail.City != "undefined") {
			//市
			self.City(event.detail.City);
		}
		if (typeof event.detail.District != "undefined") {
			//区
			self.District(event.detail.District);
		}
		if (typeof event.detail.displayName != "undefined") {
			self.DisplayName(event.detail.displayName);
		}
		if (typeof event.detail.imgPath != "undefined") {
			self.Photo(event.detail.imgPath);
		}
		if (typeof event.detail.IDAuth != "undefined") {
			self.IDAuth(event.detail.IDAuth);
		}
	});
	
//	self.refreshMessageNotice = function(status) {
//		self.hasNewMessage(status);
//	}
	window.addEventListener("refreshMessage", function(event) {
		self.unReadMessage(event.detail.count);
	});

	//刷新银行卡数量
	/*window.addEventListener('refeshBankCardNum', function(event) {
		//console.log(event.detail.bankCardNum);
		if (common.StrIsNull(event.detail.bankCardNum) != '') {
			self.BankCardNum(event.detail.bankCardNum);
		}
	})*/

	//刷新我的账户余额
	window.addEventListener('refreshMyValue', function(event) {
		var valueJsonObj = event.detail;
		//console.log(JSON.stringify(valueJsonObj))
		switch(valueJsonObj.valueType){
			case "fav":
				if(valueJsonObj.changeValue != 0){	//若存在变化数，则在原基础上修改，否则直接更新为总数
					self.UserFavCount(self.UserFavCount() + valueJsonObj.changeValue);
				}
				else{
					self.UserFavCount(valueJsonObj.count);
				}
				break;
			case "album":
				self.PhotoCount(valueJsonObj.count);
				break;
			case "balance":
				mui.ajax(common.gServerUrl + 'API/AccountDetails/GetUserAmount?UserID=' + self.UserID(), {
					type: 'GET',
					success: function(responseText) {
						//console.log(responseText);
						var result = JSON.parse(responseText);
						self.AccountBalance('￥' + (result.Amount).toFixed(2));
					}
				})
				break;
			case "bankcard":	//从我的账户页面跳转回来，刷新银行卡
				self.BankCardNum(valueJsonObj.count);
				break;
		}
	})

	mui.back = function() {
		var qrp = document.getElementById("qrcodePopover");
		if (qrp.className.indexOf("mui-active") > 0) {
			mui('#qrcodePopover').popover('toggle');
		} else {
			common.confirmQuit();
		}
	}
}
ko.applyBindings(my);