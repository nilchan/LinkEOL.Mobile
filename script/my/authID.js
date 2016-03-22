var authID = function() {

	var self = this;
	var setPic;
	self.IDNumber = ko.observable(""); //身份证号码
	self.Auth = ko.observable({}); //身份认证信息
	self.AuthIDStatus = ko.observable('确认信息正确后，请提交审核'); //身份认证状态（显示）
	self.Editable = ko.observable(true); //是否可编辑并提交认证
	self.Base64 = ko.observable(''); //所选图片的base64字符串
	self.Path = ko.observable(''); //图片路径
	mui.init({
		beforeback: function() {
			var teacherAuth = plus.webview.currentWebview().opener();
			mui.fire(teacherAuth,'refreshID',{
				IDAuth: self.Auth()
			});
			return true
		}
	});
	mui.plusReady(function() {
		var self = this;
		var web = plus.webview.currentWebview();
		if (typeof(web.data) !== "undefined") {
			var auth = web.data;
			
			if (auth && auth.AuthType) {
				self.Auth(auth);
				self.Path(common.getPhotoUrl(auth.PicPath));
				self.IDNumber(auth.IDNumber);
				self.AuthIDStatus(common.getAuthStatusStr(auth.Approved, auth.PicPath));
				if (auth.Approved == common.gDictAuthStatusType.Rejected) {
					self.AuthIDStatus(self.AuthIDStatus() + '：' + auth.RejectReason);
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
	
	self.reAuth = function(){
		self.Path('');
		self.Editable(true);
	}

	self.authIDSub = function() {
		if (!self.Editable()) return;

		if (self.Base64() == '') {
			mui.toast('请选择证件照片');
			return;
		}
		if (self.IDNumber() == '') {
			mui.toast('请输入证件号码');
			return;
		}
		
		var reg = /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/;
		var r = self.IDNumber().match(reg);
		if( r == null ) {
			mui.toast('请输入正确的证件号码');
			return;
		}
		
		plus.nativeUI.showWaiting();
		var ajaxUrl = common.gServerUrl + 'API/TeacherAuth/SetIDAuth?userId=' +
			getLocalItem('UserID') + '&idNumber=' + self.IDNumber();
		//		var ajaxUrl = common.gServerUrl + 'API/TeacherAuth/SetIDAuth?userId=5&idNumber=' + self.IDNumber();
		//		console.log(ajaxUrl);
		mui.ajax(ajaxUrl, {
			type: 'POST',
			contentType: 'application/json', //如此contentType/data的写法，才能上传图片的base64
			data: JSON.stringify(self.Base64()),
			success: function(responseText) {
				var auth = JSON.parse(responseText);
				if (auth && auth.AuthType) {
					self.Auth(auth);
					self.Path(common.getPhotoUrl(auth.PicPath));
					self.IDNumber(auth.IDNumber);
					self.AuthIDStatus(common.getAuthStatusStr(auth.Approved, auth.PicPath));
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
	mui.plusReady(function() {
		setPic = new mui.PopPicker();
		setPic.setData(common.gAuthImgage);
	});
}
ko.applyBindings(authID);