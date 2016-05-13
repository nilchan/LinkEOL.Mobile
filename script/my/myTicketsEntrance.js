var myTicketsEntrance=function(){
	var self=this;
	
	//我的购票
	self.goMyTicket=function(){
		common.transfer('myTicketsHeader.html',true,{
		},false,false);
	}
	
	//赛事报名
	self.goAcRegister=function(){
		common.transfer('../activity/XSBRegister/applyList.html',true,{},false,true);
	}
	
	//讲座报名
	self.goClassRegister=function(){
		common.transfer('../activity/teacherFTF/applyList.html',true,{},false,true);
	}
	
	//课程报名
	self.goCourseRegister=function(){
		common.transfer('../course/courseApply.html',true,{},false,true);
	}
	
}
ko.applyBindings(myTicketsEntrance);
