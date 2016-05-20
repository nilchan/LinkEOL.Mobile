var payBox = new PayBox('PayBox', 3, {
		"wxpay": "true",
		"alipay": "true",
		"balance": "true",
		"free": "regUsingFree"
	}, {
		"discountText": "discountText",
		"balanceText": "balance",
		"freeTimesText": "freeActivityCount",
		"pricePay": "pricePay",
		"price": "price"
	}, true, 'gotoPay');

var applay = function() {
    var self = this;
	

    var aid = 0, rid = 0, orderID = 0;
    self.canChange = ko.observable(true);

	self.Types = ko.observableArray([]);
	
    self.areaID = ko.observable(-1);
    self.sexID = ko.observable(-1);
    self.testStyleID = ko.observable(-1);
    self.testGroupID = ko.observable(-1);

    self.areaText = ko.observable('请选择赛区');
    self.sexText = ko.observable('请选择性别');
    self.testStyleText = ko.observable('请选择参赛形式');
    self.testGroupText = ko.observable('请选择组别');
    self.title = ko.observable('');
    self.userName = ko.observable('');
    self.testWork = ko.observable('');
    self.school = ko.observable('');
    self.phone = ko.observable('');
    self.parentPhone = ko.observable('');
    self.teacher = ko.observable('');
    self.teacherPhone = ko.observable('');
    self.wechat = ko.observable('');
    self.train = ko.observable('');
    self.introduce = ko.observable('');
    self.price = ko.observable(0);
    self.pricePay = ko.observable(0);
    self.balance = ko.observable(0);
    self.vipLevel = ko.observable(0);
    self.freeActivityCount = ko.observable(0);
    self.isFinish = ko.observable(false);
    self.regUsingFree = ko.observable(false);
    self.vipDiscounts = ko.observableArray([]);
    self.discount = ko.observable(1);
    self.discountText = ko.observable('无折扣');
    
	//支付方式，默认为微信支付
	self.PayType = ko.observable('wxpay');
	
    //选择
    self.selectArea = function() {
    	if( canChange() === false ) return ;
        self.area.show(function(items) {
            self.areaText(items[0].text);
            self.areaID(items[0].value);
        });
    };

    self.selectSex = function() {
    	if( canChange() === false ) return ;
        self.sex.show(function(items) {
            self.sexText(items[0].text);
            self.sexID(items[0].value);
        });
    };

    self.selectTestStyle = function() {
    	if( canChange() === false ) return ;
        self.testStyle.show(function(items) {
            self.testStyleText(items[0].text);
            self.testStyleID(items[0].value);
            self.price(self.Types()[items[0].value-1].Price);
            if(self.PayType() == 'free')
            	self.pricePay(0);
            else
            	self.pricePay(self.price());
        });
    };

    self.selectTestGroup = function() {
    	if( canChange() === false ) return ;
        self.testGroup.show(function(items) {
            self.testGroupText(items[0].text);
            self.testGroupID(items[0].value);
        });
    };

    //获取JSON
    self.getJson = function() {
        var url = common.gServerUrl + 'Common/RegGame/RegGameInfoByActivityID?ActivityID=';
        url = url + aid;
        mui.ajax(url,{
            type: 'GET',
            success: function(result) {
            	console.log(result);
                var obj = JSON.parse(result);
                self.title(obj.Title);
                self.regUsingFree(obj.RegUsingFree);
                if(common.StrIsNull(obj.VIPDiscountJson) != ''){
                	self.vipDiscounts(JSON.parse(obj.VIPDiscountJson));
                }
                self.initPayInfo();
                
				var CommentName = common.JsonConvert(JSON.parse(obj.CommentNameJSON), 'Id', 'CommentName');
				self.area.setData(CommentName);
				
				var groupTypes = common.JsonConvert(JSON.parse(obj.GroupTypeJSON), 'Id', 'GroupType');
				self.Types(JSON.parse(obj.GroupTypeJSON));
				//console.log(JSON.stringify(self.Types()));
				self.testStyle.setData(groupTypes);
				
				var groupDivisions = common.JsonConvert(JSON.parse(obj.GroupDivisionJSON), 'Id', 'GroupDivision');
				self.testGroup.setData(groupDivisions);
            }
        });
    };
    
    //获取老师
    var timeEvent;
    var teaPhone;
    self.getTeacher=function(){
    	//self.teacher = ko.observable('');
    	//self.teacherPhone = ko.observable('');
    	clearTimeout(timeEvent);
		timeEvent = setTimeout(function() {
			teaPhone = document.getElementById("teaPhone").value;
			var ajaxUrl = common.gServerUrl + 'API/Account/GetInfoByPhone?phone=' + teaPhone;
			mui.ajax(ajaxUrl, {
				type: 'GET',
				success: function(responseText) {
					var result = JSON.parse(responseText);
					if (common.StrIsNull(result) != '') {
						if (result[0].UserType == common.gDictUserType.teacher) {
							self.teacher(result[0].DisplayName);
						}
					}

				}
			})
		}, 500);
    }

    //验证
    var validate = function(val, text) {
        if( val === "" ) {
            mui.toast(text + '不能为空~');
            return false;
        }
        return true;
    };
    
    var validateS = function(val, text) {
    	if( val === -1 ) {
    		mui.toast('请选择' + text);
    		return false;
    	}
    	return true;
    }

	//获取余额
	self.getBalance = function() {
		if(common.hasLogined() == false){
			common.showCurrentWebview();
			return;
		}
		
		var url = common.gServerUrl + 'API/AccountDetails/GetUserAmount2?UserID=' + getLocalItem('UserID');
		mui.ajax(url, {
			type: 'GET',
			success: function(responseText) {
				var result = JSON.parse(responseText);
				self.balance(result.Amount);
				self.freeActivityCount(result.FreeActivityCount);
				self.vipLevel(result.VIPLevel);
				self.initPayInfo();
				
				common.showCurrentWebview();
			},
			error: function(){
				common.showCurrentWebview();
			}
		});
	}
	
	//初始化支付信息：计算可获取的折扣、若支持免费次数且有免费次数则默认选中次数支付
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
		
		if(self.regUsingFree() == true && self.freeActivityCount() > 0){
			self.pricePay(0);
			self.PayType('free');
		}
		payBox.selectPay(self.PayType());
	}
	
	self.openPaybox = function(){
		payBox.show();
	}
	
	//关闭支付界面
	self.closePopover = function() {
		//mui('#middlePopover').popover("hide");
		common.setEnabled(event);
	}
	
    //提交
    self.submitFrom = function() {
        if( !validate(self.userName(), '姓名') ) return ;
        if( !validate(self.testWork(), '参赛作品') ) return ;
        if( !validate(self.phone(), '报名手机号码') ) return ;
        /*if( !validate(self.teacher(), '指导老师') ) return ;
        if( !validate(self.teacherPhone(), '指导老师电话') ) return ;*/
        
        if( !validateS(self.areaID(), '赛区') ) return ;
        if( !validateS(self.sexID(), '性别') ) return ;
        if( !validateS(self.testStyleID(), '参赛形式') ) return ;
        if( !validateS(self.testGroupID(), '参赛组别') ) return ;
		
		
        var evt = event;
		if(!common.setDisabled()) return;

        var url = common.gServerUrl + 'Common/RegGame/RegGameAdd';
        var data = {
            CommentID: self.areaID(),
            CommentName: self.areaText(),
            Gender: self.sexID(),
            GroupType: self.testStyleID(),
            GroupTypeText: self.testStyleText(),
            GroupDivision: self.testGroupID(),
            GroupDivisionText: self.testGroupText(),
            UserName: self.userName(),
            WorkTitle: self.testWork(),
            UserPhone: self.phone(),
            TeacherName: self.teacher(),
            TeacherPhone: self.teacherPhone(),
            Training: self.train(),
            Resume:self.introduce(),
            ActivityID: aid,
            UserID: getLocalItem('UserID')
        };

        mui.ajax(url, {
            type: 'POST',
            data: data,
            success: function(result) {
            	var obj = JSON.parse(result);
            	rid = obj.ID;	//返回保存后的报名记录ID
            	self.canChange(false);
        		self.setChange();
        	
            	var btnArray = ['取消', '确认'];
				mui.confirm('是否现在完成支付？', '报名成功', btnArray, function(e) {
					if (e.index == 1) {
						payBox.show();
					}
					else{
						mui.back();
					}
				});
				
                common.setEnabled(evt);
            },
            error: function(){
            	common.setEnabled(evt);
            }
        });
    };
	
	self.checkPayType = function(value) {
		console.log('~'+value);
		self.PayType(value);
		
		switch(self.PayType()){
			case 'balance':
				self.pricePay((self.price() * self.discount()).toFixed(2));
				break;
			case 'free':
				self.pricePay(0);
				break;
			default:
				self.pricePay(self.price());
				break;
		}
	}
	payBox.changePay(self.checkPayType);
	
	//支付
	self.gotoPay = function() {
		if(self.freeActivityCount() <= 0 && self.PayType() == 'free'){
			mui.toast('免费报名次数不足，如需增加可查看充值优惠');
			return;
		}
		var obj = {ID: rid};
		Pay.preparePay(JSON.stringify(obj), self.PayType(), common.gDictOrderTargetType.RegGame, 
			orderID, function(newOrderID){
				orderID = newOrderID;
			}, function(){
				mui.back();
			});
	}
 
	self.setChange = function() {
		var inputs = document.getElementsByTagName('input');
		for( var i = 0; i < inputs.length; i ++) {
			inputs[i].readOnly = true;
		}
		document.getElementById('introduce').readOnly = true;
	}
	
	self.getRegInfo = function() {
		var url = common.gServerUrl + 'API/RegGame/RegGameInfoByID';
		url += '?regId=' + rid;
		mui.ajax(url, {
			type: 'GET',
			success: function(result) {
				var obj = JSON.parse(result);
				self.areaID(obj.TbActivityRegGame.CommentID);
				self.areaText(obj.TbActivityRegGame.CommentName);
				self.sexText(common.gJsonGenderType[obj.TbActivityRegGame.Gender].text);
				self.phone(obj.TbActivityRegGame.UserPhone);
				self.userName(obj.TbActivityRegGame.UserName);
				self.testWork(obj.TbActivityRegGame.WorkTitle);
				self.teacher(obj.TbActivityRegGame.TeacherName);
				self.teacherPhone(obj.TbActivityRegGame.TeacherPhone);
				self.train(obj.TbActivityRegGame.Training == null ? ' ':obj.TbActivityRegGame.Training);
				self.testStyleID(obj.TbActivityRegGame.GroupType);
				self.testStyleText(obj.TbActivityRegGame.GroupTypeText);
				self.testGroupID(obj.TbActivityRegGame.GroupDivisionID);
				self.testGroupText(obj.TbActivityRegGame.GroupDivisionText);
				self.price(obj.TbActivityRegGame.Amount);
				self.pricePay(obj.TbActivityRegGame.Amount);
				self.introduce(obj.TbActivityRegGame.Resume == null ? ' ':obj.TbActivityRegGame.Resume);
				self.isFinish(obj.TbActivityRegGame.IsFinish);
				self.regUsingFree(obj.TbActivityRegGame.RegUsingFree);
				
				if(common.StrIsNull(obj.TbActivityRegGame.VIPDiscountJson) != ''){
                	self.vipDiscounts(JSON.parse(obj.TbActivityRegGame.VIPDiscountJson));
                }
                self.initPayInfo();
			}
		});
	}

	
    //初始化
    mui.plusReady(function(){
        self.sex = new mui.PopPicker();
        self.area = new mui.PopPicker();
        self.testStyle = new mui.PopPicker();
        self.testGroup = new mui.PopPicker();

        self.sex.setData(common.gJsonGenderType);
        self.testGroup.setData(common.gActivityGameGroup);
        
        var web = plus.webview.currentWebview();
		if (typeof(web.aid) !== "undefined") {
			aid = web.aid;
		}
		if (typeof(web.rid) !== "undefined") {
			rid = web.rid;
		}
		
		if (typeof(web.order) != "undefined") { //从订单跳转进来
			rid = web.order.TargetID;
		}

        
        if( rid === 0 ) {
        	self.getJson();
        	self.userName(getLocalItem('DisplayName'));
        	self.phone(getLocalItem('UserName'));
        } else {
        	self.canChange(false);
        	self.setChange();
        	self.getRegInfo();
        }
        self.getBalance();
    });
    
    
	mui.init({
		beforeback: function() {
			var opener = plus.webview.currentWebview().opener();
			//console.log(JSON.stringify(activityInfo));
			if (opener.id.indexOf('applyList.html') >= 0) {
				mui.fire(opener, 'refreshList');
			}
			if (opener.id.indexOf('myOrders.html') >= 0) {
				common.refreshOrder();//刷新订单
			}

			//返回true，继续页面关闭逻辑
			return true;
		}
	});
};

ko.applyBindings(applay);