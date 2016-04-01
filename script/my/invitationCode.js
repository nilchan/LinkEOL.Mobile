var invitationCode=function(){
	var self=this;
	self.inviteCode=ko.observable(''); //邀请码
	var disPlayName;
	
	//分享的参数
	var shareTitle = "我正在用这款应用点评作业，这是我分享给你的邀请码";
	var shareContent = "诚邀您来体验作业点评的乐趣";
	var shareUrl = common.gWebsiteUrl + "modules/my/inviteShare.html?inviteCode=";
	var shareImg = "";
	var nameUrl='&disPlayName=';
	
	//关闭分享弹框
	self.closeShare=function(){
		mui('#sharePopover').popover('toggle');
	}
	
	//分享跳转
	var ul = document.getElementById("sharePopover");
	var lis = ul.getElementsByTagName("li");
	for (var i = 0; i < lis.length; i++) {
		lis[i].onclick = function() {
            //alert(this.id)
			Share.sendShare(this.id, shareTitle, shareContent, encodeURI(shareUrl+self.inviteCode()+nameUrl+disPlayName), shareImg);
			mui('#sharePopover').popover('toggle');
		};
	}
	
	
	mui.plusReady(function(){
		Share.updateSerivces();//分享初始化
		var thisWeb=plus.webview.currentWebview();
		if(typeof thisWeb.inviteCode !='undefined'){
			self.inviteCode(thisWeb.inviteCode);
		}
		if(typeof thisWeb.disPlayName !='undefined'){
			disPlayName=thisWeb.disPlayName;
		}
	})
}
ko.applyBindings(invitationCode);