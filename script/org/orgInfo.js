var orgInfo = function() {
	var self = this;
	
	var shareUrl=common.gWebsiteUrl+'modules/org/orgInfo.html?oid=';
	
	var maxLines = 2;
	self.expanded = ko.observable(false);	//是否已展开
	
	//var mapobj; //地图
	var userId = getLocalItem("UserID");
	self.OrgUserID = ko.observable(0);
	self.ID = ko.observable(0);
	self.OrgName = ko.observable(''); //机构全称
	self.Abbreviation = ko.observable(''); //机构简称
	self.Introduce = ko.observable(''); //机构简介
	self.Address = ko.observable(''); //详细地址
	self.Province = ko.observable('');
	self.City = ko.observable('');
	self.District = ko.observable('');
	self.PhotoUrl = ko.observable('');
	self.Lon = ko.observable(''); //经度
	self.Lat = ko.observable(''); //维度
	self.UserFavCount = ko.observable(''); //关注数
	self.photoList = ko.observableArray([]); //相册
	self.regLecturesList = ko.observableArray([]); //精品班
	self.orgToCourseList = ko.observableArray([]); //高考班
	self.isFav = ko.observable(false);
	self.favClass = ko.observable('');
	
	

	self.getOrgInfo = function() {
		var ajaxUrl = '';
		if(self.ID() > 0)
			ajaxUrl = common.gServerUrl + 'API/Org/OrgInfoByID?orgId=' + self.ID();
		else
			ajaxUrl = common.gServerUrl + 'API/Org/OrgInfoByUserID?UserID=' + self.OrgUserID();
			
		mui.ajax(ajaxUrl, {
			type: 'GET',
			success: function(responseText) {
				var result = JSON.parse(responseText);
				console.log(JSON.stringify(result));
				self.OrgName(result.TbOrg.OrgName);
				self.Abbreviation(result.TbOrg.Abbreviation);
				self.Introduce(result.TbOrg.Introduce);
				self.clampText();
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
				//console.log(JSON.stringify(result.OrgToCourseList));
				self.OrgUserID(result.TbOrg.UserID);
				self.getFavStatus();
				//self.setMap(self.Lon(),self.Lat());
				common.showCurrentWebview();
			}
		})
	}

	self.clampText = function(){
		var para;
		if(self.expanded() == true){
			para = 99999;
		}
		else{
			para = maxLines;
		}
		
		$clamp(document.getElementById('pIntroduce'), {
			clamp: para
		});
		self.expanded(!self.expanded());
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
			Share.sendShare(this.id, '今天你学习了吗?', '你新高度的启航点', shareUrl + self.ID(),common.getPhotoUrl(self.PhotoUrl()));

		};
	}

	self.addFav = function() {
		if (userId <= 0) {
			mui.toast("登录后才能关注~")
			return;
		}
		if (self.isFav() == true) { //取消关注
			//console.log('do this');
			var ret = common.deleteAction(common.gDictActionType.Favorite, common.gDictActionTargetType.User, self.OrgUserID(), userId);
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
			var ret = common.postAction(common.gDictActionType.Favorite, common.gDictActionTargetType.User, self.OrgUserID());
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
		common.getActions(common.gDictActionType.Favorite, common.gDictActionTargetType.User, self.OrgUserID(), function(result) {
			if (common.StrIsNull(result) != '') {
				var arr = JSON.parse(result);
				for (var i = 0; i < arr.length; i++) {
					var item = arr[i];
					if (item.UserID.toString() != userId ||
						item.TargetType.toString() != common.gDictActionTargetType.User ||
						item.TargetID.toString() != self.OrgUserID()) {
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
			userID: self.OrgUserID()
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
		
		//common.mapGuide(self.Lon(),self.Lat(),self.Address());
		//common.mapGuide('137.2222222','23.5555555','津滨腾跃大厦');
		//plus.maps.openSysMap('0','津滨腾跃大厦','0')
		//common.mapGuide(self.City(),self.Address());
//		plus.runtime.openURL('androidamap://poi?sourceApplication=softname&keywords=嘉谊轩艺术培训中心',function(e){
//			console.log(JSON.stringify(e));
//		},'com.autonavi.minimap')
		common.mapGuide('',self.Address());
	}

	mui.plusReady(function() {
		Share.updateSerivces(); 
		var thiWeb = plus.webview.currentWebview();
		if (typeof thiWeb.oid !== 'undefined') {
			self.ID(thiWeb.oid);
		}
		if (typeof thiWeb.uid !== 'undefined') {
			self.OrgUserID(thiWeb.uid);
		}
		self.getOrgInfo();
		
	})

}
ko.applyBindings(orgInfo);