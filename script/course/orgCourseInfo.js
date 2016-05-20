var payBox = new PayBox('PayBox', 2, {
		"wxpay": "true",
		"alipay": "true",
		"balance": "true",
		"free": "regUsingFree"
	}, {
		"discountText": "discountText",
		"balanceText": "balance",
		"freeTimesText": "freeCourseCount",
		"pricePay": "AmountPay",
		"price": "Amount"
	}, true, 'gotoPay');

var orgCourseInfo = function() {
	var self = this;
	var cid = 0,
		orderID = 0;
		shareUrl = common.gWebsiteUrl + "modules/course/orgCourseInfo.html?cid=";
	var thisWeb;
	
	self.ID = ko.observable(0);
	self.CanBeReg = ko.observable(false);	//是否可被当前用户报名
	self.OrgID = ko.observable(0); //机构id
	self.CourseName = ko.observable(''); //课程名称
	self.CourseAbout = ko.observable(''); //课程简介
	self.Introduce = ko.observable(''); //课程介绍
	self.RegStudent = ko.observable(0); //报名人数
	self.Amount = ko.observable(0); //报名费用
    self.AmountPay = ko.observable(0);
	self.NowRegStudent = ko.observable(0); //已报名人数
	self.OrgName = ko.observable(''); //机构名称
	self.UserFavCount = ko.observable(0);
	self.Photo = ko.observable('');
	self.balance = ko.observable(0);
    self.vipLevel = ko.observable(0);
    self.freeCourseCount = ko.observable(0);
	self.paid = ko.observable(false); //是否已支付
	self.registerId = ko.observable(0);
    //self.isFinish = ko.observable(false);
    self.isPublic = ko.observable(false);	//是否公益课程
    self.amountPublic = ko.observable(0);	//公益价格
    self.regUsingFree = ko.observable(false);
    self.vipDiscounts = ko.observableArray([]);
    self.discount = ko.observable(1);
    self.discountText = ko.observable('无折扣');
    self.address=ko.observable('');
    self.city=ko.observable();
    self.regOrgs = ko.observableArray([]);	//允许报名的机构列表
	
	//支付方式，默认为微信支付
	self.PayType = ko.observable('wxpay');
	
	self.getCourseInfo = function() {
		var ajaxUrl = common.gServerUrl + 'API/Org/OrgCourseInfoByID?courseId=' + self.ID() + 
			'&userId='+(common.StrIsNull(getLocalItem('UserID') == '' ? '0' : getLocalItem('UserID')));
		mui.ajax(ajaxUrl, {
			type: 'GET',
			success: function(responseText) {
				var result = JSON.parse(responseText);
				//console.log(JSON.stringify(result));
				self.ID(result.ID);
				self.CanBeReg(result.CanBeReg);
				self.OrgID(result.OrgID);
				self.CourseName(result.CourseName);
				self.CourseAbout(result.CourseAbout);
				self.Introduce(result.Introduce);
				self.RegStudent(result.RegStudent);
				self.Amount(result.Amount);
				self.AmountPay(result.Amount);
				self.NowRegStudent(result.NowRegStudent);
				self.OrgName(result.OrgName);
				self.UserFavCount(result.UserFavCount);
				self.Photo(result.Photo);
				self.address(result.Address);
				self.city(result.City);
				if(common.StrIsNull(result.RegOrgJson) != '')
					self.regOrgs(JSON.parse(result.RegOrgJson));
				self.isPublic(result.IsPublic);
				if(self.isPublic() == true){
					self.amountPublic(result.AmountPublic);
					self.AmountPay(result.AmountPublic);
				}
                self.regUsingFree(result.RegUsingFree);
                if(common.StrIsNull(result.VIPDiscountJson) != ''){
                	self.vipDiscounts(JSON.parse(result.VIPDiscountJson));
                }
                self.initPayInfo();
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
		if(getLocalItem('UserID')<=0){
			common.transfer('',true, {cid: self.ID()});
			return ;
		}
		
		if(self.CanBeReg() == false){
			mui.toast('您不符合报名条件，请仔细查看课程详情');
			return;
		}
		
		if(self.amountPublic() <= 0 && self.isPublic()){
			self.gotoPay();
		}
		else{
			payBox.show();
		}
	}

	//分享功能
	var ul = document.getElementById("sharePopover");
	var lis = ul.getElementsByTagName("li");
	for (var i = 0; i < lis.length; i++) {
		lis[i].onclick = function() {
			mui('#sharePopover').popover('toggle');
			plus.nativeUI.showWaiting();
			Share.sendShare(this.id, self.CourseName(), self.CourseAbout(), shareUrl + self.ID() , common.getPhotoUrl(self.Photo()));

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
		var url = common.gServerUrl + 'API/AccountDetails/GetUserAmount2?UserID=' + getLocalItem('UserID');
		mui.ajax(url, {
			type: 'GET',
			success: function(responseText) {
				var result = JSON.parse(responseText);
				self.balance(result.Amount);
				self.freeCourseCount(result.FreeCourseCount);
				self.vipLevel(result.VIPLevel);
				self.initPayInfo();
				
				common.showCurrentWebview();
			},
			error: function(){
				common.showCurrentWebview();
			}
		});
	}
	
	//计算可获取的折扣
	self.initPayInfo = function(){
		if(self.vipDiscounts().length > 0 && self.vipLevel() > 0){
			self.vipDiscounts().forEach(function(item){
				if(item.VIPLevel == self.vipLevel()){
					self.discount(item.Discount);
					if(self.discount() >= 1){
						self.discountText('无折扣');
					}
					else if (self.discount() <= 0){
						self.discountText('免费报名');
					}
					else{
						self.discountText('享受'+(self.discount() * 10)+'折');
					}
					return;
				}
			})
		}
		
		if(self.isPublic() && self.amountPublic() <= 0){	//公益课程且无需付费，此时默认为余额支付（金额为0）
			self.AmountPay(0);
			self.PayType('balance');
		}
		else{
			if(self.regUsingFree() == true && self.freeCourseCount() > 0){
				self.AmountPay(0);
				self.PayType('free');
			}
		}
		payBox.selectPay(self.PayType());
	}
	
	self.checkPayType = function(value) {
		PayType(value);
		var tmpAmount = 0;
		if(self.isPublic())
			tmpAmount = self.amountPublic();
		else
			tmpAmount = self.Amount();
		
		switch(self.PayType()){
			case 'balance':
				self.AmountPay((tmpAmount * self.discount()).toFixed(2));
				break;
			case 'free':
				self.AmountPay(0);
				break;
			default:
				self.AmountPay(tmpAmount);
				break;
		}
	}
	payBox.changePay(self.checkPayType);
	
	self.Order = ko.observable({}); //由我的订单传递过来的订单参数
	self.ViewOrder = ko.observable(false); //标记是否由我的订单跳转而来，默认为否
	self.OrderNO = ko.observable(''); //请求后返回的订单号

	//支付
	self.gotoPay = function() {
		if(self.freeCourseCount() <= 0 && self.PayType() == 'free'){
			mui.toast('免费报名次数不足，如需增加可查看充值优惠');
			return;
		}
		
		var couresregJson = {
			OrgCourseID: self.ID(),
			UserID: getLocalItem('UserID'),
			UserName: getLocalItem('DisplayName'),
			Phone: getLocalItem('UserName'),
			Amount: self.Amount()
		}
		//console.log(JSON.stringify(couresregJson))
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
			common.setEnabled(evt);
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
				mui('#middlePopover').popover("hide");	//关闭弹窗后，才能返回上一页面
				mui.back();
			});
	}
	
	//导航
	self.sysGuide = function() {
		//common.mapGuide('','',self.address());113.324587,23.106487
		common.mapGuide(self.city(),self.address());
	}

	mui.plusReady(function() {
		Share.updateSerivces();//分享初始化 
		thisWeb = plus.webview.currentWebview();
		if(typeof(thisWeb.regData) != "undefined"){ // 报名跳转进来
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