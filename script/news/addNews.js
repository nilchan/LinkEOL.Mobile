var addNews=function(){
	var self=this;
	self.newsTitle=ko.observable(''); //标题
	self.newsContent=ko.observable(''); //咨询内容
	
	//添加图片
	self.addPhoto=function(){
		
	}
	
	//添加表情
	self.addEmoij=function(){
		
	}
	
}
ko.applyBindings(addNews);
