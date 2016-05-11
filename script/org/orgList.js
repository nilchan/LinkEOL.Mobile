var orgList = function() {
	var self = this;

	var pageNum = 1, province = '广东省', city='广州市', district='全城', work = '';
	self.orgs = ko.observableArray([]);								//机构列表
	self.selectedProvince = ko.observable('广东省');					//选中省份
	self.selectedCity = ko.observable(cityData3[18].children[0]);	//选中城市
	self.selectedDistrict = ko.observable('全城');					//选中地区
	self.cityList = ko.observableArray([]);							//省市区JSON
	
	//拼接请求Url
	self.getAjaxUrl = function() {
		var ajaxUrl = common.gServerUrl + "API/Org/OrgAPPList";
		ajaxUrl += "?page=" + pageNum;
		ajaxUrl += "&province=" + encodeURI(province);
		ajaxUrl += "&city=" + encodeURI(city);
		if( district !== '全城' ) {
			ajaxUrl += "&district=" + encodeURI(district);
		}
		ajaxUrl += '&work=' + work;
		return ajaxUrl;
	}

	//加载作品
	self.getOrgs = function() {
		self.orgs([]);
		mui.ajax(self.getAjaxUrl(), {
			type: 'GET',
			success: function(responseText) {
				var result = JSON.parse(responseText);
				self.orgs(result);
			}
		});
	};
	

	
	mui.init({
		pullRefresh: {
			container: '#pullrefresh',
			down: {
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
			pageNum = 1;
			mui.ajax(self.getAjaxUrl(), {
				type: 'GET',
				success: function(responseText) {
					var result = JSON.parse(responseText);
					mui('#pullrefresh').pullRefresh().endPulldownToRefresh();
					self.orgs(result);
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
						self.orgs(self.orgs().concat(result));
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

	if (mui.os.plus) {
		mui.plusReady(function() {
			if (plus.os.vendor == 'Apple') {
				mui('.mui-scroll-wrapper').scroll();
			}
		});
	}

	self.gotoDetail = function(data) {
		common.transfer('orgInfo.html', false, {
			oid: data.ID
		}, false, false);
	}
	
	self.selectCity = function(obj, e) {
		self.selectedCity(this);
		self.selectedDistrict('全城');
		province = e.currentTarget.parentElement.parentElement.previousElementSibling.innerText;
		city = this.text;
		district = '全城';
		self.getOrgs();
		$('#address-box').hide();
		
	}
	
	self.selectDistrict = function() {
		self.selectedDistrict(this.text);
		district = this.text;
		self.getOrgs();
		$('#address-box').hide();
	}
	
	$(function() {
		$('#showDistrict').click(function(){
			$('#district').toggleClass('more-county-display');
		});
		
		$('.city-list').on('tap', function(){
			$(this).parent().find('.more-county').toggleClass('more-county-display');
		});
		
		$('#seachInput').on('keydown', common.debounce(function(){
			work = $('#seachInput')[0].value;
			self.getOrgs();
		},1000));
	});
	
	
	self.getOrgs();
	self.cityList(cityData3);
//	mui.plusReady(function() {
//		self.getOrgs();
//	});
}

ko.applyBindings(orgList);
