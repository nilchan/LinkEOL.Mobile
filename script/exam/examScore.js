var examScore=function(){
	var self=this;
	self.examid=ko.observable(0);
	self.examName=ko.observable('');//考级标题
	self.isExistScore=ko.observable(true);//是否存在该考生成绩，默认false
	self.examScoreArray=ko.observableArray([]);//考评成绩数组
	
	self.getExamScore=function(){
		var ajaxUrl=common.gServerUrl+"API/ExamToUser/ExamToUserList?userid="+getLocalItem('UserID')+"&examid="+self.examid()+"&pageSize="+999+"&payStat="+common.gExamOrderStatus[1].value;
		mui.ajax(ajaxUrl,{
			type:'GET',
			success:function(responseText){
				var examScoreResult=JSON.parse(responseText);
				self.examScoreArray(examScoreResult);
				if(examScoreResult.length>0){
				self.examName(examScoreResult[0].ExamName+"成绩");
				}
				
				//console.log(JSON.stringify(self.examScoreArray()));
				if(self.examScoreArray().length<=0){
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
			self.examid(thisWebview.examid)
			self.getExamScore();
		}
		
		
	})
	
}
ko.applyBindings(examScore);
