var applyList = function() {
    var self = this;
    var aid = 0;
    self.hasActivity = ko.observable(false);

    self.scores = ko.observableArray([]);
	
	//生成二维码
    self.makeQRCode = function(id, w, h, code) {
    	var qrcode = new QRCode(document.getElementById(id), {
				width: w, //设置宽高
				height: h
			});
		qrcode.makeCode(code);
    }
	
    self.getList = function() {
    	if(aid < 0) return;
    	//common.showCurrentWebview();
        var url = common.gServerUrl + 'Common/RegGame/RegGameInfo?ActivityID=' + aid +'&UserID=' + getLocalItem('UserID');
        mui.ajax(url, {
            type: 'GET',
            success: function(result) {
                self.scores(JSON.parse(result));
             
              	self.scores().forEach(function(item){
					if( item.IsVoucher && common.StrIsNull(item.Voucher) != '') {
						var tmpUrl = common.gWebsiteUrl + 'mobile/modules/activity/verifyInfo.html?property='+common.gJsonActivityActProperty.orchestraRecruit+
							'&targetType='+common.gDictOrderTargetType.RegGame+
							'&id=' + item.ID + '&sign=' + encodeURIComponent(item.Voucher);
						self.makeQRCode('qrcode-'+item.ID, 120, 120, tmpUrl);
					}
				});
				 common.showCurrentWebview();
				
                
            },
            error: function(){
            	common.showCurrentWebview();
            }
        });

    };
    
    
    
    //增加报名
    self.gotoSignup = function(){
    	common.transfer('apply.html', true, {
			aid: aid
		}, false, false);
    }
    
    //再次付费
    self.gotoPay=function(){
    	common.transfer('apply.html',true,{
    		rid:this.ID
    	}, false, false);
    }
	
	mui.plusReady(function(){
		var web = plus.webview.currentWebview();
		if (typeof(web.aid) !== "undefined") {
			aid = web.aid;
			self.hasActivity(true);
		}else{
			aid = 0;
		}
		self.getList();
	});

	window.addEventListener('refreshList', function(event) {
		self.getList();
	})
};

ko.applyBindings(applyList);