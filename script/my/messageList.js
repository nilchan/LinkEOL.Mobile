//knockoutjs
var message_notification = function () {
    var self = this;
    self.messages = ko.observableArray([]);
    var pageNum = 1;
    var receiverId = getLocalItem("UserID");
    self.messageLength = ko.observable(1);
    //获取消息
    self.getMessage = function () {
        plus.runtime.setBadgeNumber(0);
        mui.ajax(common.gServerUrl + "API/Message/GetMyMessage?receiver=" + receiverId + "&page=" + pageNum, {
            dataType: 'json',
            type: 'GET',
            success: function (responseText) {
                console.log(JSON.stringify(responseText));
                self.messages(responseText);
                self.messageLength(self.messages().length);
                //console.log("15:"+self.messages().length);
                mui('#pullrefresh').pullRefresh().refresh(true); //重置上拉加载
                if (responseText.length > 0)
                    setLocalItem("msgLastTime", responseText[responseText.length - 1].SendTime);
            }
        })
    }

    //删除消息
    self.removeMessages = function () {
        var message = this;
        var btnArray = ['是', '否'];
        mui.confirm('确认删除吗', '您点击了删除', btnArray, function (e) {
            if (e.index == 0) {
                mui.ajax(common.gServerUrl + "API/Message/" + message.ID, {
                    type: 'DELETE',
                    success: function (responseText) {
                        self.messages.remove(message);
                    }
                });
            }
        });
    }

    //根据点评id获取作品
    /*self.getWorksByCommentID = function(commentId) {
     var ajaxurl = common.gServerUrl + "API/Work/GetWorksByCommentID?commentID=" + commentId;
     console.log(commentId);
     mui.ajax(ajaxurl, {
     type: "GET",
     success: function(responseText) {
     console.log(responseText);
     worksContent = eval("(" + responseText + ")");
     }
     })
     }*/

    //跳转到消息详情
    self.goMessagesDetail = function (data) {
        //console.log(JSON.stringify(data));
        var message = this;
        /**
         commentModule: 1, //点评
         workDownloadModule: 2, //作品下载
         courseModule: 3, //课程表
         homeworkModule: 4, //作业
         teacherAuthModule: 5, //老师认证
         examModule: 6,        //考级报名
         feedBackModule: 7, //新建页面跳转
         systemMessageModule: 8, //系统通知
         activityModule: 9,    //活动购票
         instructModule: 10 //授课关系通知
         accountModule: 11  //账户通知
         */
        /*此处代码移至该代码块的末尾
         * if (message.MsgUrl != null) {	//0
            message.MsgUrl = message.MsgUrl.indexOf("https://") >= 0 ? message.MsgUrl : "https://" + message.MsgUrl;
            common.transfer("../home/messageWeb.html", false, {
                url: message.MsgUrl
            });
        } else*/
		if (message.ModuleID == common.gMessageModule.commentModule || message.ModuleID == common.gMessageModule.homeworkModule) { //1 or 4
			var ajaxurl = common.gServerUrl + "API/Comment/" + message.SourceID;
			mui.ajax(ajaxurl, {
				type: "GET",
				success: function(responseText) {
					console.log(responseText);
					var cmt = eval("(" + responseText + ")");
					if(cmt.CommenterID == getLocalItem('UserID')){			//点评者
						common.transfer("../comment/commentDetails.html", false, {
							teacherComment: cmt
						}, false, false);
					}
					
					if(cmt.AuthorID == getLocalItem('UserID')){			//被点评者
						var ajaxurl = common.gServerUrl + "API/Work/GetWorksByCommentID?commentID=" + message.SourceID;
						mui.ajax(ajaxurl, {
							type: "GET",
							success: function(responseText) {
								var worksContent = eval("(" + responseText + ")");
								common.transfer("../works/WorksDetails.html", false, {
									works: worksContent
								}, false, false);
							}
						})
					}
				}
			})
			
			/*if (getLocalItem('UserType') == common.gDictUserType.teacher) {
				var ajaxurl = common.gServerUrl + "API/Comment/" + message.SourceID;
				mui.ajax(ajaxurl, {
					type: "GET",
					success: function(responseText) {
						//console.log(responseText);
						var teacherComment = eval("(" + responseText + ")");
						common.transfer("../comment/commentDetails.html", false, {
							teacherComment: teacherComment
						}, false, false);
					}
				})
			} else {
				var ajaxurl = common.gServerUrl + "API/Work/GetWorksByCommentID?commentID=" + message.SourceID;
				mui.ajax(ajaxurl, {
					type: "GET",
					success: function(responseText) {
						var worksContent = eval("(" + responseText + ")");
						common.transfer("../works/WorksDetails.html", false, {
							works: worksContent
						}, false, false);
					}
				})
			}*/
		} else if (message.ModuleID == common.gMessageModule.workDownloadModule) { //2
			//common.transfer("../works/mydownloadHeader.html")
		} else if (message.ModuleID == common.gMessageModule.courseModule) { //3
			//common.showIndexWebview(2, false);
			common.transfer("../course/myCourse.html", true, {}, false, false);
		/*} else if (message.ModuleID == common.gMessageModule.homeworkModule) { //4
			if (getLocalItem('UserType') == common.gDictUserType.teacher) {
				common.transfer("../comment/commentListHeader.html", true, {
					MessageType: message.MessageType
				}, false, false);
			} else {
				common.transfer("../works/worksListMyHeader.html", true, common.extrasUp(1), false, false); //1为我的作业下标
			}*/
		} else if (message.ModuleID == common.gMessageModule.teacherAuthModule) { //5
			common.transfer('../my/teacherAuth.html', true, {}, false, false);
		} else if (message.ModuleID == common.gMessageModule.examModule) { //6
			common.transfer('../exam/examList.html', true);
		} else if (message.ModuleID == common.gMessageModule.feedBackModule) { //7
		
		} else if (message.ModuleID == common.gMessageModule.systemMessageModule) { //8
		
		} else if (message.ModuleID == common.gMessageModule.activityModule) { //9
		
		} else if (message.ModuleID == common.gMessageModule.instructModule) { //10
			if(common.StrIsNull(message.MsgUrl)==''){//解除授课关系
				return ;
			}
			if (message.MsgUrl.indexOf('Teacher') >= 0) {
				common.transfer('../my/myTeacherList.html', true, {}, false, false);
			} else if (message.MsgUrl.indexOf('Student') >= 0) {
				common.transfer('../my/myStudentList.html', true, {}, false, false);
			}
		} else if (message.ModuleID == common.gMessageModule.accountModule) { //11
			common.transfer('../my/myAccount.html', true);
		} else if (message.ModuleID == common.gMessageModule.submitHomeworkModule) { //12
			common.transfer("../works/worksListMyHeader.html", true, {}, false, false);
		} else if (message.MsgUrl != null) {
			message.MsgUrl = message.MsgUrl.indexOf("https://") >= 0 ? message.MsgUrl : "https://" + message.MsgUrl;
			common.transfer("../home/messageWeb.html", false, {
				url: message.MsgUrl
			});
		}
    }

    mui.init({
        pullRefresh: {
            container: '#pullrefresh',
            down: {
                contentrefresh: common.gContentRefreshDown,
                callback: pulldownRefresh
            },
            up: {
                contentrefresh: common.gContentRefreshUp,
                contentnomore: common.gContentNomoreUp,
                callback: pullupRefresh
            }
        }
    });

    function pulldownRefresh() {
        setTimeout(function () {
            mui('#pullrefresh').pullRefresh().endPulldownToRefresh(); //refresh completed
            mui('#pullrefresh').pullRefresh().refresh(true);
            pageNum = 1; //重新加载第1页
            self.getMessage();
        }, 1500);
    }

    //var count = 0;
    function pullupRefresh() {
        setTimeout(function () {
            pageNum++;
            mui.ajax(common.gServerUrl + "API/Message/GetMyMessage?receiver=" + receiverId + "&page=" + pageNum, {
                dataType: 'json',
                type: 'GET',
                success: function (responseText) {
                    if (responseText && responseText.length > 0) {
                        self.messages(self.messages().concat(responseText));
                        self.messageLength(self.messages().length);
                        if (responseText.length < common.gListPageSize) {
                            mui('#pullrefresh').pullRefresh().endPullupToRefresh(true);
                        } else {
                            mui('#pullrefresh').pullRefresh().endPullupToRefresh(false); //false代表还有数据
                        }
                    } else {
                        mui('#pullrefresh').pullRefresh().endPullupToRefresh(true); //true代表没有数据了
                    }
                }
            });
        }, 1500);
    }

    if (mui.os.plus) {
        mui.plusReady(function () {
            if (plus.os.vendor == 'Apple') {
                mui('.mui-scroll-wrapper').scroll();
            }
        });
    }

    mui.plusReady(function () {
        if (receiverId > 0) {
            self.getMessage();
        }

    });
}
ko.applyBindings(message_notification);