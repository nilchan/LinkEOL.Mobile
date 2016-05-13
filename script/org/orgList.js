var orgList = function() {
	var self = this;

	var pageNum = 1,
		province = '广东省',
		city = '广州市',
		district = '全城',
		work = '',
		singleSelect = false, //是否单选
		selectedArray = [], //选中列表
		userID = getLocalItem('UserID'),
		initOrg = {};

	self.displayCheck = ko.observable(false); //是否开启选择功能
	self.orgs = ko.observableArray([]); //机构列表
	self.selectedProvince = ko.observable('广东省'); //选中省份
	self.selectedCity = ko.observable(cityData3[18].children[0]); //选中城市
	self.selectedDistrict = ko.observable('全城'); //选中地区
	self.cityList = ko.observableArray([]); //省市区JSON

	//初始化结果
	function initResult(result) {
		result.forEach(function(item) {
			var obj = {
				info: item,
				selected: ko.observable(false)
			};
			if (item.IsBound) {
				obj.selected(true);
			}
			self.orgs.push(obj);
		});
	}

	//绑定机构
	function org2UserAdd(data) {
		var url = common.gServerUrl + 'Common/Org/OrgToUserAdd';
		mui.ajax(url, {
			type: 'POST',
			contentType: 'application/json',
			data: JSON.stringify(data),
			success: function(responseText) {
				mui.back();
				mui.toast("修改成功");
			}
		});
	}

	//解绑机构
	function org2UserDelete(data) {
		var url = common.gServerUrl + 'Common/Org/OrgToUserDel';
		mui.ajax(url, {
			type: 'DELETE',
			contentType: 'application/json',
			data: JSON.stringify(data),
			success: function(responseText) {}
		});
	}

	//拼接请求Url
	self.getAjaxUrl = function() {
		var ajaxUrl = common.gServerUrl + "API/Org/OrgAPPList";
		ajaxUrl += "?page=" + pageNum;
		ajaxUrl += "&province=" + encodeURI(province);
		ajaxUrl += "&city=" + encodeURI(city);
		if (district !== '全城') {
			ajaxUrl += "&district=" + encodeURI(district);
		}
		ajaxUrl += '&keyword=' + work;
		ajaxUrl += '&userId=' + userID;
		ajaxUrl += '&pageSize=12';
		return ajaxUrl;
	};

	var onceFun = common.runOnlyOnce(function(data) {
		initOrg = data;
	});

	//加载作品
	self.getOrgs = function() {
		self.orgs([]);
		mui.ajax(self.getAjaxUrl(), {
			type: 'GET',
			success: function(responseText) {
				var result = JSON.parse(responseText);
				initResult(result);
				if (singleSelect) {
					onceFun(result[0]);
				}
			}
		});
	};

	//跳转详情
	self.gotoDetail = function(data) {
		common.transfer('orgInfo.html', false, {
			oid: data.info.ID
		}, false, false);
	};

	//选中一个
	self.selectOne = function(data) {
		if (singleSelect) {
			if( !data.selected() ) {
				self.orgs().forEach(function(item) {
					item.selected(false);
				});
			}
		}
		data.selected(!data.selected());
	};

	//取消选择
	self.cacelSelect = function() {
		mui.back();
	};

	//确认选择
	self.confirmSelect = function() {
		data = [];
		self.orgs().forEach(function(item) {
			if (item.selected()) {
				selectedArray.push(item.info);
			}
		});

		var data = [];
		selectedArray.forEach(function(item) {
			var obj = {
				OrgID: item.ID,
				UserID: userID
			};
			data.push(obj);
		});

		if (singleSelect) {
			var obj = {
				OrgID: initOrg.ID,
				UserID: userID
			};
			var tmp = [];
			tmp.push(obj);
			org2UserDelete(tmp);
		}
		
		if( data.length > 0 ) {
			org2UserAdd(data);
		} else {
			mui.back();
		}
		
	};

	//点击列表
	self.clickOne = function() {
		if (self.displayCheck()) {
			self.selectOne(this);
		} else {
			self.gotoDetail(this);
		}
	};

	//选择城市
	self.selectCity = function(obj, e) {
		self.selectedCity(this);
		self.selectedDistrict('全城');
		province = e.currentTarget.parentElement.parentElement.previousElementSibling.innerText;
		city = this.text;
		district = '全城';

		pageNum = 1;
		self.getOrgs();
		mui('#pullrefresh').pullRefresh().refresh(true);
		$('#address-box').hide();
	};

	//选择地区
	self.selectDistrict = function() {
		self.selectedDistrict(this.text);
		district = this.text;
		pageNum = 1;
		self.getOrgs();
		//		mui('#pullrefresh').pullRefresh().endPullupToRefresh(false);
		mui('#pullrefresh').pullRefresh().refresh(true);
		$('#address-box').hide();
	};

	$(function() {
		$('#showDistrict').click(function() {
			$('#district').toggleClass('more-county-display');
		});

		$('.city-list').on('tap', function() {
			$(this).parent().find('.more-county').toggleClass('more-county-display');
		});

		$('#seachInput').on('keydown', common.debounce(function() {
			work = $('#seachInput')[0].value;
			pageNum = 1;
			self.getOrgs();
			mui('#pullrefresh').pullRefresh().refresh(true);
		}, 1000));
	});

	if (mui.os.plus) {
		mui.plusReady(function() {
			if (plus.os.vendor == 'Apple') {
				mui('.mui-scroll-wrapper').scroll();
			}
		});
	}

	mui.init({
		pullRefresh: {
			container: '#pullrefresh',
			down: {
				contentdown: "下拉可以刷新",
				contentover: "释放立即刷新",
				contentrefresh: common.gContentRefreshDown,
				callback: pulldownRefresh
			},
			up: {
				contentrefresh: common.gContentRefreshUp,
				contentnomore: common.gContentNomoreUp,
				callback: pullupRefresh
			}
		},
		beforeback: function() {
			var parent = plus.webview.currentWebview().opener();
			if (self.displayCheck()) {
				mui.fire(parent, 'refreshOrgs', {
					orgs: selectedArray
				});
			}
			return true;
		}
	});

	function pulldownRefresh() {
		setTimeout(function() {
			self.orgs([]);
			pageNum = 1;
			mui.ajax(self.getAjaxUrl(), {
				type: 'GET',
				success: function(responseText) {
					var result = JSON.parse(responseText);
					mui('#pullrefresh').pullRefresh().endPulldownToRefresh();
					initResult(result);
					mui('#pullrefresh').pullRefresh().refresh(true); //重置上拉加载
				}
			});
		}, 1500)
	}

	function pullupRefresh() {
		setTimeout(function() {
			pageNum++;
			mui.ajax(self.getAjaxUrl(), {
				type: 'GET',
				success: function(responseText) {
					var result = JSON.parse(responseText);
					if (result && result.length > 0) {
						initResult(result);
						if (result.length < common.gListPageSize) {
							mui('#pullrefresh').pullRefresh().endPullupToRefresh(true);
						} else {
							mui('#pullrefresh').pullRefresh().endPullupToRefresh(false); //false代表还有数据
						}
					} else {
						mui('#pullrefresh').pullRefresh().endPullupToRefresh(true); //true代表没有数据了
					}
				}
			});
		}, 1500)
	};

	//		self.getOrgs();
	self.cityList(cityData3);

	mui.plusReady(function() {
		self.getOrgs();
		var web = plus.webview.currentWebview(); //页面间传值
		if (!!web.displayCheck) {
			self.displayCheck(web.displayCheck);
			singleSelect = web.singleSelect;
		}
	});
}

ko.applyBindings(orgList);