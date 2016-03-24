var UserData = {
	userData: null,
	name: "linkeol.com",

	init: function() {
		if (!UserData.userData) {
			try {
				UserData.userData = document.createElement('INPUT');
				UserData.userData.type = "hidden";
				UserData.userData.style.display = "none";
				UserData.userData.addBehavior("#default#userData");
				document.body.appendChild(UserData.userData);
				var expires = new Date();
				expires.setDate(expires.getDate() + 365);
				UserData.userData.expires = expires.toUTCString();
			} catch (e) {
				return false;
			}
		}
		return true;
	},

	setItem: function(key, value) {
		if (UserData.init()) {
			UserData.userData.load(UserData.name);
			UserData.userData.setAttribute(key, value);
			UserData.userData.save(UserData.name);
		}
	},

	getItem: function(key) {
		if (UserData.init()) {
			UserData.userData.load(UserData.name);
			return UserData.userData.getAttribute(key)
		}
	},

	removeItem: function(key) {
		if (UserData.init()) {
			UserData.userData.load(UserData.name);
			UserData.userData.removeAttribute(key);
			UserData.userData.save(UserData.name);
		}
	}
};

//存储key/value至本地缓存
var setLocalItem = function(key, value) {
	if (window.localStorage)
		localStorage.setItem(key, value);
	else
		UserData.setItem(key, value);
};

//获取本地缓存中key名称的值
var getLocalItem = function(key) {
	if (window.localStorage)
		return common.StrIsNull(localStorage.getItem(key));
	else
		return UserData.getItem(key);
};
//删除缓存中的key名称的值
var removeLocalItem = function(key) {
	if (window.localStorage)
		return localStorage.removeItem(key);
	else
		return UserData.removeItem(key);
}

var getAuth = function() {
	var str = "Basic " + this.getLocalItem("UserName") + ':' + this.getLocalItem("Token") + ':' + this.getLocalItem("UUID") + ':' + getLocalItem('Push.DeviceToken') + ':' + getLocalItem('Push.ClientID') +
		':' + getLocalItem('Version.Local');
	//console.log(str);
	return str;
};

var handleResult = function(result) {
	//console.log(result);
	var strReturn = '操作失败';
	if (result.indexOf('{') >= 0 && result.indexOf('}') >= 0) {
		var tmp = eval("(" + result + ")");
		if (tmp.Message) {
			strReturn = tmp.Message;
		} else {
			strReturn = tmp;
		}
	} else {
		if (common.StrIsNull(result) != '')
			strReturn = result;
	}

	return strReturn;
};

(function($) {
	//备份mui的ajax方法  
	var _ajax = $.ajax;

	//重写mui的ajax方法  
	$.ajax = function(url, opt) {
		//备份opt中error和success方法  
		var fn = {
			error: function(XMLHttpRequest, textStatus, errorThrown) {},
			success: function(data, textStatus, xhr) {}
		}
		if (opt.error) {
			fn.error = opt.error;
		}
		if (opt.success) {
			fn.success = opt.success;
		}


		//扩展增强处理  
		var _opt = $.extend(opt, {
			beforeSend: function(req) {
				req.setRequestHeader('Authorization', self.getAuth());
				//				console.log('request send:'+JSON.stringify(req));
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				mui.plusReady(function() {
					if (plus.networkinfo.getCurrentType() == 1) {
						mui.toast('还没连接网络哦');
					} else if (plus.networkinfo.getCurrentType() == 0) {
						mui.toast("未知网络错误")
					}
					plus.nativeUI.closeWaiting();
					plus.navigator.closeSplashscreen(); //关闭启动界面
				});

				//console.log('request return error:'+JSON.stringify(XMLHttpRequest));
				var status;
				if (XMLHttpRequest.statusCode) {
					status = XMLHttpRequest.statusCode;
				} else if (XMLHttpRequest.status) {
					status = XMLHttpRequest.status;
				}
				switch (status) {
					case 401:
						if (getLocalItem("UserName") != '') {
							removeLocalItem("UserName");
							removeLocalItem("UserID");
							removeLocalItem("Token");
							removeLocalItem("DisplayName");
							removeLocalItem("SubjectID");
							plus.storage.removeItem(common.getPageName() + '.SubjectName');
							plus.storage.removeItem(common.getPageName() + '.SubjectID');
							plus.storage.removeItem(common.getPageName() + '.WorkTypeName');
							plus.storage.removeItem(common.getPageName() + '.WorkTypeID');
							plus.storage.removeItem(common.getPageName() + '.DisplayName');
							mui.toast('帐号已在其它设备登录，当前设备将退出。');
							//var myInfo=viewModelIndex.MyHref;
							//mui.toast(viewModelIndex().MyHref());
							mui.plusReady(function() {
								var myherf = plus.webview.getWebviewById(common.gIndexChildren[4].webviewId);
								var course = plus.webview.getWebviewById(common.gIndexChildren[3].webviewId);
								if (common.StrIsNull(myherf) != "") {
									myherf.reload(true);
								}
								if (common.StrIsNull(course) != "") {
									course.reload(true);
								}
							});

						}
						//common.transfer("../../modules/account/login.html");
						break;
					case 404:
						window.location = "404.html";
						break;
					default:
						mui.toast(handleResult(XMLHttpRequest.responseText));
						break;
				}
				//错误方法增强处理
				fn.error(XMLHttpRequest, textStatus, errorThrown);
			},
			success: function(data, textStatus, xhr) {
				var hasNew = xhr.getResponseHeader('VersionHasNew');
				var mustUpdate = xhr.getResponseHeader('VersionIsMajor');
				var VersionUrl=xhr.getResponseHeader('VersionUrl');
				var localMark = getLocalItem('Version.Confirming');
				//console.log(localMark);
				
				//console.log(hasNew+"-"+mustUpdate+"-"+VersionUrl);
				if (hasNew == 'true' && (typeof localMark == "undefined" || localMark != 'true')) {
					setLocalItem('Version.Confirming', 'true');	//标记提示中
					if (mustUpdate == 'true') {
						//console.log('发现新版本，赶紧下载体验吧~');
						plus.nativeUI.alert("发现新版本，赶紧下载体验吧~", function() {
							mui.plusReady(function() {
								common.installUpdateWgt(VersionUrl);
							})
						}, "更新提醒", "确定");
					} else {
						//console.log('发现新版本，是否更新？');
						var btnArray = ['确定', '取消'];
						mui.confirm('发现新版本，是否更新？', '发现新版本', btnArray, function(e) {
							if (e.index == 0) {
								common.installUpdateWgt(VersionUrl);
							} else {
								removeLocalItem('Version.Confirming');	//清除更新提示
								//成功回调方法增强处理  
								fn.success(data, textStatus, xhr);
							}
						})
					}
				}else{
					//成功回调方法增强处理  
					fn.success(data, textStatus, xhr);
				}
				

			}
		});
		_ajax(url, _opt);
	};
})(mui);

