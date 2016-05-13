var orgInfo = function() {
	var self = this;
	var mapobj; //地图
	var userId = getLocalItem("UserID");
	self.orgUerId = ko.observable();
	self.ID = ko.observable();
	self.OrgName = ko.observable(); //机构全称
	self.Abbreviation = ko.observable(); //机构简称
	self.Introduce = ko.observable(); //机构简介
	self.Address = ko.observable(); //详细地址
	self.Province = ko.observable();
	self.City = ko.observable();
	self.District = ko.observable();
	self.PhotoUrl = ko.observable();
	self.Lon = ko.observable(); //经度
	self.Lat = ko.observable(); //维度
	self.UserFavCount = ko.observable(); //关注数
	self.photoList = ko.observableArray([]); //相册
	self.regLecturesList = ko.observableArray([]); //精品班
	self.orgToCourseList = ko.observableArray([]); //高考班
	self.isShowIntroduce = ko.observable(true);
	self.isFav = ko.observable(false);
	self.favClass = ko.observable('');

	self.getOrgInfo = function() {
		var ajaxUrl = common.gServerUrl + 'API/Org/OrgInfoByID?orgId=' + self.ID();
		mui.ajax(ajaxUrl, {
			type: 'GET',
			success: function(responseText) {
				var result = JSON.parse(responseText);
				//console.log(JSON.stringify(result));
				self.OrgName(result.TbOrg.OrgName);
				self.Abbreviation(result.TbOrg.Abbreviation);
				self.Introduce(result.TbOrg.Introduce);
				self.Address(result.TbOrg.Address);
				self.Province(result.TbOrg.Province);
				self.City(result.TbOrg.City);
				self.District(result.TbOrg.District);
				self.PhotoUrl(result.TbOrg.Photo);
				self.Lon(result.TbOrg.Lon);
				self.Lat(result.TbOrg.Lat);
				self.photoList(result.PhotoList.length > 4 ? result.PhotoList.slice(0, 4) : result.PhotoList);
				self.regLecturesList(result.RegLecturesList);
				self.orgToCourseList(result.OrgToCourseList);
				self.orgUerId(result.TbOrg.UserID);
				self.clampDes();
				self.getFavStatus();
				//self.setMap(self.Lon(),self.Lat());
				common.showCurrentWebview();
			}
		})
	}

	//关闭分享窗口
	self.closeShare = function() {
		mui('#sharePopover').popover('toggle');
	}

	//分享功能
	var ul = document.getElementById("sharePopover");
	var lis = ul.getElementsByTagName("li");
	for (var i = 0; i < lis.length; i++) {
		lis[i].onclick = function() {
			mui('#sharePopover').popover('toggle');
			plus.nativeUI.showWaiting();
			//Share.sendShare(this.id, '今天你学习了吗?', '你新高度的启航点', shareUrl + TUserID,self.PhotoUrl());

		};
	}

	//改变简介显示
	self.changeShowInstruct = function() {
		self.isShowIntroduce(!self.isShowIntroduce());
	}

	self.clampDes = function() {
		var intros = document.getElementsByClassName('orgInfo-class-address');
		var introsLen = intros.length;
		for (var i = 0; i < introsLen; i++) {
			$clamp(intros[i], {
				clamp: 1
			});
		}
	}

	self.addFav = function() {
		if (userId <= 0) {
			mui.toast("登录后才能关注~")
			return;
		}
		if (self.isFav() == true) { //取消关注
			//console.log('do this');
			var ret = common.deleteAction(common.gDictActionType.Favorite, common.gDictActionTargetType.User, self.orgUerId(), userId);
			if (ret) {
				//self.FavCount(self.FavCount() - 1);
				self.isFav(false);
				self.favClass('');
				mui.toast('成功取消关注');
				common.refreshMyValue({
					valueType: 'fav',
					changeValue: -1,
					count: 0
				})
			}
		} else {
			var ret = common.postAction(common.gDictActionType.Favorite, common.gDictActionTargetType.User, self.orgUerId());
			if (ret) {
				//self.FavCount(self.FavCount() + 1);
				self.isFav(true);
				self.favClass('ogrInfo-attention-active');
				mui.toast('关注成功');
				common.refreshMyValue({
					valueType: 'fav',
					changeValue: 1,
					count: 0
				})
			}
		}
	}

	self.getFavStatus = function() {
		common.getActions(common.gDictActionType.Favorite, common.gDictActionTargetType.User, self.orgUerId(), function(result) {
			if (common.StrIsNull(result) != '') {
				var arr = JSON.parse(result);
				for (var i = 0; i < arr.length; i++) {
					var item = arr[i];
					if (item.UserID.toString() != userId ||
						item.TargetType.toString() != common.gDictActionTargetType.User ||
						item.TargetID.toString() != self.orgUerId()) {
						continue;
					}
					if (item.ActionType.toString() == common.gDictActionType.Favorite) {
						self.favClass('ogrInfo-attention-active');
						self.isFav(true);
					}
				}
			}
		});
	}

	//相册
	self.goAlbum = function() {
		common.transfer("../my/myAlbum.html", false, {
			userID: self.orgUerId()
		})
	}

	//精品详情
	self.regLectures = function(data) {
		common.transfer('../activity/activityInfo.html', false, {
			aid: data.ID
		});
	}

	//高考培训详情
	self.orgToCourse = function(data) {
		common.transfer('../course/orgCourseInfo.html', false, {
			cid: data.ID
		});
	}

	//导航
	self.sysGuide = function() {
		plus.geolocation.getCurrentPosition(function(e) {
			var thisPoint=GPS.gcj_decrypt_exact(e.coords.longitude, e.coords.latitude);
			var addressPoint=GPS.gcj_decrypt_exact(self.Lon(),self.Lat());
			console.log(JSON.stringify(addressPoint));
			plus.maps.openSysMap(new plus.maps.Point(thisPoint.lon,thisPoint.lat), self.Address(),new plus.maps.Point(thisPoint.lon,thisPoint.lat));
		})
	}

	self.addMap = function() {
		mapobj = new plus.maps.Map('mapdiv');
		mapobj.hide();

	}

	mui.plusReady(function() {
		var thiWeb = plus.webview.currentWebview();
		if (typeof thiWeb.oid !== 'undefined') {
			self.ID(thiWeb.oid);
		}
		self.getOrgInfo();
		self.addMap();
	})

}
ko.applyBindings(orgInfo);