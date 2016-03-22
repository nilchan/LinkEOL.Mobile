var examPlace=function(){
	var self=this;
	self.examid=ko.observable(0);
	self.examName=ko.observable('');//考级标题
	self.isExistScore=ko.observable(true);//是否存在该考生成绩，默认false
	self.examInfoArray=ko.observableArray([]);//考评成绩数组
	
	self.getExamPlace=function(){
		var ajaxUrl=common.gServerUrl+"API/ExamToUser/ExamToUserList?userid="+getLocalItem('UserID')+"&examid="+self.examid()+"&pageSize="+999+"&payStat="+common.gExamOrderStatus[1].value;
		//console.log(ajaxUrl);
		mui.ajax(ajaxUrl,{
			type:'GET',
			success:function(responseText){
				var examInfoResult=JSON.parse(responseText);
				self.examInfoArray(examInfoResult);
				if(examInfoResult.length>0){
				self.examName(examInfoResult[0].ExamName+"考场");
				}
				//console.log(JSON.stringify(self.examInfoArray()));
				if(self.examInfoArray().length<=0){
					self.isExistScore(false)
				}
			}
		})
	}
	
	//返回首页
	self.backIndex=function(){
		common.showIndexWebview(0,false);
	}
	
	mui.plusReady(function(){
		var thisWebview=plus.webview.currentWebview();
		if(typeof(thisWebview.examid)!="undefined"){
			self.examid(thisWebview.examid);
			self.getExamPlace();
		}
	})
	
}
ko.applyBindings(examPlace);
