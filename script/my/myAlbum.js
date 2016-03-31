var myAlbum = function() {
	var self = this;
	self.Albums = ko.observableArray([]); //相册数组
	self.DeleteMode = ko.observable(false); //是否正在删除
	self.IsManage = ko.observable(false); //是否管理
	var userid = 0; //老师UserID

	mui.plusReady(function() {
		//mui.ready(function() {
		var self = this;

		var web = plus.webview.currentWebview();
		if (typeof(web.userID) !== "undefined") {
			userid = web.userID; //浏览老师相册
		} else {
			self.IsManage(true); //本人管理相册
			userid = getLocalItem('UserID');
		}

		mui.ajax(common.gServerUrl + "Common/Account/GetAlbum?userid=" + userid, {
			type: 'GET',
			success: function(responseText) {
				var result = JSON.parse(responseText);
				if (result) {
					result.forEach(function(item) {
						var url = common.getPhotoUrl(item.Path);
						var newobj = {
							ID: item.ID,
							Uploading: ko.observable(false),
							Deleting: ko.observable(false),
							Path: item.Path,
							Base64: '',
							Src: url
						}
						self.Albums.push(newobj);
					})

					mui.previewImage();
				}
			}
		});
	})

	self.uploadImage = function(obj) {
		var ajaxUrl = common.gServerUrl + 'Common/Account/UploadPhoto/?userId=' + userid;
		mui.ajax(ajaxUrl, {
			type: 'POST',
			contentType: 'application/json', //如此contentType/data的写法，才能上传图片的base64
			data: JSON.stringify(obj.Base64),
			success: function(responseText) {
				var result = JSON.parse(responseText);
				obj.ID = result.ID; //更新ID值
				obj.Uploading(false); //说明上传完成

				mui.toast('上传成功');
			}
		})
	}

	self.selectImage = function() {
		mui.plusReady(function() {
			picture.SelectPicture(false, true, function(ret) {
				if (ret.length > 0) {
					ret.forEach(function(item) {
						var newobj = {
							ID: 0,
							Uploading: ko.observable(true), //标识正在上传
							Deleting: ko.observable(false),
							Path: '',
							Base64: item.Base64,
							Src: item.Base64
						}
						self.Albums.push(newobj);
						self.uploadImage(newobj);
					})
				}
			});
		});
	}

	//删除状态下选择图片
	self.selectDel = function(value) {
		if (self.DeleteMode()) {
			value.Deleting(!value.Deleting());
			//console.log(value.ID);
		}
	}

	//点击编辑
	self.setDeleting = function() {
		var self = this;
		self.DeleteMode(true);
	}

	//取消编辑
	self.cancelDelete = function() {
		var self = this;
		self.Albums().forEach(function(item) {
			if (item.Deleting()) {
				item.Deleting(false);
			}
		})
		self.DeleteMode(false);
	}

	//确认删除
	self.confirmDelete = function() {
		var self = this;

		var ids = '';
		self.Albums().forEach(function(item) {
			if (item.Deleting()) {
				ids = ids == '' ? item.ID : ids + ',' + item.ID;
			}
		})

		if (ids != '') {
			var ajaxUrl = common.gServerUrl + 'Common/Account/DeletePhotos/?ids=' + ids;
			mui.ajax(ajaxUrl, {
				type: 'POST',
				success: function(responseText) {
					self.Albums.remove(function(item) {
						return item.Deleting();
					})

					mui.toast('删除成功');
					self.DeleteMode(false);
				}
			})
		}
		else{
			mui.toast("请选择需要删除的相片");
			return;
		}
	}
	
	mui.init({
		beforeback: function() {
			common.refreshMyValue({
				valueType: 'album',
				changeValue: 0,
				count: self.Albums().length
			})
			return true
		}
	})
}
ko.applyBindings(myAlbum);