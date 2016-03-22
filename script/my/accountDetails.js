var accountDetail = function() {
	var self = this;
	self.accountDetail = ko.observableArray([]); //账户明细数组
	var userId = getLocalItem('UserID'); //用户id
	var page = 1; //页码
	self.accountLength=ko.observable(1);

	//获取收支明细
	self.getAccountDetail = function() {
		var ajaxUrl = common.gServerUrl + 'API/AccountDetails/AccountDetailsList?UserID=' + userId + '&DetailsType=' + common.gAccountDetail[0].value + '&page=' + page;
		mui.ajax(ajaxUrl, {
			type: 'GET',
			success: function(responseText) {
				var result = JSON.parse(responseText);
				self.accountDetail(result); //DetailsType==common.gAccountDetail[1].value?'\+':'\-'
				self.accountLength(self.accountDetail().length);
			}
		})
	}

	//下拉刷新
	function pulldownRefresh() {
		setTimeout(function() {
			mui('#pullrefreshAccount').pullRefresh().endPulldownToRefresh(); //refresh completed
			mui('#pullrefreshAccount').pullRefresh().refresh(true);
			page = 1; //重新加载第1页
			self.getAccountDetail();
		}, 1500);
	}

	//上拉加载
	function pullupRefresh() {
		setTimeout(function() {
			page++;
			var ajaxUrl = common.gServerUrl + 'API/AccountDetails/AccountDetailsList?UserID=' + userId + '&DetailsType=' + common.gAccountDetail[0].value + '&page=' + page;
			mui.ajax(ajaxUrl, {
				type: 'GET',
				success: function(responseText) {
					var result = eval("(" + responseText + ")");
					if (result && result.length > 0) {
						self.accountDetail(self.accountDetail().concat(result));
						self.accountLength(self.accountDetail().length);
						if (result.length < common.gListPageSize) {
							mui('#pullrefreshAccount').pullRefresh().endPullupToRefresh(true);
						} else {
							mui('#pullrefreshAccount').pullRefresh().endPullupToRefresh(false); //false代表还有数据
						}
					} else {
						mui('#pullrefreshAccount').pullRefresh().endPullupToRefresh(true); //true代表没有数据了
					}
				}
			});
		}, 1500);
	}

	mui.init({
		pullRefresh: {
			container: '#pullrefreshAccount',
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

	mui.plusReady(function() {
		self.getAccountDetail();
	})
}
ko.applyBindings(accountDetail);