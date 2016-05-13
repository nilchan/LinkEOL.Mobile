var courseApply=function(){
	var self=this;
	var userid=getLocalItem('UserID');
	self.couresList=ko.observableArray([]);
	var page=1;
	
	self.getCouresList=function(){
		var ajaxUrl=common.gServerUrl+'API/Org/OrgCourseRegInfo?courseId=0&UserID='+userid+'&page='+page;
		mui.ajax(ajaxUrl,{
			type:'GET',
			success:function(responseText){
				var result=JSON.parse(responseText);
				self.couresList(result);
			}
		})
	}
	
	mui.init({
		//刷新控件
		pullRefresh: {
			container: '#pullrefresh',
			up: {
				contentrefresh:'努力加载中...',
				contentnomore:'没有更多数据了',
				callback: pullupRefresh
			}
		}
	});
	
	function pullupRefresh(){
		page++;
		var ajaxUrl=common.gServerUrl+'API/Org/OrgCourseRegInfo?courseId=0&UserID='+userid+'&page='+page;
		mui.ajax(ajaxUrl,{
			type:'GET',
			success:function(responseText){
				if (responseText && responseText.length > 0) {
						var result=JSON.parse(responseText);
						self.couresList(self.couresList().concat(result));
						if (responseText.length < common.gListPageSize) {
							mui('#pullrefresh').pullRefresh().endPullupToRefresh(true);
						} else {
							mui('#pullrefresh').pullRefresh().endPullupToRefresh(false); //false代表还有数据
						}
					} else {
						mui('#pullrefresh').pullRefresh().endPullupToRefresh(true); //true代表没有数据了
					}
			}
		})
	}
	
	self.goCalssDetail=function(data){
		common.transfer('../course/orgCourseInfo.html',true,{
			regData:data
		},false,false)
	}
	
	window.addEventListener('refreshReg',function(event){
		self.getCouresList();
	})
	
	
	
	mui.plusReady(function(){
		self.getCouresList();
	})
}
ko.applyBindings(courseApply);
