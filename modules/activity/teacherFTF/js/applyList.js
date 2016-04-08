var applyList = function() {
    var self = this;
    var aid = 0;
	
    self.scores = ko.observableArray([]);

    self.getList = function() {
    	if(aid <= 0) return;
    	
        var url = common.gServerUrl + 'Common/RegLectures/RegLecturesInfo?ActivityID=' + aid +'&UserID=' + getLocalItem('UserID');
        mui.ajax(url, {
            type: 'GET',
            success: function(result) {
                console.log(result);
                self.scores(JSON.parse(result));
            }
        });

    };
    
    //增加报名
    self.gotoSignup = function(){
    	common.transfer('apply.html', true, {
			aid: aid
		});
    }
    
    //再次付费
    self.gotoPay=function(){
    	common.transfer('apply.html',true,{
    		rid: this.ID
    	});
    }
    
	
	mui.plusReady(function() {
		aid=common.getQueryStringByName('aid');//传递的活动ID
		self.getList();
		
	});
};

ko.applyBindings(applyList);