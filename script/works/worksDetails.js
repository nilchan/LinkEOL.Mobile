function s2j_onPlayOver() {
	//console.log("播放结束");
	document.getElementById("videoBuy").style.display = "block";
	document.getElementById("videoPos").style.display = "none";
}

var worksDetails = function() {
	var self = this;
	var workIsDel = false;
	self.collectionStatus = ko.observable('worksDetails-after');
	self.LikeStatus = ko.observable("star-before");
	self.isPay = ko.observable(false); //作品是否付费
	self.UserID = getLocalItem("UserID"); //当前用户UserID
	self.DownloadAmount = ko.observable(0); //下载价格
	//作品的元素绑定
	self.Works = ko.observable({}); //作品实例
	self.mv = ko.observable();
	self.worksClock = ko.observable('');
	self.isshowComment = ko.observable(false); //是否显示点评
	self.balance = ko.observable(0); //余额

	var videoUrl; //视频地址
	self.initWorksValue = function(works) {
		console.log(JSON.stringify(works))
		var self = this;
		self.WorkID = ko.observable(works.ID); //作品编码
		self.AuthorID = ko.observable(works.AuthorID); //作品作者UserID
		self.UserType = ko.observable(works.UserType); //作品作者用户类型
		self.WorkSrcType = works.WorkSrcType; //作品来源类型
		self.WorkSrcID = ko.observable(works.WorkSrcID); //作品来源ID
		self.ActivityName = ko.observable(works.ActivityName); //活动名称
		self.ActName = self.ActivityName() && self.ActivityName().length > 14 ?
			(self.ActivityName().substring(0, 13) + '...') : self.ActivityName();
		self.AuthorPhoto = ko.observable(common.getPhotoUrl(works.AuthorPhoto)); //作品作者头像
		self.AuthorName = ko.observable(works.AuthorName); //作品作者名称
		self.SubjectID = ko.observable(works.SubjectID); //作品科目ID
		self.Title = ko.observable(works.Title); //作品标题
		self.AddTime = ko.observable(works.AddTime.split(' ')[0]); //添加时间
		self.ReadCount = ko.observable(works.ReadCount + (works.WorkType == common.gJsonWorkTypeTeacher[0].value || works.WorkType == common.gJsonWorkTypeTeacher[1].value ? '人正在学习' : (works.WorkType == common.gJsonWorkTypeTeacher[2].value ? '人已观赏' : '人已浏览'))); //浏览次数
		self.IsPublic = ko.observable(works.IsPublic); //作品是否公开

		self.IsPublicText = ko.computed(function() {
			return common.getTextByValue(common.gJsonWorkPublicType, self.IsPublic());
		}); //作品是否公开的文字143135
		self.IsPublicOppositeText = ko.computed(function() {
			return '设置为' + common.getTextByValue(common.gJsonWorkPublicType, !self.IsPublic());
		}); //作品是否公开的相反文字
		self.SubjectName = ko.observable(works.SubjectName); //科目名称
		self.LikeCount = ko.observable(works.LikeCount); //点赞次数
		self.FavCount = ko.observable(works.FavCount); //收藏数
		self.ContentText = ko.observable(works.ContentText);
		self.WorkType = ko.observable(works.WorkType);
		self.VidPolyv = works.VidPolyv;
		self.VidPolyvPreview = works.VidPolyvPreview;
		self.IsFinish = ko.observable(works.IsFinish); //是否完成
		if (common.StrIsNull(works.VideoThumbnail) != '')
			self.imgUrl = common.getThumbnail(works.VideoThumbnail);
		else
			self.imgUrl = '';
		//works.FamousName = '艾豪';
		//works.IsFamous = true;
		self.FamousName = ko.observable('【' + works.FamousName + '】');
		self.IsFamous = ko.observable(works.IsFamous);
		self.ConvertResult = ko.observable(works.ConvertResult);
	}

	self.IsAuthor = ko.computed(function() {
		if (typeof self.Works().AuthorID == "undefined")
			return false;

		if (self.UserID == self.Works().AuthorID())
			return true;
		else
			return false;
	})

	//评论的相关元素绑定
	self.teacherComment = ko.observableArray([]); //各个老师评论数组
	//分享的参数
	var shareTitle = "";
	var shareContent = "你看了没";
	var shareUrl = common.gWebsiteUrl + "modules/works/workInfo.html?id=";
	var shareImg = "";

	//分享功能
	var ull = document.getElementById("recommendArray");
	var lis = ull.getElementsByTagName("li");
	for (var i = 0; i < lis.length; i++) {
		lis[i].onclick = function() {
			//mui.toast("敬请期待");
			Share.sendShare(this.id, shareTitle, shareContent, shareUrl + self.Works().WorkID(), shareImg);
			mui('#sharePopover').popover('toggle');
		}
	}

	//关闭分享窗口
	self.closeShare = function() {
		mui('#middlePopover').popover('toggle');
	}

	//获取视频
	self.getVideo = function(work) {
		if (work.IsBought) {
			if(plus.VideoUtility){
				//设置位置
				var ret = plus.VideoUtility.InitPlayer([
					0, 0, 320, 240
				]);
				if (ret && ret.status) {
					var ret = plus.VideoUtility.PlayVideo(work.VidPolyv, common.gJsonVideoLevel.SD);
					if (ret && !ret.status) {
						//alert('error');
						mui.toast('视频加载失败');
					}
				}
			}
			else{
				var player = polyvObject('#videoPos').videoPlayer({
					'width': '100%',
					'height': '240',
					'vid': work.VidPolyv
				});
			}
		} else {
			var player = polyvObject('#videoPos').previewPlayer({
				'width': '100%',
				'height': '240',
				'vid': work.VidPolyvPreview
			});
		}
	}

	//获取余额
	self.getBalance = function() {
		var url = common.gServerUrl + 'API/AccountDetails/GetUserAmount?UserID=' + getLocalItem('UserID');
		mui.ajax(url, {
			type: 'GET',
			success: function(responseText) {
				self.balance(JSON.parse(responseText).Amount);
			}
		});
	}

	//获取下载价格
	self.getDownloadPrice = function() {
		var url = common.gServerUrl + 'API/Download/GetDownloadPrice?userId=' + self.Works().AuthorID();

		mui.ajax(url, {
			type: 'GET',
			success: function(responseText) {
				self.DownloadAmount(responseText);
			}
		});
	}

	//获取评论
	self.getComment = function() {
		mui.ajax(common.gServerUrl + "Common/Comment/GetCommentsByWork?WorkID=" + self.Works().WorkID(), {
			type: 'Get',
			success: function(responseText) {
				//console.log(responseText);
				var result = eval("(" + responseText + ")");
				result.forEach(function(item, i, array) {
					self.teacherComment.push(Comment(item));
				})
			}
		});
	}

	//当为同学关系时的点评内容
	self.getComentClassmate = function() {
		mui.ajax(common.gServerUrl + "Common/Comment/GetCommentToClassMateList?workId=" + self.Works().WorkID() + "&userId=" + self.UserID, {
			type: 'Get',
			success: function(responseText) {
				//console.log(responseText);
				var result = eval("(" + responseText + ")");
				result.forEach(function(item, i, array) {
					self.teacherComment.push(Comment(item));
				})
			}
		});
	}

	//跳转用户详情页面
	self.gotoAuthor = function() {
		var url = '../student/studentInfo.html';
		var arg = {
			studentID: self.Works().AuthorID()
		};
		if (self.Works().UserType() == common.gDictUserType.teacher) {
			url = '../teacher/teacherInfo.html';
			arg = {
				teacherID: self.Works().AuthorID()
			};
		}
		common.transfer(url, false, arg, false, false);
	}

	//跳转活动详情页面
	self.gotoActivity = function() {
		common.transfer("../activity/activityInfo.html", false, {
			aid: self.Works().WorkSrcID()
		});
	}

	//删除作品
	self.worksDelete = function() {
		var btnArray = ['是', '否'];
		mui.confirm('确认删除吗', '您点击了删除', btnArray, function(e) {
			if (e.index == 0) {
				mui.ajax(common.gServerUrl + "Common/Work/" + self.Works().WorkID(), {
					type: 'DELETE',
					success: function(responseText) {
						workIsDel = true;
						mui.toast("删除成功");
						mui.back();
					}
				});
			}
		});
	}

	//修改作品
	self.worksSet = function() {

	}

	//作品下载
	self.downWork = function() {
		if (getLocalItem("UserID") <= 0) {
			mui.toast("登录后才能下载~")
			return;
		}

		if (self.isPay() || (self.Works().AuthorID() == self.UserID) || self.DownloadAmount() == 0) {
			//作品已支付或者 为作者本人 或者费用为0 ，直接下载
			var oldTasks = plus.storage.getItem(common.gVarLocalDownloadTask);
			if (common.StrIsNull(oldTasks) == '') oldTasks = '[]';

			var arr = JSON.parse(oldTasks) || [];
			var data = {
				workId: self.Works().WorkID(),
				workTitle: self.Works().Title(),
				workAuthorId: self.Works().AuthorID(),
				workAuthorName: self.Works().AuthorName(),
				workimgUrl: self.Works().imgUrl,
				workSubjectName: self.Works().SubjectName(),
				workContentText: self.Works().ContentText(),
				IsFinish: false,
				videopath: videoUrl, //远程路径
				localpath: '' //本地路径
			}
			var downloaded = false;
			arr.forEach(function(item) {
				if (item.workId == data.workId) {
					downloaded = true;
					return;
				}
			})
			if (!downloaded)
				arr.push(data);

			plus.storage.setItem(common.gVarLocalDownloadTask, JSON.stringify(arr));
			common.transfer("mydownloadHeader.html", true, {}, false, true);
		} else {
			//弹出支付框
			mui('#bottomPopover').popover('toggle');
		}
	}

	//作品支付
	self.payWork = function() {
		if (UserID <= 0) {
			common.transfer("../account/login.html");
		} else {
			//弹出支付框
			mui('#bottomPopover').popover('toggle');
		}
	}

	//点评的模型
	function Comment(model) {
		var obj = {};
		obj.ID = model ? model.ID : 0;
		obj.AuthoID = model ? model.AuthoID : 0;
		obj.AuthorName = model ? model.AuthorName : '';
		obj.CommenterID = model ? model.CommenterID : 0;
		obj.CommenterName = model ? model.CommenterName : '';
		obj.TotalComment = model ? model.TotalComment : '';
		obj.IsFamous = model ? model.IsFamous : '';
		obj.IsRecommend = model ? model.IsRecommend : '';
		var ctr = [];
		if (model && model.CommentToRules) {
			var arr = JSON.parse(model.CommentToRules);
			ctr = arr;
		}
		obj.CommentToRules = ko.observableArray(ctr);
		var feedbacks = [];
		if (model && model.CommentFeedbacks) {
			var arr = JSON.parse(model.CommentFeedbacks);
			feedbacks = arr;
		}
		obj.CommentFeedbacks = ko.observableArray(feedbacks);

		return obj;
	}

	//添加咨询
	self.addfeedbacks = function() {
		/*var oldComment = this;
		var theComment = {};
		for (var p in oldComment)
			theComment[p] = oldComment[p];*/
		var theComment = this;

		//e.detail.gesture.preventDefault(); //修复iOS 8.x平台存在的bug，使用plus.nativeUI.prompt会造成输入法闪一下又没了
		var btnArray = ['确定', '取消'];
		mui.prompt('请输入咨询内容：', '', '咨询', btnArray, function(e) {
			if (e.index == 0) {
				if (common.StrIsNull(e.value) == "") {
					mui.alert('咨询内容不能为空，请输入咨询内容', '出错了~~', function() {});
				} else {
					mui.ajax(common.gServerUrl + "API/Comment/AddCommentFeedback", {
						type: "POST",
						data: {
							CommentID: theComment.ID,
							Question: e.value
						},
						success: function() {
							var tmp = theComment.CommentFeedbacks;
							if (!tmp)
								tmp = [];
							var newFB = {
								'Question': e.value,
								'Answer': ''
							};
							tmp.push(newFB);
							theComment.CommentFeedbacks = tmp; //JSON.stringify(tmp);
							//self.teacherComment.replace(oldComment, theComment);
							mui.toast("添加咨询成功");
						}
					})
				}

			}
		})
	}

	//找老师点评
	self.goTeacherComment = function() {
		if (self.Works().ConvertResult() != "1") {
			mui.toast('视频尚未审核，请稍后再试~');
			return;
		}
		common.transfer('../../modules/teacher/teacherHomeWorkHeader.html', true, {
			works: workobj,
			displayCheck: true
		});
	}

	//交作业
	self.goHomeWork = function() {
		if (self.Works().ConvertResult() != "1") {
			mui.toast('视频尚未审核，请稍后再试~');
			return;
		}
		common.transfer('../../modules/teacher/teacherHomeWorkHeader.html', true, {
			works: workobj,
			displayCheck: true,
			homeWork: true
		});
	}

	//设置作品是否公开
	self.setPublic = function() {
		var ispublic = self.Works().IsPublic();
		mui.ajax(common.gServerUrl + "Common/Work/" + self.Works().WorkID(), {
			type: "PUT",
			data: {
				AuthorID: self.Works().AuthorID(),
				IsPublic: !ispublic
			},
			success: function(responseText) {
				self.Works().IsPublic(!ispublic);
				if (self.self.Works().IsPublic()) {
					self.worksClock('worksDetails-open');
				} else {
					self.worksClock('worksDetails-private');
				}
				mui.toast("成功设置为" + self.Works().IsPublicText());
			}
		})
	}

	//赞
	self.Like = function() {
		if (getLocalItem("UserID") <= 0) {
			mui.toast("登录后才能点赞~")
			return;
		}
		if (self.IsAuthor()) { //作者本人不允许赞
			mui.toast('自己的作品不需要点赞了吧~');
			return;
		}

		var ret = common.postAction(common.gDictActionType.Like, common.gDictActionTargetType.Works, self.Works().WorkID());
		if (ret) {
			self.Works().LikeCount(self.Works().LikeCount() + 1);
			self.LikeStatus("star-after");
			mui.toast('感谢您的赞许');
		}
	}

	//收藏
	self.Fav = function() {
		if (getLocalItem("UserID") <= 0) {
			mui.toast("登录后才能收藏~")
			return;
		}
		if (self.IsAuthor()) return; //作者本人不允许收藏
		var ret = common.postAction(common.gDictActionType.Favorite, common.gDictActionTargetType.Works, self.Works().WorkID());
		if (ret) {
			self.Works().FavCount(self.Works().FavCount() + 1);
			self.collectionStatus('worksDetails-before');
			mui.toast('收藏成功');
		}
	}

	//设置作品为名师推荐
	self.setWorkRecommendation = function(data) {
		var setWorkUrl = common.gServerUrl;
		mui.confirm('是否设置作品为名师推荐', '设置作品', ['确定', '取消'], function(e) {
			if (e.index == 0) {
				mui.ajax(setWorkUrl, {
					type: '',
					success: function() {
						mui.toast('成功设置为名师推荐');
					}
				})
			}
		})
	}


	self.closePopover = function() {
		mui('#bottomPopover').popover("hide");
	}

	//支付方式，默认为微信支付
	self.PayType = ko.observable('wxpay');
	self.checkPayType = function() {
		PayType(event.srcElement.value);
	}

	self.Order = ko.observable({}); //由我的订单传递过来的订单参数
	self.ViewOrder = ko.observable(false); //标记是否由我的订单跳转而来，默认为否
	self.OrderNO = ko.observable(''); //请求后返回的订单号
	//支付的生成订单
	self.gotoPay = function() {

		var ajaxUrl;
		var comment;

		//支付方式的数值
		var paytype = 3;
		if (self.PayType() == 'wxpay') {
			paytype = 1;
		} else if (self.PayType() == 'alipay') {
			paytype = 2;
		} else if (self.PayType() == 'balance') {
			paytype = 4;
		} else {
			paytype = 3;
		}

		if (!self.ViewOrder()) { //不是由我的订单跳转而来
			if (!self.Works().WorkID()) {
				mui.toast("请选择需下载的作品");
				return;
			}
			if (self.PayType() == '') {
				mui.toast("请选择支付方式");
				return;
			}

			//准备下载信息
			download = {
				WorkID: self.Works().WorkID(),
				WorkTitle: self.Works().Title(),
				AuthorID: self.Works().AuthorID(),
				DownloaderID: UserID,
				Amount: self.DownloadAmount()
			}

			ajaxUrl = common.gServerUrl + 'API/Download/?payType=' + paytype;
		} else {
			ajaxUrl = common.gServerUrl + 'API/Order/ResubmitOrder?id=' + self.Order().ID + '&payType=' + paytype;
		}

		var evt = event;
		if (!common.setDisabled()) return;
		plus.nativeUI.showWaiting();

		//新增则保存下载信息；修改则保存新的支付方式。均返回订单信息
		mui.ajax(ajaxUrl, {
			type: 'POST',
			data: self.ViewOrder() ? self.Order() : download,
			success: function(responseText) { //responseText为微信支付所需的json
				var ret = JSON.parse(responseText);
				//console.log(ret);
				var orderID = ret.orderID;
				if (ret.requestJson == '') { //无需网上支付，下载成功
					mui.toast("已成功提交");
					//重新获取视频
					self.getVideo(self.Works());
					plus.nativeUI.closeWaiting();
				} else {
					var requestJson = JSON.stringify(ret.requestJson);

					//根据支付方式、订单信息，调用支付操作
					Pay.pay(self.PayType(), requestJson, function(tradeno) { //成功后的回调函数
						var aurl = common.gServerUrl + 'API/Order/SetOrderSuccess?id=' + orderID + '&otherOrderNO=' + tradeno;
						mui.ajax(aurl, {
							type: 'PUT',
							success: function(respText) {
								//重新获取视频
								self.getVideo(self.Works());
								plus.nativeUI.closeWaiting();
								mui('#bottomPopover').popover("toggle");
							}
						})
					}, function() {
						common.setEnabled(evt);
						plus.nativeUI.closeWaiting();
					});
				}
			},
			error: function() {
				common.setEnabled(evt);
				plus.nativeUI.closeWaiting();
			}
		})
	};

	/**
	 * 为显示订单的作品信息而获取数据
	 * @param {Int} downloadID 下载ID
	 */
	self.getDataForOrder = function(downloadID) {
		self.ViewOrder(true); //标记由我的订单跳转而来

		var ajaxUrl = common.gServerUrl + '/API/Work/GetWorksByDownloadID?downloadID=' + downloadID;
		mui.ajax(ajaxUrl, {
			type: 'GET',
			success: function(responseText) {
				var data = JSON.parse(responseText);
				if (data) {
					var obj = new self.initWorksValue(data);
					self.Works(obj);
					if (self.Works().IsPublic()) {
						self.worksClock('worksDetails-open');
					} else {
						self.worksClock('worksDetails-private');
					}
					self.getVideo(data);
					shareTitle = "我在乐评家上分享了" + self.Works().Title() + "的视频";
					self.getComment();
				}
			},
			error: function(responseText) {
				//console.log(JSON.stringify(responseText));
			}
		});
	}

	//是否能够查看点评
	self.isGetComment = function() {
		var result;
		var isClassmateUrl = common.gServerUrl + 'API/TeacherToStudent/IsClassMate?MyUserID=' + self.UserID + '&UserID=' + self.Works().AuthorID();
		mui.ajax(isClassmateUrl, {
			type: 'GET',
			success: function(responseText) {
				result = responseText; //是否是同学关系
				if (result) { //当为同学关系时
					self.getComentClassmate()
				} else { //当不为同学时
					self.getComment();
				}
				self.isshowComment(self.Works().IsPublic() && result);
			}
		});

	}

	//根据作品id获取作品详情  
	self.getWorkDetail = function(workId) {
		mui.ajax(common.gServerUrl + 'Common/Work/' + workId, {
			type: 'GET',
			success: function(responseText) {
				console.log(responseText);
				var result = JSON.parse(responseText);
				workobj = result;
				obj = new self.initWorksValue(result);
				self.Works(obj);
				if (self.Works().IsPublic()) {
					self.worksClock('worksDetails-open');
				} else {
					self.worksClock('worksDetails-private');
				}
				self.getVideo(workobj); //获取视频
				if (!self.Works().IsFinish()) {
					mui.toast('作品正在处理中，稍后再浏览');
				}
				self.isGetComment();
				shareTitle = "我在乐评家上分享了" + self.Works().Title() + "的视频";

				//获取动作的状态
				common.getActions(0, common.gDictActionTargetType.Works, self.Works().WorkID(), function(result) {
					if (common.StrIsNull(result) != '') {
						var arr = JSON.parse(result);
						for (var i = 0; i < arr.length; i++) {
							var item = arr[i];
							if (item.UserID.toString() != getLocalItem("UserID") ||
								item.TargetType.toString() != common.gDictActionTargetType.Works ||
								item.TargetID.toString() != self.Works().WorkID()) {
								continue;
							}
							if (item.ActionType.toString() == common.gDictActionType.Favorite) {
								self.collectionStatus('worksDetails-before');
							}
							if (item.ActionType.toString() == common.gDictActionType.Like) {
								self.LikeStatus("star-after");
							}
						}
					}
				});
				self.getBalance();
				self.getDownloadPrice();
				common.showCurrentWebview();
			}
		})
	}

	//获取上级页面的数据
	var workobj, workVaule;
	mui.plusReady(function() {
		Share.updateSerivces(); //初始化分享
		workVaule = plus.webview.currentWebview();
		if (workVaule) {
			if (typeof(workVaule.order) != "undefined") {
				//从订单跳转过来
				self.Order(workVaule.order);
				self.DownloadAmount(self.Order().Amount);
				getDataForOrder(self.Order().TargetID);

				self.getBalance();
				self.getDownloadPrice();
				common.showCurrentWebview();
			} else {
				//console.log(workVaule.works.ID);
				self.getWorkDetail(workVaule.works.ID);
				//workobj = workVaule.works;
			}
		}
	});

	mui.init({
		beforeback: function() {
			var workParent = workVaule.opener();
			if (workParent != null) {
				if (workParent.id == 'worksListAllWorks.html' || workParent.id == 'classmateWorks.html') {
					if (workIsDel) { //删除作品
						mui.fire(workParent, 'refreshAllworks', {
							worksId: self.Works().WorkID(),
							worksStatus: workIsDel
						});
					} else {
						mui.fire(workParent, 'refreshwoks', { //作品点赞
							LikeCount: self.Works().LikeCount(),
							worksId: self.Works().WorkID(),
						});
					}
				} else if (workParent.id == 'worksListMyWorks.html') {
					mui.fire(workParent, 'refreshMyworks', {
						worksId: self.Works().WorkID(),
						worksStatus: workIsDel
					})
				}
			}
			return true;
		}
	});

}
ko.applyBindings(worksDetails);