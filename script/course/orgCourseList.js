var orgCourseList = function() {
	var self = this;

	var pageNum = 1,
		province = '广东省',
		city = '广州市',
		district = '全城',
		keyword = '';

	self.orgCourses = ko.observableArray([]); //机构列表
	self.selectedProvince = ko.observable('广东省'); //选中省份
	self.selectedCity = ko.observable(cityData3[1].children[0]); //选中城市
	self.selectedDistrict = ko.observable('全城'); //选中地区
	self.cityList = ko.observableArray([]); //省市区JSON

	//拼接请求Url
	self.getAjaxUrl = function() {
		var ajaxUrl = common.gServerUrl + "API/Org/OrgCourseAPPList";
		ajaxUrl += "?page=" + pageNum;
		ajaxUrl += "&province=" + encodeURI(province);
		ajaxUrl += "&city=" + encodeURI(city);
		if (district !== '全城') {
			ajaxUrl += "&district=" + encodeURI(district);
		}
		ajaxUrl += '&keyword=' + keyword;
		return ajaxUrl;
	};

	//加载作品
	self.getOrgs = function() {
		self.orgCourses([]);
		mui.ajax(self.getAjaxUrl(), {
			type: 'GET',
			success: function(responseText) {
				var result = JSON.parse(responseText);
				self.orgCourses(result);
			}
		});
	};

	//跳转详情
	self.gotoDetail = function(data) {
		common.transfer('orgInfo.html', false, {
			oid: data.info.ID
		}, false, false);
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
			keyword = $('#seachInput')[0].value;
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
		}
	});

	function pulldownRefresh() {
		setTimeout(function() {
			self.orgCourses([]);
			pageNum = 1;
			mui.ajax(self.getAjaxUrl(), {
				type: 'GET',
				success: function(responseText) {
					var result = JSON.parse(responseText);
					mui('#pullrefresh').pullRefresh().endPulldownToRefresh();
					self.orgCourses(result);
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
						self.orgCourses(self.orgCourses().concat(result));
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
	});
}

ko.applyBindings(orgCourseList);