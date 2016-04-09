var applay = function() {
    var self = this;

    var aid = 0, rid = 0;
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
    self.balance = ko.observable(0);
    self.isFinish = ko.observable(false);
    
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
                
				var CommentName = common.JsonConvert(JSON.parse(obj.CommentNameJSON), 'Id', 'CommentName');
				self.area.setData(CommentName);
				
				var groupTypes = common.JsonConvert(JSON.parse(obj.GroupTypeJSON), 'Id', 'GroupType');
				self.Types(JSON.parse(obj.GroupTypeJSON));
				console.log(JSON.stringify(self.Types()));
				self.testStyle.setData(groupTypes);
				
				var groupDivisions = common.JsonConvert(JSON.parse(obj.GroupDivisionJSON), 'Id', 'GroupDivision');
				self.testGroup.setData(groupDivisions);
            }
        });
    };

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
		var url = common.gServerUrl + 'API/AccountDetails/GetUserAmount?UserID=' + getLocalItem('UserID');
		mui.ajax(url, {
			type: 'GET',
			success: function(responseText) {
				self.balance(JSON.parse(responseText).Amount);
				common.showCurrentWebview();
			},
			error: function(){
				common.showCurrentWebview();
			}
		});
	}
	
	//关闭支付界面
	self.closePopover = function() {
		mui('#middlePopover').popover("hide");
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
						mui('#middlePopover').popover('toggle');
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
	
	//支付方式，默认为微信支付
	self.PayType = ko.observable('wxpay');
	self.checkPayType = function() {
		PayType(event.srcElement.value);
	}
	
	//支付
	self.gotoPay = function() {

		//支付方式的数值
		var paytype = 3;
		if (self.PayType() == 'wxpay') {
			paytype = 1;
		} else if (self.PayType() == 'alipay') {
			paytype = 2;
		} else if (self.PayType() == 'balance') {
			paytype = 4;
		} else {
			paytype = 3;
		}

		var evt = event;
		if (!common.setDisabled()) return;

		plus.nativeUI.showWaiting();
		var ajaxUrl = common.gServerUrl + "API/RegGame/RegGameAddOrder?regId=" + rid + "&payType=" + paytype
		console.log(ajaxUrl);
		//新增则保存下载信息；修改则保存新的支付方式。均返回订单信息
		mui.ajax(ajaxUrl, {
			type: 'POST',
			success: function(responseText) { //responseText为微信支付所需的json
				console.log(responseText);
				var ret = JSON.parse(responseText);
				var orderID = ret.orderID;
				if (ret.requestJson == '') { //无需网上支付，报名成功
					mui.toast("已成功支付");
					plus.nativeUI.closeWaiting();
					common.refreshMyValue({
						valueType: 'balance',
					})
					mui('#middlePopover').popover("toggle");
					common.refreshOrder();//刷新订单
					mui.back();
				} else {
					var requestJson = JSON.stringify(ret.requestJson);

					//根据支付方式、订单信息，调用支付操作
					Pay.pay(self.PayType(), requestJson, function(tradeno) { //成功后的回调函数
						//plus的pay有可能在微信支付成功的同步返回时，并未返回tradeno
						if(tradeno == '' || typeof tradeno == 'undefined'){
							plus.nativeUI.closeWaiting();
							mui('#middlePopover').popover("toggle");
							mui.back();
							return;
						}
						
						var aurl = common.gServerUrl + 'API/Order/SetOrderSuccess?id=' + orderID + '&otherOrderNO=' + tradeno;
						mui.ajax(aurl, {
							type: 'PUT',
							success: function(respText) {
								plus.nativeUI.closeWaiting();
								common.refreshMyValue({
									valueType: 'balance',
								})
								mui('#middlePopover').popover("toggle");
								common.refreshOrder();//刷新订单
								mui.back();
							},
							error: function() {
								common.setEnabled(evt);
								plus.nativeUI.closeWaiting();
							}
						})
					}, function() {
						common.setEnabled(evt);
						plus.nativeUI.closeWaiting();
					});
				}
			},
			error: function() {
				common.setEnabled(evt);
				plus.nativeUI.closeWaiting();
			}
		})
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
				self.introduce(obj.TbActivityRegGame.Resume == null ? ' ':obj.TbActivityRegGame.Resume);
				self.isFinish(obj.TbActivityRegGame.IsFinish);
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
			console.log(JSON.stringify(web.order));
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