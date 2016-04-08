var teacherFTF = function() {
	var self = this;
	var userId = getLocalItem('UserID');
	var activityID = ko.observable(); //活动id
	self.UserName = ko.observable(''); //姓名
	self.GenderText = ko.observable('请选择性别'); //性别
	self.Gender = ko.observable(-1); //性别value
	self.Birthday = ko.observable('请选择出生日期'); //生日
	self.Native = ko.observable(''); //籍贯
	self.Nation = ko.observable(''); //民族
	self.CommentName = ko.observable('请选择赛区'); //赛区
	self.CommentId = ko.observable(); //赛区id
	self.IDCard = ko.observable(''); //身份证
	self.Email = ko.observable(''); //邮箱
	self.UserPhone = ko.observable(''); //手机
	self.WeiXin = ko.observable(''); //微信号
	self.Resume = ko.observable(''); //简历
	self.ChapterOption = ko.observable('请选择曲目'); //曲目
	self.ChapterOptionId = ko.observable(); //曲目id
	self.Education = ko.observable(''); //教育经历
	self.teacher = ko.observable('');
	self.teacherPhone = ko.observable('');
	self.Province = ko.observable("广东省"); //默认广东省
	self.City = ko.observable("广州市"); //默认广州市
	self.District = ko.observable("天河区"); //默认天河区
	self.Address = ko.observable(self.Province() + ' ' + self.City() + ' ' + self.District())

	self.getActivity = function() {
		var ajaxUrl = common.gServerUrl + "Common/RegGame/RegGameInfoByActivityID?ActivityID=" + activityID;
		mui.ajax(ajaxUrl, {
			type: "GET",
			success: function(responseText) {
				var result = JSON.parse(responseText);
				var ChapterOptionJSON = JSON.parse(result.ChapterOptionJSON);
				var CommentNameJSON = JSON.parse(result.CommentNameJSON);
				var ChapterOption = common.JsonConvert(ChapterOptionJSON, 'Id', 'ChapterOption');
				var CommentName = common.JsonConvert(CommentNameJSON, 'Id', 'CommentName');
				mui.ready(function() {
					self.ChapterOptions.setData(ChapterOption);
					self.CommentNames.setData(CommentName);
				})

			}
		})
	}

	//性别设置
	self.setGender = function() {
		mui.ready(function() {
			self.genders.show(function(items) {
				self.GenderText(items[0].text);
				self.Gender(items[0].value);
				console.log(self.Gender());
			});
		});
	}

	//赛区设置
	self.setCommentName = function() {
		mui.ready(function() {
			self.CommentNames.show(function(items) {
				self.CommentName(items[0].text);
				self.CommentId(items[0].value);
			});
		});
	}

	//曲目设置
	self.setChapterOption = function() {
		mui.ready(function() {
			self.ChapterOptions.show(function(items) {
				self.ChapterOption(items[0].text); //赛区
				self.ChapterOptionId(items[0].value); //赛区id
			});
		});
	}

	//生日获取
	self.setBirthday = function() {
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
		mui.ready(function() {
			self.places.show(function(items) {
				cityValueMon = (items[0] || {}).text + " " + common.StrIsNull((items[1] || {}).text) + " " + common.StrIsNull((items[2] || {}).text);
				self.Address(cityValueMon.split(" ")[0]+cityValueMon.split(" ")[1]+cityValueMon.split(" ")[2]);
			});
		})
		
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
		if (common.StrIsNull(self.Gender()) <0) {
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
		if (common.StrIsNull(self.ChapterOptionId()) == "") {
			mui.toast("曲目不能为空");
			return;
		}
		/*if (common.StrIsNull(self.IDCard()) == "") {
			mui.toast("身份证不能为空");
			return;
		}*/

		var data = {
			ActivityID: activityID,
			UserID: userId,
			UserName: self.UserName(),
			Gender: self.Gender(),
			Birthday: self.Birthday(),
			Native: self.Native(),
			Nation: self.Nation(),
			CommentName: self.CommentName(),
			IDCard: self.IDCard(),
			Address: self.Address(),
			Email: self.Email(),
			UserPhone: self.UserPhone(),
			teacher: self.teacher(),
			teacherPhone: self.teacherPhone(),
			WeiXin: self.WeiXin(),
			//Photo": "string",
			Education: self.Education(),
			Resume: self.Resume(),
			ChapterOption: self.ChapterOptionId(),
		}
		
        var evt = event;
		if(!common.setDisabled()) return;

		var ajaxUrl = common.gServerUrl + '/Common/RegLectures/RegLecturesAdd';
		mui.ajax(ajaxUrl, {
			type: 'POST',
			data: data,
			success: function(responseText) {
				mui.toast('报名成功，正在返回...');
				mui.back();
                common.setEnabled(evt);
			},
            error: function(){
            	common.setEnabled(evt);
            }
		});

	}

	var genders, CommentNames, ChapterOptions,places;
	mui.ready(function() {
		self.genders = new mui.PopPicker(); //性别
		self.genders.setData(common.gJsonGenderType);
		
		self.CommentNames = new mui.PopPicker(); //报名地区
		self.ChapterOptions = new mui.PopPicker(); //曲目
		
		self.places = new mui.PopPicker({
			layer: 3
		});
		self.places.setData(cityData3);
		
		activityID = common.getQueryStringByName('aid');
        uphone = common.getQueryStringByName('uname');
        if(common.StrIsNull(uphone) != ''){
        	self.UserPhone(uphone);
        	document.getElementById('tbPhone').disabled = true;
        }
		
		self.getActivity();
		
		
	})

	/*mui.ready(function(){
		self.genders=new mui.PopPicker();//性别
		self.genders.setData(common.gJsonGenderType);
		self.getActivity();
	})*/
}
ko.applyBindings(teacherFTF);