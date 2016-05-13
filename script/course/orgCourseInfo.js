var orgCourseInfo = function() {
	var self = this;
	var cid = 0,
		orderID = 0;
	var thisWeb;
	var userID = getLocalItem('UserID');
	self.ID = ko.observable();
	self.OrgID = ko.observable(); //机构id
	self.CourseName = ko.observable(); //课程名称
	self.CourseAbout = ko.observable(); //课程简介
	self.Introduce = ko.observable(); //课程介绍
	self.RegStudent = ko.observable(); //报名人数
	self.RegMoney = ko.observable(); //报名费用
	self.NowRegStudent = ko.observable(); //已报名人数
	self.OrgName = ko.observable(); //机构名称
	self.UserFavCount = ko.observable();
	self.Photo = ko.observable();
	self.balance = ko.observable();
	self.paid = ko.observable(false); //是否已支付
	self.registerId = ko.observable();

	self.getCourseInfo = function() {
		var ajaxUrl = common.gServerUrl + 'API/Org/OrgCourseInfoByID?courseId=' + self.ID();
		mui.ajax(ajaxUrl, {
			type: 'GET',
			success: function(responseText) {
				console.log(responseText)
				var result = JSON.parse(responseText);
				self.ID(result.ID);
				self.OrgID(result.OrgID);
				self.CourseName(result.CourseName);
				self.CourseAbout(result.CourseAbout);
				self.Introduce(result.Introduce);
				self.RegStudent(result.RegStudent);
				self.RegMoney(result.RegMoney);
				self.NowRegStudent(result.NowRegStudent);
				self.OrgName(result.OrgName);
				self.UserFavCount(result.UserFavCount);
				self.Photo(result.Photo);
				//common.showCurrentWebview();
				self.getBalance(); //获取余额
			}
		});
	}

	//关闭分享窗口
	self.closeShare = function() {
		mui('#sharePopover').popover('toggle');
	}
	
	self.showPay=function(){
		if(userID<0){
			common.transfer('',true);
			return ;
		}
		mui('#middlePopover').popover('show');
	}

	//分享功能
	var ul = document.getElementById("sharePopover");
	var lis = ul.getElementsByTagName("li");
	for (var i = 0; i < lis.length; i++) {
		lis[i].onclick = function() {
			mui('#sharePopover').popover('toggle');
			plus.nativeUI.showWaiting();
			//Share.sendShare(this.id, shareTitle, shareContent, shareUrl + TUserID, shareImg, common.gShareContentType.teacher);

		};
	}

	//跳转至机构详情
	self.goOrg = function() {
		common.transfer('../org/orgInfo.html', false, {
			oid: self.OrgID()
		})
	}

	//报名支付相关

	//关闭支付界面
	self.closePopover = function() {
		mui('#middlePopover').popover("hide");
		common.setEnabled(event);
	}

	//获取余额
	self.getBalance = function() {
		var url = common.gServerUrl + 'API/AccountDetails/GetUserAmount?UserID=' + getLocalItem('UserID');
		mui.ajax(url, {
			type: 'GET',
			success: function(responseText) {
				self.balance(JSON.parse(responseText).Amount);
				common.showCurrentWebview();
			},
			error: function() {
				common.showCurrentWebview();
			}
		});
	}

	//支付方式，默认为微信支付
	self.PayType = ko.observable('wxpay');
	self.checkPayType = function() {
		PayType(event.srcElement.value);
	}

	self.Order = ko.observable({}); //由我的订单传递过来的订单参数
	self.ViewOrder = ko.observable(false); //标记是否由我的订单跳转而来，默认为否
	self.OrderNO = ko.observable(''); //请求后返回的订单号

	//支付
	self.gotoPay = function() {
		var couresregJson = {
			OrgCourseID: self.ID(),
			UserID: userID,
			UserName: getLocalItem('DisplayName'),
			Phone: getLocalItem('UserName'),
			RegMoney: self.RegMoney()
		}
		console.log(JSON.stringify(couresregJson))
		var evt = event;
		if (!common.setDisabled()) return;
		if (common.StrIsNull(self.registerId()) == '') {//未报名
			mui.ajax(common.gServerUrl + 'API/Org/OrgCourseRegAdd', {
				type: 'POST',
				data: couresregJson,
				success: function(responseText) {
					var result=JSON.parse(responseText);
					self.registerId(result.ID);
					var obj = {
						ID: self.registerId()
					};
					self.orderPay(obj);
					common.setEnabled(evt);
				},
				error: function() {
					console.log('error');
					common.setEnabled(evt);
				}
			})
		} else {
			var obj = {
				ID: self.registerId()
			};
			self.orderPay(obj);
		}

	}

	self.orderPay = function(obj) {
		Pay.preparePay(JSON.stringify(obj), self.PayType(), common.gDictOrderTargetType.CourseReg,
			orderID,
			function(newOrderID) {
				orderID = newOrderID;
				mui.fire(thisWeb.opener(),'refreshReg');
			},
			function() {
				mui.back();
			});
	}

	mui.plusReady(function() {
		thisWeb = plus.webview.currentWebview();
		if(typeof(thisWeb.regData) != "undefined"){
			self.paid(thisWeb.regData.IsFinish);
			self.ID(thisWeb.regData.OrgCourseID);
			self.registerId(thisWeb.regData.ID);
		}
		if (typeof(thisWeb.order) != "undefined") { //从订单跳转进来
			self.Order(thisWeb.order);
			self.paid(self.Order().IsFinish);
			self.ID(thisWeb.data.OrgCourseID);
			self.registerId(self.Order().TargetID);
		} else {
			if (typeof thisWeb.cid !== 'undefined') {
				self.ID(thisWeb.cid);
			}
		}
		self.getCourseInfo();
	})
}
ko.applyBindings(orgCourseInfo);