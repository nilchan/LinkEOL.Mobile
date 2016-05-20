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

var teacherFTF = function() {
	var self = this;

	var aid = 0,
		rid = 0,
		orderID = 0;
	self.canChange = ko.observable(true);

	var userId = getLocalItem('UserID');
	self.UserName = ko.observable(''); //姓名
	self.GenderText = ko.observable('请选择性别'); //性别
	self.Gender = ko.observable(-1); //性别value
	self.Birthday = ko.observable('请选择出生日期'); //生日
	self.Native = ko.observable(''); //籍贯
	self.Nation = ko.observable(''); //民族
	self.CommentName = ko.observable('请选择地区'); //赛区
	self.CommentId = ko.observable(); //赛区id
	self.IDCard = ko.observable(''); //身份证
	self.Email = ko.observable(''); //邮箱
	self.UserPhone = ko.observable(''); //手机
	self.WeiXin = ko.observable(''); //微信号
	self.Resume = ko.observable(''); //简历
	self.ChapterOptionText = ko.observable('请选择曲目'); //曲目
	self.ChapterOption = ko.observable(); //曲目id
	self.Education = ko.observable(''); //教育经历
	self.teacher = ko.observable('');
	self.teacherPhone = ko.observable('');
	self.Province = ko.observable("广东省"); //默认广东省
	self.City = ko.observable("广州市"); //默认广州市
	self.District = ko.observable("天河区"); //默认天河区
	self.Address = ko.observable(self.Province() + ' ' + self.City() + ' ' + self.District());
	self.Chapter = ko.observableArray([]);
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
	
	//获取JSON
	self.getJson = function() {
		var ajaxUrl = common.gServerUrl + "Common/RegGame/RegGameInfoByActivityID?ActivityID=" + aid;
		mui.ajax(ajaxUrl, {
			type: "GET",
			success: function(responseText) {
				var result = JSON.parse(responseText);
                self.regUsingFree(result.RegUsingFree);
                if(common.StrIsNull(result.VIPDiscountJson) != ''){
                	self.vipDiscounts(JSON.parse(result.VIPDiscountJson));
                }
                self.initPayInfo();
                
				var ChapterOptionJSON = JSON.parse(result.ChapterOptionJSON);
				var CommentNameJSON = JSON.parse(result.CommentNameJSON);
				var ChapterOption = common.JsonConvert(ChapterOptionJSON, 'Id', 'ChapterOption');
				self.Chapter(ChapterOptionJSON);
				var CommentName = common.JsonConvert(CommentNameJSON, 'Id', 'CommentName');

				self.ChapterOptions.setData(ChapterOption);
				self.CommentNames.setData(CommentName);

			}
		})
	}

	//性别设置
	self.setGender = function() {
		if (self.canChange() == false) return;
		mui.ready(function() {
			self.genders.show(function(items) {
				self.GenderText(items[0].text);
				self.Gender(items[0].value);
			});
		});
	}

	//赛区设置
	self.setCommentName = function() {
		if (self.canChange() == false) return;
		mui.ready(function() {
			self.CommentNames.show(function(items) {
				self.CommentName(items[0].text);
				self.CommentId(items[0].value);
			});
		});
	}

	//曲目设置
	self.setChapterOption = function() {
		if (self.canChange() == false) return;
		mui.ready(function() {
			self.ChapterOptions.show(function(items) {
				self.ChapterOptionText(items[0].text); //赛区
				self.ChapterOption(items[0].value); //赛区id
				self.price(self.Chapter()[items[0].value - 1].Price);
	            if(self.PayType() == 'free')
	            	self.pricePay(0);
	            else
	            	self.pricePay(self.price());
			});
		});
	}

	//生日获取
	self.setBirthday = function() {
		if (self.canChange() == false) return;
		mui.ready(function() {
			//console.log(self.Birthday());
			var now = new Date();
			var year = 2000 + now.getYear() % 100;

			var tmpDate = self.Birthday();
			if (isNaN(newDate(tmpDate))) {
				tmpDate = (year - 10).toString() + '-01-01';
			}

			dtPicker.PopupDtPicker({
					'type': 'date',
					'beginYear': 1900,
					'endYear': year - 1
				},
				tmpDate,
				function(value) {
					self.Birthday(value.split(' ')[0]);
				});
		});

	}

	//地址获取
	self.setAddress = function() {
		if (self.canChange() == false) return;
		mui.ready(function() {
			self.places.show(function(items) {
				cityValueMon = (items[0] || {}).text + " " + common.StrIsNull((items[1] || {}).text) + " " + common.StrIsNull((items[2] || {}).text);
				self.Address(cityValueMon.split(" ")[0] + cityValueMon.split(" ")[1] + cityValueMon.split(" ")[2]);
			});
		})

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
		
		if(self.regUsingFree() == true && self.freeActivityCount() > 0){
			self.pricePay(0);
			self.PayType('free');
		}
		payBox.selectPay(self.PayType());
	}
	
	//获取老师
	var timeEvent;
	var teaPhone;
	self.getTeacher = function() {
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

	self.openPaybox = function(){
		payBox.show();
	}
	
	//关闭支付界面
	self.closePopover = function() {
		mui('#middlePopover').popover("hide");
		common.setEnabled(event);
	}

	//讲座报名添加
	self.addRegLectures = function() {
		if (common.StrIsNull(self.UserPhone()) == "") {
			mui.toast("报名手机号码不能为空");
			return;
		}
		if (common.StrIsNull(self.UserName()) == "") {
			mui.toast("姓名不能为空");
			return;
		}
		if (common.StrIsNull(self.Gender()) < 0) {
			mui.toast("性别不能为空");
			return;
		}
		if (common.StrIsNull(self.Birthday()) == "请选择出生日期") {
			mui.toast("生日不能为空");
			return;
		}
		if (common.StrIsNull(self.CommentId()) == "") {
			mui.toast("报名地区不能为空");
			return;
		}
		if (common.StrIsNull(self.ChapterOption()) == "") {
			mui.toast("曲目不能为空");
			return;
		}
		/*if (common.StrIsNull(self.IDCard()) == "") {
			mui.toast("身份证不能为空");
			return;
		}*/

		var data = {
			ActivityID: aid,
			UserID: userId,
			UserName: self.UserName(),
			Gender: self.Gender(),
			Birthday: self.Birthday(),
			Native: self.Native(),
			Nation: self.Nation(),
			CommentId: self.CommentId(),
			CommentName: self.CommentName(),
			IDCard: self.IDCard(),
			Address: self.Address(),
			Email: self.Email(),
			UserPhone: self.UserPhone(),
			TeacherName: self.teacher(),
			TeacherPhone: self.teacherPhone(),
			WeiXin: self.WeiXin(),
			//Photo": "string",
			Education: self.Education(),
			Resume: self.Resume(),
			ChapterOption: self.ChapterOption(),
			ChapterOptionText: self.ChapterOptionText()
		}

		var evt = event;
		if (!common.setDisabled()) return;

		var ajaxUrl = common.gServerUrl + '/Common/RegLectures/RegLecturesAdd';
		mui.ajax(ajaxUrl, {
			type: 'POST',
			data: data,
			success: function(responseText) {
				var obj = JSON.parse(responseText);
				rid = obj.ID; //返回保存后的报名记录ID
				self.canChange(false);
				self.setChange();

				var btnArray = ['取消', '确认'];
				mui.confirm('是否现在完成支付？', '报名成功', btnArray, function(e) {
					if (e.index == 1) {
						//mui('#middlePopover').popover('toggle');
						payBox.show();
					} else {
						mui.back();
					}
				});

				common.setEnabled(evt);
			},
			error: function() {
				common.setEnabled(evt);
			}
		});

	}

	self.checkPayType = function(value) {
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
		var obj = {
			ID: rid
		};
		Pay.preparePay(JSON.stringify(obj), self.PayType(), common.gDictOrderTargetType.RegLectures,
			orderID,
			function(newOrderID) {
				orderID = newOrderID;
			},
			function() {
				mui.back();
			});
	}

	self.setChange = function() {
		var inputs = document.getElementsByTagName('input');
		for (var i = 0; i < inputs.length; i++) {
			inputs[i].readOnly = true;
		}
		document.getElementById('introduce').readOnly = true;
	}

	self.getRegInfo = function() {
		var url = common.gServerUrl + 'API/RegLectures/RegLecturesInfoByID';
		url += '?regId=' + rid;
		mui.ajax(url, {
			type: 'GET',
			success: function(result) {
				var obj = JSON.parse(result);
				console.log(result);
				self.UserName(obj.TbActivityRegLectures.UserName); //姓名
				self.GenderText(common.gJsonGenderType[obj.TbActivityRegLectures.Gender].text); //性别
				self.Gender(obj.TbActivityRegLectures.Gender); //性别value
				self.Birthday(obj.TbActivityRegLectures.Birthday.split(' ')[0]); //生日
				self.Native(obj.TbActivityRegLectures.Native); //籍贯
				self.Nation(obj.TbActivityRegLectures.Nation); //民族
				self.CommentName(obj.TbActivityRegLectures.CommentName); //赛区
				self.CommentId(obj.TbActivityRegLectures.CommentId); //赛区id
				self.IDCard(obj.TbActivityRegLectures.IDCard); //身份证
				self.Email(obj.TbActivityRegLectures.Email); //邮箱
				self.UserPhone(obj.TbActivityRegLectures.UserPhone); //手机
				self.WeiXin(obj.TbActivityRegLectures.WeiXin); //微信号
				self.Resume(obj.TbActivityRegLectures.Resume); //简历
				self.ChapterOptionText(obj.TbActivityRegLectures.ChapterOptionText); //曲目
				self.ChapterOption(obj.TbActivityRegLectures.ChapterOption); //曲目id
				self.Education(obj.TbActivityRegLectures.Education); //教育经历
				self.teacher(obj.TbActivityRegLectures.TeacherName);
				self.teacherPhone(obj.TbActivityRegLectures.TeacherPhone);
				/*self.Province("广东省"); //默认广东省
				self.City("广州市"); //默认广州市
				self.District("天河区"); //默认天河区*/
				self.Address(obj.TbActivityRegLectures.Address);
				//self.ChapterArray([]);
				self.price(obj.TbActivityRegLectures.Amount);
				self.pricePay(obj.TbActivityRegLectures.Amount);
				self.isFinish(obj.TbActivityRegLectures.IsFinish);
				self.regUsingFree(obj.TbActivityRegLectures.RegUsingFree);
				
				if(common.StrIsNull(obj.TbActivityRegLectures.VIPDiscountJson) != ''){
                	self.vipDiscounts(JSON.parse(obj.TbActivityRegLectures.VIPDiscountJson));
                }
                self.initPayInfo();
			}
		});
	}

	var genders, CommentNames, ChapterOptions, places;
	mui.plusReady(function() {
		self.genders = new mui.PopPicker(); //性别
		self.genders.setData(common.gJsonGenderType);

		self.CommentNames = new mui.PopPicker(); //报名地区
		self.ChapterOptions = new mui.PopPicker(); //曲目

		self.places = new mui.PopPicker({
			layer: 3
		});
		self.places.setData(cityData3);

		var web = plus.webview.currentWebview();
		if (typeof(web.aid) !== "undefined") {
			aid = web.aid;
		}
		if (typeof(web.rid) !== "undefined") {
			rid = web.rid;
		}

		if (typeof(web.order) != "undefined") { //从订单跳转进来
			//console.log(JSON.stringify(web.order));
			rid = web.order.TargetID;
		}
		console.log(rid);
		if (rid === 0) {
			self.getJson();
			self.UserName(getLocalItem('DisplayName'));
			self.UserPhone(getLocalItem('UserName'));
		} else {
			self.canChange(false);
			self.setChange();
			self.getRegInfo();
		}
		self.getBalance();
	})

	mui.init({
		beforeback: function() {
			var opener = plus.webview.currentWebview().opener();
			//console.log(JSON.stringify(activityInfo));
			if (opener.id.indexOf('applyList.html') >= 0) {
				mui.fire(opener, 'refreshList');
			}
			if (opener.id.indexOf('myOrders.html') >= 0) {
				common.refreshOrder(); //刷新订单
			}

			//返回true，继续页面关闭逻辑
			return true;
		}
	});
}
ko.applyBindings(teacherFTF);