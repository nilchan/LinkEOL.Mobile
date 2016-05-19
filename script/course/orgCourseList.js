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
				console.log(responseText);
				var result = JSON.parse(responseText);
				self.orgCourses(result);
				
				mui('#pullrefresh').pullRefresh().refresh(true);
				
			}
		});
	};

	//跳转详情
	self.gotoDetail = function(data) {
		common.transfer('orgInfo.html', false, {
			oid: data.info.ID
		}, false, false);
	};
	
	//
	self.goCourseInfo=function(data){
		common.transfer('orgCourseInfo.html',false,{
			cid:data.ID
		},false,false)
	}

	//选择城市
	self.selectCity = function(obj, e) {
		self.selectedCity(this);
		self.selectedDistrict('全城');
		province = e.currentTarget.parentElement.parentElement.previousElementSibling.innerText;
		city = this.text;
		district = '全城';

		pageNum = 1;
		self.getOrgs();
		$('#address-box').hide();
		//mui('#pullrefresh').pullRefresh().refresh(true);
	};

	//选择地区
	self.selectDistrict = function() {
		self.selectedDistrict(this.text);
		district = this.text;
		pageNum = 1;
		self.getOrgs();
		$('#address-box').hide();
		//mui('#pullrefresh').pullRefresh().refresh(true);
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
				document.getElementById('teacher-scroll').style.marginTop = '67px';
				document.getElementById('teacher-scroll').style.paddingBottom = '50px';
				document.getElementById('address-box-header').style.height = '59px';
				document.getElementById('address-box-header').style.paddingTop = '15px';
				document.getElementById('address-box-content').style.marginTop = '15px';
			}
		});
	}

	mui.init({
		pullRefresh: {
			container: '#pullrefresh',
			down: {
				contentdown : escape('下拉可以刷新'),//可选，在下拉可刷新状态时，下拉刷新控件上显示的标题内容
      			contentover : escape('释放立即刷新'),//可选，在释放可刷新状态时，下拉刷新控件上显示的标题内容
				contentrefresh: '刷新中...',
				callback: pulldownRefresh
			},
			up: {
				contentrefresh:common.gContentRefreshUp,
				contentnomore:common.gContentNomoreUp,
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
					console.log(document.querySelector(".mui-pull-caption").innerHTML);
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