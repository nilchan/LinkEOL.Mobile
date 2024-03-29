var myTicketsContent = function() {
	var self = this;
	var userId = getLocalItem('UserID');
	var readPage = 1;

	self.ticketsArray = ko.observableArray([]);
	self.noData = ko.observable(false);

	mui.init({
		//刷新控件
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

	//下拉刷新
	function pulldownRefresh() {
		setTimeout(function() {
			mui('#pullrefresh').pullRefresh().endPulldownToRefresh(); //refresh completed
			mui('#pullrefresh').pullRefresh().refresh(true);
			readPage = 1; //重新加载第1页
			self.getTickets(function(responseText) {
				var result = JSON.parse(responseText);
				self.ticketsArray(result);
				self.noData(self.ticketsArray().length <= 0);
			
				self.ticketsArray().forEach(function(item, index) {
					if (item.IsOnLine && common.StrIsNull(item.Voucher) != '') {
						var tmpUrl = common.gWebsiteUrl + 'mobile/modules/activity/verifyInfo.html?property=' + common.gJsonActivityActProperty.concert +
							'&targetType=' + common.gDictOrderTargetType.Ticket +
							'&id=' + item.TicketId + '&sign=' + encodeURIComponent(item.Voucher);
						setTimeout(function() {
							self.makeQRCode('qrcode-' + item.TicketId + '-' + item.Id, 120, 120, tmpUrl);
						}, 50 * index);
					}
				});
			});
		}, 1500);
	}

	//上拉加载
	function pullupRefresh() {
		setTimeout(function() {
			readPage++;
			self.getTickets(function(responseText) {
				if (responseText && responseText.length > 0) {
					var result = JSON.parse(responseText);
					self.ticketsArray(self.ticketsArray().concat(result));
					self.noData(self.ticketsArray().length <= 0);
					
					result.forEach(function(item, index) {
						if (item.IsOnLine && common.StrIsNull(item.Voucher) != '') {
							var tmpUrl = common.gWebsiteUrl + 'mobile/modules/activity/verifyInfo.html?property=' + common.gJsonActivityActProperty.concert +
								'&targetType=' + common.gDictOrderTargetType.Ticket +
								'&id=' + item.TicketId + '&sign=' + encodeURIComponent(item.Voucher);
							setTimeout(function() {
								self.makeQRCode('qrcode-' + item.TicketId + '-' + item.Id, 120, 120, tmpUrl);
							}, 50 * index);
						}
					});

					if (responseText.length < common.gListPageSize) {
						mui('#pullrefresh').pullRefresh().endPullupToRefresh(true);
					} else {
						mui('#pullrefresh').pullRefresh().endPullupToRefresh(false); //false代表还有数据
					}
				} else {
					mui('#pullrefresh').pullRefresh().endPullupToRefresh(true); //true代表没有数据了
				}
			});

		}, 1500);
	}

	if (mui.os.plus) {
		mui.plusReady(function() {
			if (plus.os.vendor == 'Apple') {
				mui('.mui-scroll-wrapper').scroll();
			}
		});
	}

	//生成二维码
	self.makeQRCode = function(id, w, h, code) {
		var qrcode = new QRCode(document.getElementById(id), {
			width: w, //设置宽高
			height: h
		});
		qrcode.makeCode(code);
	}

	self.getTickets = function(callback) {
		var ajaxUrl = common.gServerUrl + 'API/ActTicket/UserActTicketList?userid=' + userId + '&page=' + readPage;
		mui.ajax(ajaxUrl, {
			type: 'GET',
			success: function(responseText) {
				if (typeof callback == 'function') {
					callback(responseText);
				}
			},
			error: function(){
				self.noData(self.ticketsArray().length <= 0);
			}
		})
	}

	mui.plusReady(function() {
		self.getTickets(function(responseText) {
			var result = JSON.parse(responseText);
			self.ticketsArray(result);
			self.noData(self.ticketsArray().length <= 0);
			
			self.ticketsArray().forEach(function(item, index) {
				if (item.IsOnLine && common.StrIsNull(item.Voucher) != '') {
					var tmpUrl = common.gWebsiteUrl + 'mobile/modules/activity/verifyInfo.html?property=' + common.gJsonActivityActProperty.concert +
						'&targetType=' + common.gDictOrderTargetType.Ticket +
						'&id=' + item.TicketId + '&sign=' + encodeURIComponent(item.Voucher);
					//console.log(tmpUrl);
					setTimeout(function() {
						self.makeQRCode('qrcode-' + item.TicketId + '-' + item.Id, 120, 120, tmpUrl);
					}, 50 * index);
				}
			});

			/*if (responseText && responseText.length > 0) {
				var result = JSON.parse(responseText);
				self.ticketsArray(result);
				console.log(JSON.stringify(self.ticketsArray()));
				self.ticketsArray().forEach(function(item) {
					if (item.IsOnLine && common.StrIsNull(item.Voucher) != '') {
						self.makeQRCode('qrcode-' + item.Voucher, 300, 300, common.gWebsiteUrl + 'mobile/modules/activity/verifyInfo.html?property=' + common.gJsonActivityActProperty.orchestraRecruit + '&id=' + item.Id + '&sign=' + encodeURIComponent(item.Voucher));
					}
				});
				if (responseText.length < common.gListPageSize) {
					mui('#pullrefresh').pullRefresh().endPullupToRefresh(true);
				} else {
					mui('#pullrefresh').pullRefresh().endPullupToRefresh(false); //false代表还有数据
				}
			} else {
				mui('#pullrefresh').pullRefresh().endPullupToRefresh(true); //true代表没有数据了
			}*/
			common.showCurrentWebview();
		});
	});

}
ko.applyBindings(myTicketsContent);