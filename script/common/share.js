var Share = Share || {};
var shares = null;
var share_img = ''; // 分享显示图片
var share_thumb_img = '' // 缩略图
var share_content = ''; // 分享内容
var share_href = ''; // 分享链接
var share_title = ''; // 分享标题
var share_Content_type = ''; //分享内容类型
var share_type = '';

/**
 * 打开分享操作列表
 * 
 * @param {Object} shareTypeID 类型id 必填
 * @param {Object} shareTitle 标题 必填
 * @param {Object} shareContent 内容 必填
 * @param {Object} shareURL 链接 必填,格式:'http://linkeol.com'
 * @param {Object} shareImg 图片 必选 可以本地路径可以网络路径，本地路径需为绝对路径
 * @param {Object} shareContentType 内容类型 
 */

Share.sendShare = function(shareTypeID, shareTitle, shareContent, shareURL, shareImg, shareContentType) {
	Share.updateSerivces();
	share_title = shareTitle;
	share_content = shareContent;
	share_href = shareURL;
	if (shareContentType != '') {
		share_Content_type = shareContentType
	}
	if (share_href == '') {
		share_bhref = false;
	} else {
		share_bhref = true;
	}
	Share.sendShareImg(shareTypeID, shareImg);

}

// 暂不使用,分享图片简化
Share.setShareImg = function(shareImg) {
	if (common.StrIsNull(shareImg) == '' || shareImg == null) {
		share_img = ["_www/images/test.jpg"];
		share_thumb_img = ["_www/images/test.jpg"];
	} else {
		if (shareImg.indexOf(common.gVideoServerUrl) > 0) {
			share_img = [shareImg];
			share_thumb_img = [shareImg];
		} else {
			var dtask = plus.downloader.createDownload(shareImg, {
				method: "GET"
			}, function(d, status) {
				// 下载完成
				if (status == 200) {
					share_img = [d.filename];
					var imgCompress = d.filename;
					if ((d.totalSize / 1024) >= 32) {
						var compressInt = 32 / (d.totalSize / 1024);
						common.imgCompress(d.filename, compressInt,
							function(result, size) {
								imgCompress = result;
								share_thumb_img = [imgCompress];
							},
							function(code, message) {
								console.log('错误参数：' + code + ",错误描述：" + message);
								share_thumb_img = ["_www/images/test.jpg"];
							});
					} else {
						share_thumb_img = [imgCompress];
					}
				} else {
					share_img = ["_www/images/test.jpg"];
					share_thumb_img = ["_www/images/test.jpg"];
				}
			});
			dtask.start();
		}
	}
}

/**
 * 设置分享图片
 * 
 * @param {Object} shareTypeID 类型id
 * @param {Object} shareImg 图片 必选 可以本地路径可以网络路径，本地路径需为绝对路径
 * 
 */
Share.sendShareImg = function(shareTypeID, shareImg) {
	if (common.StrIsNull(shareImg) == '' || shareImg == null) {
		share_img = ["_www/images/test.jpg"];
		share_thumb_img = ["_www/images/test.jpg"];
		Share.shareShow(shareTypeID);
	} else {
		if (shareImg.indexOf(common.gVideoServerUrl) > 0) {
			share_img = [shareImg];
			share_thumb_img = [shareImg];
			Share.shareShow(shareTypeID);
		} else {
			var dtask = plus.downloader.createDownload(shareImg, {
				method: "GET"
			}, function(d, status) {
				// 下载完成
				if (status == 200) {
					share_img = [d.filename];
					var imgCompress = d.filename;
					if ((d.totalSize / 1024) >= 32) {
						var compressInt = 32 / (d.totalSize / 1024);
						common.imgCompress(d.filename, compressInt,
							function(result, size) {
								imgCompress = result;
								share_thumb_img = [imgCompress];
								Share.shareShow(shareTypeID);
							},
							function(code, message) {
								console.log('错误参数：' + code + ",错误描述：" + message);
								share_thumb_img = ["_www/images/test.jpg"];
								Share.shareShow(shareTypeID);
							});
					} else {
						share_thumb_img = [imgCompress];
						Share.shareShow(shareTypeID);
					}
				} else {
					share_img = ["_www/images/test.jpg"];
					share_thumb_img = ["_www/images/test.jpg"];
					Share.shareShow(shareTypeID);
				}
			});
			dtask.start();
		}
	}
}

/**
 * ☆重要：需要在plusready配置此方法☆ 更新/初始化分享服务
 * 
 */
Share.updateSerivces = function() {
	plus.share.getServices(function(s) {
		shares = {};
		for (var i in s) {
			var t = s[i];
			shares[t.id] = t;
		}
	}, function(e) {
		console.log("获取分享服务列表失败：" + e.message);
	});
}

/**
 * 分享类型
 * 
 * @param {String} shareTypeID
 */
Share.shareShow = function(shareTypeID) {
	var ids = [{
		shareID: "sinaWeibo",
		id: "sinaweibo",

	}, {
		shareID: "weichatFriend",
		id: "weixin",
		ex: "WXSceneSession",
		shareType: common.gShareType.WXSceneSession
	}, {
		shareID: "weichatMoments",
		id: "weixin",
		ex: "WXSceneTimeline",
		shareType: common.gShareType.WXSceneTimeline
	}, {
		shareID: "qqFriend",
		id: "qq",
		shareType: common.gShareType.qqFriend
	}];
	for (var i in ids) {
		if (ids[i].shareID == shareTypeID) {
			if (shareTypeID == "qqFriend" && common.isInstallQQ() == 0) {
				mui.toast("您还没安装QQ~~")
			} else {
				Share.shareAction(ids[i].id, ids[i].ex);
				share_type = ids[i].shareType;
				//Share.shareMessage(qqShares, ids[i].ex);
			}

		}
	}
}

/**
 * 分享操作
 * 
 * @param {Object} id
 */
Share.shareAction = function(id, ex) {
	var s = null;
	if (!id || !(s = shares[id])) {
		mui.toast("无效的分享服务！");
		return;
	}
	if (s.authenticated) {
		Share.shareMessage(s, ex);
	} else {
		s.authorize(function() {
			Share.shareMessage(s, ex);
		}, function(e) {
			mui.toast("认证授权失败：" + e.code + " - " + e.message);
		});
	}
}

/**
 * 发送分享消息
 * 
 * @param {plus.share.ShareService} s
 * 
 */
Share.shareMessage = function(s, ex) {
	plus.nativeUI.closeWaiting();
    alert('shareMessage')
	var msg = {
		extra: {
			scene: ex
		}
	};
	msg.href = share_href;
	msg.content = share_content;
	msg.title = share_title;
	msg.thumbs = share_thumb_img;
	msg.pictures = share_img;
    alert(JSON.stringify(msg))
	s.send(msg, function() {
		console.log("分享到\"" + s.description + "\"成功，返回应用 "); // 分享给qq好友，微信好友如果不返回应用，无法监听到分享成功回调
		if (share_Content_type == common.gShareContentType.UserGuide) {
			var thisUrl = common.gServerUrl + 'API/LogShare/LogShareAdd?PageType=' + share_Content_type + '&ShareType=' + share_type + '&Remark=' + share_href;
			mui.ajax(thisUrl, {
				type: 'POST',
				success: function(reponseText) {
					
				}
			})
		}

	}, function(e) {
           alert("分享到\"" + s.description + "\"失败！ " + e.code + " - " + e.message)
		console.log("分享到\"" + s.description + "\"失败！ " + e.code + " - " + e.message);
	});
	
	
}