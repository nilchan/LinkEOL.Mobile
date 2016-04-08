var examScore = function() {
    var self = this;
    var aid;

    self.scores = ko.observableArray([]);

    self.getExamScore = function() {
        var url = common.gServerUrl + 'Common/RegGame/RegGameInfo?ActivityID=' + aid +'&UserID=' + getLocalItem('UserID');
        mui.ajax(url, {
            type: 'GET',
            success: function(result) {
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
    		rid:this.ID
    	});
    }
	
	mui.plusReady(function(){
		var web = plus.webview.currentWebview();
		if (typeof(web.aid) !== "undefined") {
			aid = web.aid;
		}
		self.getExamScore();
	});

	window.addEventListener('refreshList', function(event) {
		self.getExamScore();
	})
};

ko.applyBindings(examScore);