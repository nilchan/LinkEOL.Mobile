var addNews=function(){
	var self=this;
	
	self.newsTitle=ko.observable(''); //标题
	self.newsContent=ko.observable(''); //咨询内容
	
	//添加图片
	self.addPhoto=function(){
		var imgBase, tmpImg;
		picture.SelectPicture(false, false, function(retValue) {
			imgBase = retValue[0].Base64;
			tmpImg = "<img src='" + imgBase + "'/>&emsp;";
			var editor = $A.gI('edit');
			editor.innerHTML += tmpImg;
		});
	}
	
	//发布
	self.submitNews = function() {
		if( self.newsTitle() == "" ) {
			mui.toast('请输入标题!');
			return;
		}
		if( $A.gI('edit').innerHTML == "" ) {
			mui.toast('请输入内容!');
			return;
		}
		var url = common.gServerUrl + 'API/News/APPNewsAdd';
		var data = {
			Title: self.newsTitle(),
			PublisherUserID: getLocalItem('UserID'),
			HtmlContent: $A.gI('edit').innerHTML
		};
		mui.ajax(url,{
				type:'POST',
				data:data,
				success:function(responseText){
					mui.toast('发布成功！');
					mui.back();
				}
			})
	}
	
	//添加表情
//	self.addEmoij=function(){
//		
//	}
	
}
ko.applyBindings(addNews);