//日期格式化函数
Date.prototype.format = function(format) {
	var o = {
		"M+": this.getMonth() + 1, //month
		"d+": this.getDate(), //day
		"h+": this.getHours(), //hour
		"m+": this.getMinutes(), //minute
		"s+": this.getSeconds(), //second
		"q+": Math.floor((this.getMonth() + 3) / 3), //quarter
		"S": this.getMilliseconds() //millisecond
	}

	if (/(y+)/.test(format)) {
		format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	}

	for (var k in o) {
		if (new RegExp("(" + k + ")").test(format)) {
			format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
		}
	}
	return format;
}

/**
 * 根据字符串生成日期对象
 * @param {String} date 日期格式的字符串
 * @return {Date} 日期对象
 */
var newDate = function(date) {
	if (date instanceof Date) {
		return (new Date(date.format('yyyy/MM/dd hh:mm:ss')));
	}
	if (!date) {
		return (new Date());
	} else {
		return (new Date(date.replace(/-/gi, '/')));
	}

};


var $A = {

	gI: function(id) {
		return document.getElementById(id);
	},

	gC: function(id) {
		return document.getElementsByClassName(id);
	},

	gT: function(id) {
		return document.getElementsByTagName(id);
	}
};

/**
 * 动态沉浸式状态栏
 * @param {Object} w window
 */

(function(w) {
	/**
	 * 增加paddingTop
	 * @param {Object} dom dom节点
	 * @param {Number} num 增加的px数
	 */
	var addPaddingTop = function(dom, num) {
		var tmp = dom.style.paddingTop;
		if (!tmp) tmp = "0px";
		tmp = parseFloat(tmp.substring(0, tmp.length - 2));
		dom.style.paddingTop = tmp + num + 'px';

	}

	var addMarginTop = function(dom, num) {
		var tmp = dom.style.marginTop;
		if (!tmp) tmp = "0px";
		tmp = parseFloat(tmp.substring(0, tmp.length - 2));
		dom.style.marginTop = tmp + num + 'px';
	}

	var addHeight = function(dom, num) {
		var tmp = dom.offsetHeight;
		dom.style.height = tmp + num + 'px';
	}

	var addTop = function(dom, num, style) {
		var tmp = dom.offsetTop;
		if (style == 'im') {
			dom.style.cssText = 'top:' + (tmp + num) + 'px!important';
		} else {
			dom.style.top = tmp + num + 'px';
		}
	}

	var immersed = 0;
	var ms = (/Html5Plus\/.+\s\(.*(Immersed\/(\d+\.?\d*).*)\)/gi).exec(navigator.userAgent);
	if (ms && ms.length >= 3) {
		immersed = parseFloat(ms[2]);
	}
	w.immersed = immersed;
	//immersed = 15;
	if (!immersed) {
		return;
	}

	//页面头部
	var head = document.getElementsByTagName('header')[0];
	if (head) {
		addHeight(head, immersed);
		addPaddingTop(head, immersed);
		var headSon = head.getElementsByClassName('mui-bar-nav-em')[0];
		if (headSon) {
			addPaddingTop(headSon, immersed);
			//铃铛
			var headRed = headSon.getElementsByTagName('i')[0];
			if (headRed) {
				addTop(headRed, immersed);
			}
		}
		var headSon = head.getElementsByClassName('add-padding-top');
		for (var i = 0; i < headSon.length; i++) {
			if (headSon[i]) {
				addPaddingTop(headSon[i], immersed);
			}
		}
	}

	//选择课程头部
	var courseHeader = document.getElementById('courseHeader');
	if (courseHeader) {
		addHeight(courseHeader, immersed);
		addPaddingTop(courseHeader, immersed);
	}

	//特别TOP
	var specialHeader = document.getElementsByClassName('specialHeader');

	for (var i = 0; i < specialHeader.length; i++) {
		if (specialHeader[i]) {
			addTop(specialHeader[i], immersed, 'im');
		}
	}

	//	var hHead = $A.gI('hHead');
	//	if( hHead ) {
	//		addTop(hHead, immersed);
	//	}

	//内容框
	var content = document.getElementsByClassName('mui-content')[0];
	if (content) {
		addMarginTop(content, immersed);
	}


})(window);