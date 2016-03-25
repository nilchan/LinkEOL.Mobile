var examEnrollList = function() {
	var self = this;
	
	var userId=getLocalItem('UserID');
	self.examid=ko.observable(0);//考试内容表id
	self.examName=ko.observable('暂无报名记录');//考级标题
	self.ExamCardNum=ko.observable('');
	self.examInfo=ko.observableArray([]);//考评信息内容
	self.enrollList = ko.observableArray([]);//报名列表内容
	
	//获取报名列表
	self.getExamList = function() {
		var ajaxUrl = common.gServerUrl + "API/ExamToUser/ExamToUserList?userid=" +userId + "&examid=" + self.examid() + "&pageSize=" + 999;
		mui.ajax(ajaxUrl, {
			type: 'GET',
			success: function(responseText) {
				//console.log(responseText)
				var examScoreResult = JSON.parse(responseText);
				if(examScoreResult.length>0){
				self.examName(examScoreResult[0].ExamName+"报名记录");
				}
				
				self.enrollList(examScoreResult);
				//console.log(typeof self.enrollList().ExamCardNum=='undefined');
				//console.log(JSON.stringify(self.enrollList()));
				
			}
		})
	}
	
	//获取考级信息
	self.getExamInfo = function() {
		mui.ajax(common.gServerUrl + "Common/Exam/ExamInfo?userid="+userId+ "&examid=" + self.examid() , {
			Type: 'GET',
			success: function(responseText) {
				var result = JSON.parse(responseText);
				self.examInfo(result);
			}

		})
	}
	
	self.addExamEnroll=function(){
		common.transfer("examEnroll.html",true,{
			subjectArray: self.examInfo().Subject,
			examid: self.examInfo().ID,
			ExamFee: self.examInfo().ExamFee,
			fromList: true
		});
	}
	
	self.gotoPay=function(data){
		common.transfer("examEnroll.html",true,{
			examEnrollData:data,
			fromList: true
		});
		var examEnroll=plus.webview.getWebviewById('examEnroll.html');
		
		mui.fire(examEnroll,'disableReset',{});
		//console.log(JSON.stringify(examEnroll));
	}
	
	
	window.addEventListener('refreshList', function(event) {
		var examid = event.detail.examid;
		//console.log(examid);
		self.examid(examid);
		self.getExamList();
		//self.getExamInfo();
	});

	mui.plusReady(function() {
		var thisWebview=plus.webview.currentWebview();
		if(typeof(thisWebview.examid)!="undefined"){
			self.examid(thisWebview.examid);
			self.getExamList();
			self.getExamInfo();
		}
	})
	
	mui.init({
		beforeback: function() {
			var pp = plus.webview.currentWebview().opener();
			mui.fire(pp,'reloadNotice',{});
			return true;
		}
	})

}
ko.applyBindings(examEnrollList);