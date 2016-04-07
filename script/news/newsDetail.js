var newsDetail=function(){
	var self=this;
	var newsID;//新闻资讯的id
	self.newsDetail=ko.observable({});//新闻资讯详情
	self.LikeStatus = ko.observable("star-before");//点赞前样式
	var userId=getLocalItem('UserID');
	self.editText=ko.observable('编辑');//编辑按钮名字
	self.editStat=ko.observable(false);//是否启动编辑状态
	self.isLink = ko.observable(true);
	self.isLike=ko.observable(false);
	//新闻资讯实例化
	self.initNews=function(newsDetail){
		var self=this;
		self.newsID=ko.observable(newsDetail.ID);//id
		self.Title=ko.observable(newsDetail.Title);//新闻资讯标题
		self.PostTime=ko.observable(newsDetail.PostTime);//新闻发布时间
		self.PublisherUserID=ko.observable(newsDetail.PublisherUserID);//新闻资讯作者id
		self.HtmlContent=ko.observable(newsDetail.HtmlContent);//新闻资讯内容html
		self.DisplayName=ko.observable(newsDetail.DisplayName);//新闻资讯作者名字
		self.LikeCount=ko.observable(newsDetail.LikeCount);//新闻点赞数*/
		self.ShareCount=ko.observable(newsDetail.ShareCount);//新闻分享次数
		self.IsTop=ko.observable(newsDetail.IsTop);//新闻是否置顶
		self.IsElite=ko.observable(newsDetail.IsElite);//新闻是否精华
		self.FavCount=ko.observable(newsDetail.FavCount);//新闻收藏次数
		self.Photo = ko.observable(common.getPhotoUrl(newsDetail.Photo));//头像
		self.IsAuthority = ko.observable(newsDetail.IsAuthority);//是否官方
	}
	
	//获取详情
	self.getNewsDetail=function(){
		var ajaxUrl=common.gServerUrl+'Common/News/GetNewsByNewsID?id='+newsID;
		mui.ajax(ajaxUrl,{
			type:'GET',
			success:function(responseText){
				//console.log(responseText);
				if( responseText == "" ) {
					//plus.nativeUI.closeWaiting();
					mui.toast('资讯已被删除，请返回列表刷新~');
					mui.back();
					return ;
				}
				var result=JSON.parse(responseText);
				//console.log(JSON.stringify(result))
				//self.LikeCount(result.LikeCount);
				var obj = new self.initNews(result);
				self.newsDetail(obj);
				self.isLink(newsDetail().IsAuthority());
				shareTitle = self.newsDetail().Title();
				common.showCurrentWebview();
				
				//获取动作的状态
				common.getActions(2, common.gDictActionTargetType.News, self.newsDetail().newsID(), function(result) {
					if (common.StrIsNull(result) != '') {
						var arr = JSON.parse(result);
						for (var i = 0; i < arr.length; i++) {
							var item = arr[i];
							if (item.UserID.toString() != getLocalItem("UserID") ||
								item.TargetType.toString() != common.gDictActionTargetType.News ||
								item.TargetID.toString() != self.newsDetail().newsID()) {
								continue;
							}
							if (item.ActionType.toString() == common.gDictActionType.Like) {
								//self.LikeStatus("star-after");
								self.isLike(true);
							}
						}
					}
				});
				
				var iframes = document.getElementsByTagName('iframe');
				var w = document.body.clientWidth - 20;
				for(var i = 0; i < iframes.length; i ++) {
					iframes[i].style.width = w + 'px';
					iframes[i].style.height = w * 0.74 + 'px';
				}
			}
		})
	}
	
	//是否为作者
	self.IsAuthor = ko.computed(function() {
		if (typeof self.newsDetail().PublisherUserID == "undefined")
			return false;

		if (userId == self.newsDetail().PublisherUserID())
			return true;
		else
			return false;
	})

	
	//点赞
	self.addLikeCount=function(){
		if (getLocalItem("UserID") <= 0) {
			mui.toast("登录后才能点赞~")
			return;
		}
		/*if (self.IsAuthor()) { //作者本人不允许赞
			mui.toast('自己的作品不需要点赞了吧~');
			return;
		}*/

		var ret = common.postAction(common.gDictActionType.Like, common.gDictActionTargetType.News, self.newsDetail().newsID());
		if (ret) {
			self.isLike(true);
			self.newsDetail().LikeCount(self.newsDetail().LikeCount() + 1);
			//self.LikeStatus("star-after");
			mui.toast('感谢您的赞许');
		}
	}
	
	//编辑
	self.edit=function(){
		if(self.editStat()){//点击完成事件
			var ajaxUrl=common.gServerUrl+'API/News/APPNewsUpdate?id='+newsID;
			var data={
				Title:$A.gI('title').innerText,
				HtmlContent:$A.gI('edit').innerHTML
			};
			
			mui.ajax(ajaxUrl,{
				type:'PUT',
				data:data,
				success:function(responseText){
					self.getNewsDetail();
					mui.toast('编辑成功！');
				}
			})
			self.editStat(false);
			$A.gI('edit').contentEditable = "false";
			$A.gI('title').contentEditable = "false";
			self.editText('编辑');
			
			$A.gI('edit').style.maxHeight = 'none';
		}else{//点击编辑事件
			self.editStat(true);
			self.editText('完成');
			$A.gI('edit').contentEditable = "true";
			$A.gI('title').contentEditable = "true";
			mui.toast('编辑模式开启~');
			
			if (mui.os.ios) {
				var h = window.screen.height - 245;
				$A.gI('edit').style.maxHeight = h + 'px';
			} else {
				$A.gI('edit').style.maxHeight = '330px';
			}
		}
		
	}
	
	//添加图片
	self.addPhoto = function() {
		var imgBase, tmpImg;
		picture.SelectPicture(false, false, function(retValue) {
			imgBase = retValue[0].Base64;
			tmpImg = "<img src='" + imgBase + "'/>&emsp;<div> </div>";
			var editor = $A.gI('edit');
			editor.innerHTML += tmpImg;
		});
	}
	
	//关闭分享
	self.closeShare=function(){
		mui('#sharePopover').popover();
	}
	
	//分享的参数
	var shareTitle = '';
	var shareContent = '想跟你说的事';
	var shareUrl = common.gWebsiteUrl + "modules/news/newsInfo.html?id=";
	var shareImg = "";

	//分享功能
	var ull = document.getElementById("recommendArray");
	var lis = ull.getElementsByTagName("li");
	for (var i = 0; i < lis.length; i++) {
		lis[i].onclick = function() {
			mui('#sharePopover').popover('toggle');
			plus.nativeUI.showWaiting();
			Share.sendShare(this.id, shareTitle, shareContent, shareUrl+newsID , shareImg, common.gShareContentType.news);
			
		}
	}
	
	self.closeShare=function(){
		mui('#sharePopover').popover('toggle');
	}
	
//	newsID = 149;
//	self.getNewsDetail();
	
	mui.plusReady(function(){
		Share.updateSerivces(); //初始化分享
		var thisWeb=plus.webview.currentWebview();
		if(typeof thisWeb.newsId !='undefined'){
			newsID=thisWeb.newsId;
		}
		
		self.getNewsDetail();
	});
}
ko.applyBindings(newsDetail);
