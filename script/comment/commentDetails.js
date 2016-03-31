var viewModel = function() {
	var self = this;
	var isRecommend;
	
	self.works = ko.observable({});
	self.teacher = ko.observable({});
	self.feedbacks = ko.observableArray([]);
	self.Comment = ko.observable();
	self.totalComment = ko.observable(''); //总评语
	self.isCommenter = ko.observable(false); //是否点评老师
	self.hasCommented = ko.observable(false); //是否已点评
	self.commentToRules = ko.observableArray([]); //点评标准

	//点评标准构造函数
	self.ruleItem = function(data) {
		var self = this;
		var ruleID = data.RuleID ? data.RuleID : data.ID; //已有数据则用RuleID，未有数据则用点评标准的ID
		var tmp = data.Comment ? data.Comment : '';
		self.RuleID = ko.observable(ruleID);
		self.RuleName = ko.observable(data.RuleName);
		self.Comment = ko.observable(tmp);
	}

	//添加咨询
	self.addfeedback = function() {
		if (self.isCommenter() == true) return;
		//e.detail.gesture.preventDefault(); //修复iOS 8.x平台存在的bug，使用plus.nativeUI.prompt会造成输入法闪一下又没了
		var btnArray = ['确定', '取消'];
		mui.prompt('请输入咨询内容：', '', '咨询', btnArray, function(e) {
			if (e.index == 0) {
				mui.ajax(common.gServerUrl + "API/Comment/AddCommentFeedback", {
					type: "POST",
					data: {
						CommentID: self.Comment().ID,
						Question: e.value
					},
					success: function() {
						var newFB = {
							'Question': e.value,
							'Answer': ''
						};
						self.feedbacks.push(newFB);

						mui.toast("添加咨询成功");
					}
				})
			}
		})
	}

	//回复咨询
	self.replyfeedback = function() {
		if (self.isCommenter() == false) return;

		var theFB = this;
		//e.detail.gesture.preventDefault(); //修复iOS 8.x平台存在的bug，使用plus.nativeUI.prompt会造成输入法闪一下又没了
		var btnArray = ['确定', '取消'];
		mui.prompt('请输入回复内容：', this.Answer, '咨询回复', btnArray, function(e) {
			if (e.index == 0) {
				if (common.StrIsNull(e.value) == "") {
					mui.alert('咨询内容不能为空，请输入咨询内容', '出错了~~', function() {});
				} else {
					mui.ajax(common.gServerUrl + "API/Comment/ModifyCommentFeedback/?id=" + theFB.ID, {
						type: "PUT",
						data: {
							Answer: e.value,
							CommentID: self.Comment().ID
						},
						success: function() {
							var newFB = {
								'ID': theFB.ID,
								'Question': theFB.Question,
								'Answer': e.value
							};
							var newArr = []; //定义一个新数组
							self.feedbacks().forEach(function(item) {
								if (item.ID != theFB.ID) {
									newArr.push(item);
								} else {
									newArr.push(newFB);
								}
							})
							self.feedbacks.removeAll();
							self.feedbacks(newArr);

							mui.toast("回复咨询成功");
						}
					})
				}

			}
		})
	}
	
	//提交评语
	self.submitComment = function() {
		var arr = [];
			self.commentToRules().forEach(function(item) {
				arr.push({
					RuleID: item.RuleID(),
					Comment: item.Comment(),
					RuleName: item.RuleName()
				});
			})
			mui.ajax(common.gServerUrl + "API/Comment/SaveCommentContent?id=" + self.Comment().ID, {
				type: "POST",
				data: {
					TotalComment: self.totalComment(),
					CommentToRules: JSON.stringify(arr),
					IsRecommend: isRecommend
				},
				success: function(responseText) {
					self.Comment().TotalComment = self.totalComment();
					self.Comment().CommentToRules = JSON.stringify(arr);
					self.Comment().IsFinish = true;
					mui.toast("保存成功");
					var myWebview=plus.webview.getWebviewById('modules/my/my.html');
					mui.fire(myWebview,'refreshAccount');
					mui.back();
				}
			});
	}
	
	//保存评语
	self.setComment = function() {
		if (common.StrIsNull(self.totalComment()) == '') {
			mui.toast('总评语不能为空');
			return;
		}
		isRecommend = false;
		if( self.Comment().CommentType == common.gTeacherCommentType[0].value && self.Comment().IsFinish == false) {
			var btnArray = ['值得推荐', '不推荐，完成点评'];
			mui.confirm('该作品是否值得推荐？（推荐将在专区中置顶,选择后将不可更改）', '推荐提示', btnArray, function(e) {
			if (e.index == 0) {
				isRecommend = true;
			}
			self.submitComment();
			});
		} else {
			self.submitComment();
		}
	};

	//跳转到作品详情页面
	self.goWorksDetails = function(data) {
		common.transfer("../works/WorksDetails.html", false, {
			works: self.works()
		}, false, false)
	}

	/**
	 * 获取点评的相关数据
	 * @param {Int} commentID 点评ID
	 */
	self.getCommentData = function(commentID) {
		//console.log(commentID);
		var ajaxUrl = common.gServerUrl + 'API/Comment/GetCommentInfoByID?id=' + commentID;
		mui.ajax(ajaxUrl, {
			type: 'GET',
			success: function(responseText) {
				var data = JSON.parse(responseText);
				if (data.teacher) {
					self.teacher(data.teacher);
					self.isCommenter(data.teacher.UserID == getLocalItem("UserID"));
				}
				if (data.feedbacks) {
					self.feedbacks(data.feedbacks);
				}
				//console.log(JSON.stringify(data.works));
				if (data.works) {
					self.works(data.works);

					//获取点评标准评语
					if (common.StrIsNull(self.Comment().CommentToRules) == '') {
						//未点评，需获取标准
						mui.ajax(common.gServerUrl + 'API/Comment/GetRules?subjectId=' + self.works().SubjectID, {
							type: 'GET',
							success: function(respText) {
								//console.log('response:' + respText);
								var arr = JSON.parse(respText);
								if (arr.length > 0) {
									arr.forEach(function(item) {
										self.commentToRules.push(new ruleItem(item));
									})
								}

							}
						})
					}
					//获取点评标准评语
					if (common.StrIsNull(self.Comment().CommentToRules) != '') {
						var arr = JSON.parse(self.Comment().CommentToRules);
						if (arr.length > 0) {
							arr.forEach(function(item) {
								self.commentToRules.push(new ruleItem(item));
							})
						}
					}
					//console.log(JSON.stringify(self.commentToRules()));
				}
				common.showCurrentWebview();
			}
		});


	}

	mui.plusReady(function() {
		var web = plus.webview.currentWebview();
		if (typeof(web.teacherComment) != "undefined") {
			self.Comment(web.teacherComment);
			if (common.StrIsNull(self.Comment().CommentToRules) != '') {
				self.hasCommented(true);
			}
			self.totalComment(self.Comment().TotalComment);
			self.getCommentData(self.Comment().ID);
		}
	});

	mui.init({
		beforeback: function() {
			mui.fire(plus.webview.currentWebview().opener(), 'refreshComments', {
				comment: self.Comment()
			});
			return true;
		}
	});
};

ko.applyBindings(viewModel);