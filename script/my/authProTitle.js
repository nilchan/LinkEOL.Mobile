var authProTitle = function() {
	var self = this;
	self.Auth = ko.observable({});
	self.Editable = ko.observable(true); //是否可编辑并提交认证
	self.AuthProStatus = ko.observable("确认信息正确后，请提交审核"); //身份认证状态（显示）
	self.ProTitleTypeText = ko.observable('请选择职称'); //职称类型名称
	self.ProTitleType = ko.observable(0); //职称类型
	self.Base64 = ko.observable(''); //所选图片的base64字符串
	self.Path = ko.observable(''); //图片路径

	mui.init({
		beforeback: function() {
			var teacherAuth = plus.webview.currentWebview().opener();
			//console.log(self.AuthProStatus());
			mui.fire(teacherAuth,'refreshPro',{
				ProAuth:self.Auth()
			});
			return true;
		}
	});

	var ppProTitle, setPic;
	mui.plusReady(function() {
		setPic = new mui.PopPicker();
		setPic.setData(common.gAuthImgage);
		ppProTitle = new mui.PopPicker();
		ppProTitle.setData(common.gProfessionalType);
	});

	//职称选择
	self.chooseAuthPro = function() {
		ppProTitle.show(function(items) {
			self.ProTitleTypeText(items[0].text);
			self.ProTitleType(items[0].value);
		});
	}
	self.showPic = function() {
		if (self.Base64() == "") {
			self.selectPic();
		} else {
			mui.plusReady(function() {
				setPic.show(function(items) {
					if (items[0].value == 0) {
						var imgUpload = document.getElementById('imgUpload');
						imgUpload.setAttribute("data-preview-src", "");
						var previewImg = new mui.previewImage();
						previewImg.open(imgUpload);
						imgUpload.removeAttribute("data-preview-src");
					} else if (items[0].value == 1) {
						//图片选择
						self.selectPic();
					}
				});
			})
		}
	}

	self.initProTitleText = function(value) {
		var list = common.gProfessionalType;
		var retText = '请选择职称';
		list.forEach(function(item) {
			if (item.value == value) {
				retText = item.text;
				return;
			}
		})

		return retText;
	}

	mui.plusReady(function() {
		var self = this;
		var web = plus.webview.currentWebview();
		if (typeof(web.data) !== "undefined") {
			var auth = web.data;

			if (auth && auth.AuthType) {
				self.Auth(auth);
				self.Path(common.getPhotoUrl(auth.PicPath));
				self.ProTitleType(auth.ProTitleType);
				self.ProTitleTypeText(self.initProTitleText(auth.ProTitleType));
				self.AuthProStatus(common.getAuthStatusStr(auth.Approved, auth.PicPath));
				if (auth.Approved == common.gDictAuthStatusType.Rejected) {
					self.AuthProStatus(self.AuthProStatus() + '：' + auth.RejectReason);
				}
				self.Editable(auth.Approved == common.gDictAuthStatusType.NotAuth && common.StrIsNull(auth.PicPath) == '');
			}
		}
	})

	self.selectPic = function() {
		if (!self.Editable()) return;
		mui.plusReady(function() {
			picture.SelectPicture(true, false, function(retValue) {
				self.Path(retValue[0].Base64);
				self.Base64(retValue[0].Base64);
			}); //不需要裁剪，单选
		})
	}
	
	self.reAuth = function(){
		self.Path('');
		self.Editable(true);
	}

	self.authProTitleSub = function() {
		if (self.ProTitleType() == 0) {
			mui.toast("请选择职称");
			return;
		}
		if (self.Base64() == '') {
			mui.toast('请选择证件照片');
			return;
		}
		
		plus.nativeUI.showWaiting();
		var ajaxurl = common.gServerUrl + "API/TeacherAuth/SetProTitleAuth?userId=" +
			getLocalItem('UserID') + '&proTitleType=' + self.ProTitleType();
		mui.ajax(ajaxurl, {
			type: "POST",
			contentType: 'application/json', //如此contentType/data的写法，才能上传图片的base64
			data: JSON.stringify(self.Base64()),
			success: function(responseText) {
				var auth = JSON.parse(responseText);
				if (auth && auth.AuthType) {
					self.Auth(auth);
					self.Path(common.getPhotoUrl(auth.PicPath));
					self.AuthProStatus(common.getAuthStatusStr(auth.Approved, auth.PicPath));
					self.Editable(auth.Approved == common.gDictAuthStatusType.NotAuth && common.StrIsNull(auth.PicPath) == '');
				}

				mui.toast('保存成功');
				mui.back();
				plus.nativeUI.closeWaiting();
			},
			error: function(){
				plus.nativeUI.closeWaiting();
			}
		})
	}
}
ko.applyBindings(authProTitle);