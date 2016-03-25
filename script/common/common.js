var common = {
	//Web API地址
	//gServerUrl: "http://cloud.linkeol.com/",gVideoServerUrl: "http://video.linkeol.com/",gWebsiteUrl: "http://www.linkeol.com/",
	//gServerUrl: "http://192.168.1.99:8090/",gVideoServerUrl: "http://192.168.1.99:8099/",gWebsiteUrl: "http://192.168.1.99:8081/",
	gServerUrl: "http://192.168.1.88:8090/",gVideoServerUrl: "http://192.168.1.88:8099/",gWebsiteUrl: "http://192.168.1.88:8081/",
	//gServerUrl: "http://192.168.1.66:8090/",gVideoServerUrl: "http://192.168.1.66:8099/",gWebsiteUrl: "http://192.168.1.66:8080/",
	//gServerUrl: "http://linkeol.6655.la:8090/",gVideoServerUrl: "http://linkeol.6655.la:8099/",gWebsiteUrl: "http://linkeol.6655.la:8081/",
	//判断字符串是否为空，空则返回""
	StrIsNull: function(str) {
		if (str != null)
			return str;
		else
			return "";
	},

	//是否为ios
	isIOS: function() {
		var flag = false;
		if (plus.os.vendor == 'Apple') {
			flag = true;
		}
		return flag;
	},

	//版本号数字转化
	transformNum: function(txt) {
		var result = "";
		var txtArr = txt.split(".");
		for (var i = 0; i < txtArr.length; i++) {
			result += txtArr[i];
		}
		//console.log(result);
		return Number(result);
	},

	//获取当前时间 yyyy-mm-dd hh:mm
	getNowDate: function() {
		var now = new Date();

		var year = now.getFullYear(); //年
		var month = now.getMonth() + 1; //月
		var day = now.getDate(); //日
		var hh = now.getHours(); //时
		var mm = now.getMinutes(); //分
		var clock = year + "-";
		if (month < 10)
			clock += "0";
		clock += month + "-";
		if (day < 10)
			clock += "0";
		clock += day + " ";
		if (hh < 10)
			clock += "0";
		clock += hh + ":";
		if (mm < 10) clock += '0';
		clock += mm;
		return (clock);
	},

	//空格分割
	transforArray: function(txt) {
		if (common.StrIsNull(txt) == '') {
			return;
		}
		var result = txt.split(' '); //得到 分割数组
		return result
	},

	//是否为数字
	IsNum: function(str) {
		var reg = /^[0-9]{1,20}$/; //数字匹配
		var result = reg.test(str);
		return result; //返回boolean  true为数字，false为非数字
	},

	//是否为正确的手机号码
	isPhone: function(str) {
		//var reg = /^1[3|4|5|7|8][0-9]\d{4,8}$/; //手机号码匹配
		var reg = /^[1][3|4|5|7|8][0-9]{9}$/; //手机号码匹配
		var result = reg.test(str);
		return result; //返回boolean  true为手机号码，false为不正确手机号码
	},

	JsonConvert: function(jsonSrc, ValueField, TextField) {
		var jsonDest = [];
		if (typeof(jsonSrc) == "string") {
			jsonSrc = JSON.parse(jsonSrc);
		}
		if (jsonSrc) {
			for (var i = 0; i < jsonSrc.length; i++) {
				jsonDest.push({
					'value': jsonSrc[i][ValueField],
					'text': jsonSrc[i][TextField]
				});
			}
		}
		return jsonDest;
	},

	//ios是否安装qq,返回 0--未安装  1--已安装
	isInstallQQ: function() {
		var isQQInstalled;
		mui.plusReady(function() {
			if (plus.os.vendor == 'Apple') {
				var TencentOAuth = plus.ios.import("TencentOAuth");
				isQQInstalled = TencentOAuth.iphoneQQInstalled();
			} else {
				isQQInstalled = -1;
			}

		})
		return isQQInstalled
	},

	/**
	 * 图片压缩
	 * @param {String} imgSrc 图片本地原始路径
	 * @param {Int} compressInt 图片压缩的比例 
	 * @param {Function} callbackSuc 成功回调函数
	 * @param {Function} callbackErr 失败回调函数
	 */
	imgCompress: function(imgSrc, compressInt, callbackSuc, callbackErr) {
		var imgDst; //图片裁剪后的路径
		compressInt = compressInt * 100;
		//console.log(compressInt);
		var imgName = imgSrc.split("/")[1].split(".")[0];
		plus.zip.compressImage({
				src: imgSrc,
				dst: "_des/" + imgName + ".jpg",
				width: compressInt + '%', //"36%"
				height: compressInt + '%',
				//width:"339px",
				//height:'450px',
				overwrite: true,
				quality: 30
			},
			function(event) {
				callbackSuc(event.target, event.size);
			},
			function(error) {
				//result=imgSrc;
				callbackErr(error.code, error.message);
			});
	},

	/**
	 * 根据值获取对应的显示文本
	 * @param {Object} jsonSrc json字符串或数组（必须为value和text键值对的）
	 * @param {String} value 数值
	 * @return {String} 对应的文本
	 */
	getTextByValue: function(jsonSrc, value) {
		if (typeof(jsonSrc) == "string") {
			jsonSrc = JSON.parse(jsonSrc);
		}
		if (jsonSrc) {
			for (var i = 0; i < jsonSrc.length; i++) {
				if (jsonSrc[i].value == value) {
					return jsonSrc[i].text;
				}
			}
		}

		return '';
	},

	//页面预加载
	preload: function(targeUrl, extras, targeId, styles) {
		if (typeof targeId == "undefined") {
			targeId = targeUrl;
		}
		var page = mui.preload({
			url: targeUrl,
			id: targeId, //默认使用当前页面的url作为id
			extras: extras, //自定义扩展参数
			styles: styles, //窗口参数
		});
		//page.hide();
		return page;
	},

	//返回上一页
	goback: function() {
		history.back();
	},

	//页面跳转
	transfer: function(targetUrl, checkLogin, extras, createNew, autoShowWhileShow, id) {
		var tmpUrl = targetUrl;
		var localUserID = getLocalItem('UserID');

		if (checkLogin && (common.StrIsNull(localUserID) == '' || localUserID <= 0)) {
			//保存当前页面ID
			setLocalItem(common.gVarLocalPageIDBeforeLogin, plus.webview.currentWebview().id);
			tmpUrl = '/modules/account/login.html';
			autoShowWhileShow = true; //跳转至登录页面，强行设置自动打开页面
		}
		createNew = true;
		if (createNew === true) {
			var ws = plus.webview.getWebviewById(targetUrl);
			plus.webview.close(ws);
		}

		if (typeof autoShowWhileShow == "undefined")
			autoShowWhileShow = true;

		if (typeof id == "undefined")
			id = tmpUrl;

		mui.openWindow({
			url: tmpUrl,
			id: id,
			extras: extras,
			createNew: true,
			show: {
				autoShow: autoShowWhileShow,
				aniShow: "slide-in-right",
				duration: "100ms"
			},
			waiting: {
				autoShow: true
			}
		});
	},

	/**
	 * 判断是否首页的子页面
	 * @param {String} webviewId 页面的ID
	 */
	isIndexChild: function(webviewId) {
		var index = plus.webview.getLaunchWebview() || plus.webview.getWebviewById('indexID');
		for (var i = 0; i < index.children().length; i++) {
			if (index.children()[i].id == webviewId) {
				return true;
			}
		}

		return false;
	},

	getIndexChild: function(pos) {
		if (!pos) pos = 0;
		var index = plus.webview.getLaunchWebview() || plus.webview.getWebviewById('indexID');
		var reloadID = 0;

		for (var i = 0; i < index.children().length; i++) {
			if (index.children()[i].id == common.gIndexChildren[pos].webviewId) {
				reloadID = i;
				break;
			}
		}
		return index.children()[reloadID];

	},

	/**
	 * 不创建新webview显示首页，并选中第pos个选项卡
	 * @param {Int}} pos 选项卡的顺序（从0开始）
	 * @param {Boolean} reload 是否刷新该选项卡对应页面
	 * 
	 */
	showIndexWebview: function(pos, reload) {
		mui.plusReady(function() {
			var index = plus.webview.getLaunchWebview() || plus.webview.getWebviewById('indexID');
			var reloadID = 0;
			if (!pos) pos = 0;
			for (var i = 0; i < index.children().length; i++) {
				if (index.children()[i].id == common.gIndexChildren[pos].webviewId) {
					reloadID = i;
					break;
				}
			}
			if (reload) {
				index.children()[reloadID].reload();
			}
			index.evalJS('setActive(' + pos + ')');
			index.show("slide-in-right", "100ms");
		});
	},

	//显示当前页面
	showCurrentWebview: function() {
		mui.plusReady(function() {
			var ws = plus.webview.currentWebview();
			if (ws.parent())
				ws.parent().show();
			else
				ws.show();
			plus.nativeUI.closeWaiting();
		});
	},

	//根据银行卡号获取所属银行
	getMateBank: function(bankNum) {
		var result;
		bankNum = bankNum.replace(/\s+/g, ""); //去空格
		var resultNum = Number(bankNum.substr(0, 6)); //截取前6位数字
		bankList.forEach(function(item) { //匹配银行
			if (item.value == resultNum) {
				result = item.text;
				return;
			}
		});
		//console.log(typeof result);
		if (typeof result == "undefined") {
			return "";
		} else {
			result = result.split("-")[0] + "-" + result.split("-")[2]; //截取字段
			return result;
		}
	},

	//银行卡号处理
	getbankcardNum: function(bankcard) {
		var cardLen = bankcard.replace(/(^\s*)|(\s*$)/g, "").length; //卡号长度
		var result;
		var reg = /.{4}/g;
		if (cardLen == 19) {
			var rs = bankcard.match(reg);
			rs.push(bankcard.substring(rs.join('').length));
			result = rs.toString().replace(/\d{4},/g, "**** ");
		} else if (cardLen == 16) {
			var rs = bankcard.substring(0, 12).match(reg);
			rs.push(bankcard.substring(0, 12).substring(rs.join('').length));
			result = rs.toString().replace(/\d{4},/g, "**** ") + '*' + bankcard.substring(13, 17);
		}

		return result; //返回 **** **** **** *** /\d{4}/ 
	},

	confirmQuit: function() {
		var btnArray = ['确认', '取消'];
		mui.confirm('确认退出乐评家？', '退出提示', btnArray, function(e) {
			if (e.index == 0) {
				removeLocalItem("workTypeID");
				plus.runtime.quit();
			}
		});
	},

	/**
	 * 设置当前控件为禁用，并返回操作结果
	 * @return {Boolean} 若当前控件原状态是启用则返回true，其它情况返回false
	 */
	setDisabled: function(e) {
		var obj = e || event;
		if (obj) {
			if (obj.srcElement.disabled == true) {
				mui.toast("不可频繁操作");
				return false;
			} else {
				obj.srcElement.disabled = true;
				return true;
			}
		} else {
			return true;
		}
	},

	//设置当前控件为启用
	setEnabled: function(e) {
		var obj = e || event;
		//console.log(obj);
		if (obj) {
			//console.log(obj.srcElement.disabled);
			obj.srcElement.disabled = false;
		}
	},

	//根据认证状态及图片路径获取其中文描述
	getAuthStatusStr: function(authStatus, picPath) {
		switch (authStatus) {
			case 1:
				if (common.StrIsNull(picPath) == '')
					return '未认证';
				else
					return '待认证';
			case 2:
				return '未通过';
			case 3:
				return '已认证';
			default:
				return '';
		}
	},

	//根据QueryString参数名称获取值
	getQueryStringByName: function(name, url) {
		if (url == 'undefined') {
			if (typeof url == 'undefined') {
				url = location.search;
			}
		}
		var result = url.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
	
		if (result == null || result.length < 1) {
			return "";
		}
	
		return result[1];
	},

	//计算数组中某一列的总和
	getArraySum: function(array, field) {
		var ret = 0;
		array.forEach(function(item) {
			ret += item[field];
		})
		ret = ret.toFixed(2);

		return ret;
	},

	//提交动作（收藏、赞）
	postAction: function(actionType, targetType, targetID) {
		var ret = false;
		var ajaxUrl = common.gServerUrl + 'API/Action';
		mui.ajax(ajaxUrl, {
			type: 'POST',
			async: false,
			data: {
				UserID: getLocalItem('UserID'),
				ActionType: actionType,
				TargetType: targetType,
				TargetID: targetID
			},
			success: function(responseText) {
				ret = true;
			}
		})

		return ret;
	},

	/**
	 * 获取当前用户对被收藏者的所有动作（收藏、赞）
	 * @param {int} actionType 动作类型（0-所有；1-收藏；2-赞）
	 * @param {int} targetType 被收藏者类型（1-作品作业；2-新闻；3-用户）
	 * @param {int} targetId 被收藏者ID
	 * @param {Function} successCB 回调函数
	 */
	getActions: function(actionType, targetType, targetId, successCB) {
		var ajaxUrl = common.gServerUrl + 'API/Action/GetActions?actionType=' + actionType + '&targetType=' + targetType + '&targetId=' + targetId;
		mui.ajax(ajaxUrl, {
			type: 'GET',
			success: function(responseText) {
				successCB(responseText);
			}
		})
	},

	//对象克隆
	clone: function(obj) {
		var o;
		if (typeof obj == "object") {
			if (obj === null) {
				o = null;
			} else {
				if (obj instanceof Array) {
					o = [];
					for (var i = 0, len = obj.length; i < len; i++) {
						o.push(common.clone(obj[i]));
					}
				} else {
					o = {};
					for (var k in obj) {
						o[k] = common.clone(obj[k]);
					}
				}
			}
		} else {
			o = obj;
		}
		return o;
	},

	//初始化科目及类别的下拉数据源
	initSubjectsTemplate: function() {

		var allSubjectStr = getLocalItem(common.gVarLocalAllSubjectsStr);
		if (common.StrIsNull(allSubjectStr) == '') return; //若未取值，则无需初始化
		var subjects = JSON.parse(allSubjectStr);
		var previousClass = 0;

		var allSubjectClasses = [],
			allSubjects = [],
			allSubjectsBoth = [],
			allSubjectsIndex = [];
		//增加“全部分类”
		allSubjectClasses.push({
			subjectClass: 0,
			subjectClassName: '全部分类'
		});

		//增加“全部”
		allSubjects.push({
			id: 0,
			subjectName: '全部',
			subjectClass: 0,
			subjectClassName: '分类',
			subjectType: '类型',
			selected: true //默认选中
		});

		if (subjects.length > 0) {
			subjects.forEach(function(item) {
				if (item.SubjectClass != previousClass) {
					allSubjectClasses.push({
						subjectClass: item.SubjectClass,
						subjectClassName: item.SubjectClassName
					});

					allSubjectsBoth.push({
						value: item.SubjectClass,
						text: item.SubjectClassName,
						children: []
					})

					//增加每一类“全部”
					allSubjects.push({
						id: 0,
						subjectName: '全部',
						subjectClass: item.SubjectClass,
						subjectClassName: item.SubjectClassName,
						subjectType: '类型',
						selected: false
					});

					previousClass = item.SubjectClass;
				}

				allSubjects.push({
					id: item.ID,
					subjectName: item.SubjectName,
					subjectClass: item.SubjectClass,
					subjectClassName: item.SubjectClassName,
					subjectType: item.subjectType,
					selected: false
				});

				allSubjectsBoth[allSubjectsBoth.length - 1].children.push({
					value: item.ID,
					text: item.SubjectName
				});

				if (item.IsHome) {
					allSubjectsIndex.push({
						id: item.ID,
						subjectName: item.SubjectName,
						subjectClass: item.SubjectClass,
						dispOrderIndex: item.DispOrderIndex
					})
				}
			})
		}

		//首页显示的科目排序
		if (allSubjectsIndex.length > 0) {
			allSubjectsIndex.sort(function(left, right) {
				return left.dispOrderIndex == right.dispOrderIndex ? 0 : (left.dispOrderIndex < right.dispOrderIndex ? -1 : 1);
			})
		}

		setLocalItem(common.gVarLocalAllSubjectClassesJson, JSON.stringify(allSubjectClasses));
		setLocalItem(common.gVarLocalAllSubjectsJson, JSON.stringify(allSubjects));
		setLocalItem(common.gVarLocalAllSubjectsBothJson, JSON.stringify(allSubjectsBoth));
		setLocalItem(common.gVarLocalAllSubjectsIndexJson, JSON.stringify(allSubjectsIndex));
	},

	//从服务器获取所有科目
	getAllSubjectsStr: function() {
		if (getLocalItem(common.gVarLocalAllSubjectsStr) == "") {
			var sub = '[{"ID":1,"SubjectName":"笛子","SubjectClass":1,"SubjectType":11,"IsHome":true,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"民族乐器"},{"ID":2,"SubjectName":"唢呐","SubjectClass":1,"SubjectType":11,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"民族乐器"},{"ID":3,"SubjectName":"笙","SubjectClass":1,"SubjectType":11,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"民族乐器"},{"ID":4,"SubjectName":"葫芦丝","SubjectClass":1,"SubjectType":11,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"民族乐器"},{"ID":5,"SubjectName":"管子","SubjectClass":1,"SubjectType":11,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"民族乐器"},{"ID":6,"SubjectName":"二胡","SubjectClass":1,"SubjectType":12,"IsHome":true,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"民族乐器"},{"ID":7,"SubjectName":"广东高胡","SubjectClass":1,"SubjectType":12,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"民族乐器"},{"ID":8,"SubjectName":"京胡","SubjectClass":1,"SubjectType":12,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"民族乐器"},{"ID":9,"SubjectName":"板胡","SubjectClass":1,"SubjectType":12,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"民族乐器"},{"ID":10,"SubjectName":"琵琶","SubjectClass":1,"SubjectType":13,"IsHome":true,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"民族乐器"},{"ID":11,"SubjectName":"中阮","SubjectClass":1,"SubjectType":13,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"民族乐器"},{"ID":12,"SubjectName":"古筝","SubjectClass":1,"SubjectType":13,"IsHome":true,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"民族乐器"},{"ID":13,"SubjectName":"柳琴","SubjectClass":1,"SubjectType":13,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"民族乐器"},{"ID":14,"SubjectName":"扬琴","SubjectClass":1,"SubjectType":13,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"民族乐器"},{"ID":15,"SubjectName":"箜篌","SubjectClass":1,"SubjectType":13,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"民族乐器"},{"ID":16,"SubjectName":"民族打击乐","SubjectClass":1,"SubjectType":14,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"民族乐器"},{"ID":17,"SubjectName":"小号","SubjectClass":2,"SubjectType":21,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"西洋乐器"},{"ID":18,"SubjectName":"长号","SubjectClass":2,"SubjectType":21,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"西洋乐器"},{"ID":19,"SubjectName":"圆号","SubjectClass":2,"SubjectType":21,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"西洋乐器"},{"ID":20,"SubjectName":"大号","SubjectClass":2,"SubjectType":21,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"西洋乐器"},{"ID":21,"SubjectName":"萨克斯","SubjectClass":2,"SubjectType":21,"IsHome":true,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"西洋乐器"},{"ID":22,"SubjectName":"长笛","SubjectClass":2,"SubjectType":21,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"西洋乐器"},{"ID":23,"SubjectName":"单簧管","SubjectClass":2,"SubjectType":21,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"西洋乐器"},{"ID":24,"SubjectName":"巴松","SubjectClass":2,"SubjectType":21,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"西洋乐器"},{"ID":25,"SubjectName":"双簧管","SubjectClass":2,"SubjectType":21,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"西洋乐器"},{"ID":26,"SubjectName":"小提琴","SubjectClass":2,"SubjectType":22,"IsHome":true,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"西洋乐器"},{"ID":27,"SubjectName":"中提琴","SubjectClass":2,"SubjectType":22,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"西洋乐器"},{"ID":28,"SubjectName":"大提琴","SubjectClass":2,"SubjectType":22,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"西洋乐器"},{"ID":29,"SubjectName":"倍大提琴","SubjectClass":2,"SubjectType":22,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"西洋乐器"},{"ID":30,"SubjectName":"竖琴","SubjectClass":2,"SubjectType":22,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"西洋乐器"},{"ID":31,"SubjectName":"钢琴","SubjectClass":2,"SubjectType":23,"IsHome":true,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"西洋乐器"},{"ID":32,"SubjectName":"电子琴","SubjectClass":2,"SubjectType":23,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"西洋乐器"},{"ID":33,"SubjectName":"手风琴","SubjectClass":2,"SubjectType":23,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"西洋乐器"},{"ID":34,"SubjectName":"西洋打击乐","SubjectClass":2,"SubjectType":24,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"西洋乐器"},{"ID":35,"SubjectName":"吉他","SubjectClass":3,"SubjectType":31,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"流行音乐"},{"ID":36,"SubjectName":"贝斯","SubjectClass":3,"SubjectType":32,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"流行音乐"},{"ID":37,"SubjectName":"爵士鼓","SubjectClass":3,"SubjectType":33,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"流行音乐"},{"ID":38,"SubjectName":"电脑音乐","SubjectClass":3,"SubjectType":34,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"流行音乐"},{"ID":39,"SubjectName":"戏曲","SubjectClass":4,"SubjectType":41,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"戏曲"},{"ID":41,"SubjectName":"美声唱法","SubjectClass":5,"SubjectType":51,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"声乐"},{"ID":42,"SubjectName":"民族唱法","SubjectClass":5,"SubjectType":52,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"声乐"},{"ID":43,"SubjectName":"通俗唱法","SubjectClass":5,"SubjectType":53,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"声乐"}]';
			setLocalItem(common.gVarLocalAllSubjectsStr, sub);
			common.initSubjectsTemplate();
		}
		//var info = plus.push.getClientInfo();
		//var ajaxUrl = common.gServerUrl + 'Common/Subject/GetList?devicetoken=' + info.token + '&clientid=' + info.clientid;
		var ajaxUrl = common.gServerUrl + 'Common/Subject/GetList';
		mui.ajax(ajaxUrl, {
			type: 'GET',
			success: function(responseText) {
				//plus.storage.setItem(common.gVarLocalAllSubjects, responseText);
				setLocalItem(common.gVarLocalAllSubjectsStr, responseText);
				common.initSubjectsTemplate();
			}
		})
	},

	//获取科目类别数组
	getAllSubjectClasses: function() {

		var allSubjectClasses = getLocalItem(common.gVarLocalAllSubjectClassesJson);

		return JSON.parse(allSubjectClasses);
	},

	//获取科目数组
	getAllSubjects: function() {
		var allSubjects = getLocalItem(common.gVarLocalAllSubjectsJson);

		return JSON.parse(allSubjects);
	},

	//获取科目及类别的二级数组
	getAllSubjectsBoth: function() {
		var allSubjectsBoth = getLocalItem(common.gVarLocalAllSubjectsBothJson);

		return JSON.parse(allSubjectsBoth);
	},

	//获取首页显示科目的数组
	getAllSubjectsIndex: function() {
		var allSubjectsIndex = getLocalItem(common.gVarLocalAllSubjectsIndexJson);
		return JSON.parse(allSubjectsIndex);
	},

	//获取个推的信息
	getPushInfo: function() {
		removeLocalItem('Push.DeviceToken');
		removeLocalItem('Push.ClientID');
		var info = plus.push.getClientInfo();
		if (info) {
			setLocalItem('Push.DeviceToken', info.token);
			setLocalItem('Push.ClientID', info.clientid);
		}
	},

	//检测本地版本号
	getLocalVersion: function() {
		//console.log(plus.runtime.innerVersion)
		plus.runtime.getProperty(plus.runtime.appid, function(inf) {
			wgtVer = inf.version;
			//wgtVer = common.transformNum(wgtVer);
			if (common.StrIsNull(wgtVer) != '') {
				setLocalItem('Version.Local', wgtVer);
			}
		})
	},

	//下载更新包并安装
	installUpdateWgt: function(url) {
		var downloadUrl = common.gServerUrl + url;
		//console.log(downloadUrl);
		var waitingUI = plus.nativeUI.showWaiting("正在下载...", {
			color: "white",
			background: "rgba(0,0,0,0.5)",
			loading: {
				display: "none"
			}
		});
		plus.downloader.createDownload(downloadUrl, {
			filename: "_doc/update/",
			timeout: 15,
		}, function(d, status) {
			if (status == 200) {
				mui.toast("下载成功");
				plus.nativeUI.closeWaiting();
				// 安装wgt包
				plus.nativeUI.showWaiting("正在安装...", {
					color: "white",
					background: "rgba(0,0,0,0.5)",
					loading: {
						display: "none"
					}
				});
				//waitingUI.setTitle("正在安装...");
				plus.runtime.install(d.filename, {}, function() {
					//waitingUI.close();
					plus.nativeUI.closeWaiting();
					if (common.isIOS()) {
						plus.nativeUI.alert("应用资源更新完成，请重启本应用！", function() {
							removeLocalItem('Version.Confirming'); //清除更新提示
							removeLocalItem('Version.Local');
						}, "更新提醒", "确定");
					} else {
						plus.nativeUI.alert("应用资源更新完成！", function() {
							removeLocalItem('Version.Confirming'); //清除更新提示
							removeLocalItem('Version.Local');
							var wvs = plus.webview.all();
							for (var i = 0; i < wvs.length; i++) {
								if (plus.webview.currentWebview().id != wvs[i].id) {
									plus.webview.close(wvs[i]);
								}
							}
							plus.runtime.restart();
						}, "更新提醒", "确定");
					}
				}, function(e) {
					removeLocalItem('Version.Confirming'); //清除更新提示
					removeLocalItem('Version.Local');
					plus.nativeUI.closeWaiting();
					mui.toast("更新失败[" + e.code + "]：" + e.message);
				});
			} else {
				removeLocalItem('Version.Confirming'); //清除更新提示
				removeLocalItem('Version.Local');
				plus.nativeUI.closeWaiting();
				//console.log("下载失败")
				mui.toast("下载失败！");
			}
		}).start();
	},

	//根据起始时间和结束时间返回类似“9月20日 15:00~16:00”
	formatTime: function(btime, etime) {
		if (!btime) return;

		var bdate;
		if (btime instanceof Date)
			bdate = btime;
		else {
			bdate = new Date(btime.replace(/-/gi, '/'));
		}
		if (isNaN(bdate)) { //非日期格式，原文返回
			return btime;
		}
		var ehour = 0;
		if (etime) {
			if (etime instanceof Date)
				ehour = etime.getHours();
			else
				ehour = (new Date(etime.replace(/-/gi, '/'))).getHours();
		} else
			ehour = bdate.getHours() + 1;
		var ret = (bdate.getMonth() + 1) + '月' + bdate.getDate() + '日' + ' ' + bdate.getHours() + ':00~' + ehour + ':00';

		return ret;
	},

	//消息页面的跳转
	gotoMessage: function() {
		common.transfer("/modules/my/messageList.html", true);
	},

	//判断是否已有登录信息缓存
	hasLogined: function() {
		return (common.StrIsNull(getLocalItem('UUID')) != '' && common.StrIsNull(getLocalItem('UserID')) != '');
	},

	//获取未读消息
	getUnreadCount: function(callback) {
		//console.log(common.hasLogined());
		if (common.hasLogined() == false) {
			mui.ajax(common.gServerUrl + "API/Message/GetUnreadCount", {
				dataType: 'json',
				type: "GET",
				data: {
					receiver: getLocalItem('UserID'),
					lastTime: getLocalItem('msgLastTime')
				},
				success: function(responseText) {
					//console.log(responseText);
					callback(responseText);
				}
			});
		}
	},

	//传递作品参数的方法
	extrasUp: function(item) {
		var upExtras;
		if (common.gDictUserType.teacher == getLocalItem("UserType")) {
			upExtras = {
				workTypeID: 0, //老师，无需作品类型传递
				workTitle: item == 0 ? '我的作品' : '学生作业'
			}
		} else {
			var userTypeDes = common.gJsonWorkTypeStudent; //默认设置为学生作品类型
			if (item < userTypeDes.length) {
				upExtras = {
					workTypeID: userTypeDes[item].value,
					workTitle: item == 0 ? '我的作品' : '我的作业'
				}
			}
		}
		return upExtras;
	},

	/**
	 * 根据图片名获取其图片
	 * @param {String} photo 图片名
	 */
	getPhotoUrl: function(photo) {
		return common.gServerUrl + 'Images/' + photo;
	},
	getPhotoUrl2: function(photo) {
		return common.gWebsiteUrl + 'Pics/' + photo;
	},

	/**
	 * 获取视频缩略图
	 * @param {String} photo 图片名
	 */
	getThumbnail: function(photo) {
		if (typeof photo != 'undefined') {
			if (photo.toLowerCase().indexOf('http://') >= 0)
				return photo;
			else
				return common.gVideoServerUrl + 'Thumbnails/' + photo;
		} else {
			return '';
		}
	},

	/*
	 * 获取当前页面名称（不带后缀名）
	 */
	getPageName: function() {
		var a = location.href;
		var b = a.split("/");
		var c = b.slice(b.length - 1, b.length).toString(String).split(".");
		return c.slice(0, 1);
	},

	gContentRefreshDown: '刷新中...', //下拉时显示的文字
	gContentRefreshUp: '努力加载中...', //上拉时显示的文字
	gContentNomoreUp: '没有更多数据了', //上拉无数据时显示的文字
	gListPageSize: 8, //列表每页默认数量
	gVarWaitingSeconds: 60, //默认等待验证秒数

	//用户类型枚举
	gDictUserType: {
		teacher: 32,
		student: 64
	},
	//消息类型
	gMessageModule: {
		commentModule: 1, //点评
		workDownloadModule: 2, //作品下载
		courseModule: 3, //课程表
		homeworkModule: 4, //作业
		teacherAuthModule: 5, //老师认证
		examModule: 6, //考级报名
		feedBackModule: 7, //新建页面跳转
		systemMessageModule: 8, //系统通知
		activityModule: 9, //活动购票
		instructModule: 10, //授课关系通知
		accountModule: 11 //账户通知
	},

	//性别类型枚举
	gDictGenderType: {
		male: 0,
		female: 1
	},

	//作品点评状态
	gDictWorkType: {
		notComment: 1, //未点评
		Commenting: 2, //点评中
		Commented: 3 //已点评
	},

	//老师认证
	gDictTeacherAuthType: {
		IDAuth: 1, //身份认证
		EduAuth: 2, //学历认证
		ProTitleAuth: 3 //职称认证
	},

	//老师认证状态
	gDictAuthStatusType: {
		NotAuth: 1, //未认证
		Rejected: 2, //已拒绝
		Authed: 3 //已认证
	},

	//账户明细类型
	gDictAccountDetailType: {
		NotFinish: 0, //预收入
		Finished: 1, //已完成
		Transfered: 2 //已转账
	},

	//动作类型
	gDictActionType: {
		Favorite: 1, //收藏
		Like: 2 //赞
	},

	//动作对象类型
	gDictActionTargetType: {
		Works: 1, //作品
		News: 2, //新闻
		User: 3 //用户
	},

	//课时调整状态
	gDictLessonFeedbackStatus: {
		Normal: 1, //正常
		Handling: 2, //处理中
		Rejected: 3 //已拒绝
	},

	//订单状态
	gDictOrderStatus: {
		NotPay: 1, //未支付
		Payed: 2, //已支付
		Refunded: 3 //已退款
	},

	//订单货品类型
	gDictOrderTargetType: {
		Comment: 1, //点评
		CourseToUser: 2, //约课
		Download: 3, //下载
		Exam: 4, //考级报名
		Ticket: 5 //活动售票
	},

	//课程类型
	gDictCourseType: {
		One2One: 1, //可约课程
		One2More: 2 //已有课程
	},

	//作品来源类型
	gDictWorkSourceType: {
		Teacher: 1, //老师
		Activity: 2 //活动
	},

	gDictAttachmentConvertResult: {
		NotHandle: 0, //未处理
		Succeeded: 1, //转换成功
		Failed: 2 //转换失败
	},

	//是否类型JSON
	gJsonYesorNoType: [{
		value: 1,
		text: '是'
	}, {
		value: 0,
		text: '否'
	}],

	//性别类型JSON
	gJsonGenderType: [{
		value: 0,
		text: '男'
	}, {
		value: 1,
		text: '女'
	}],

	//老师作品类型
	gJsonWorkTypeTeacher: [{
		value: 1,
		text: "分解教程"
	}, {
		value: 2,
		text: "完整教程"
	}, {
		value: 3,
		text: "演出作品"
	}],

	//学生作品类型
	gJsonWorkTypeStudent: [{
		value: 104,
		text: "我的作业"
	}],

	//活动作品类型
	gJsonWorkTypeActivity: [{
		value: 201,
		text: "参赛作品"
	}],

	//活动类型
	gJsonActivityActProperty: {
		allActProperty: 0, //全部类型
		concert: 1, //专场音乐会
		teacherLectures: 2, //名师讲座
		CommunicationActivity: 3, //交流和讲座
		orchestraRecruit: 4 //青少年乐团团员招募

	},

	//视频码率类型
	gJsonVideoLevel: {
		SD: 1, //流畅（即标清）
		HD: 2, //高清
		UltraHD: 3 //超高清
	},

	//老师评级
	gJsonTeacherLever: [{
		value: 0,
		text: "全部",
		ctext: "全部"
	}, {
		value: 1,
		text: "★",
		ctext: "一星级"
	}, {
		value: 2,
		text: "★★",
		ctext: "二星级"
	}, {
		value: 3,
		text: "★★★",
		ctext: "三星级"
	}, {
		value: 4,
		text: "★★★★",
		ctext: "四星级"
	}, {
		value: 5,
		text: "★★★★★",
		ctext: "五星级"
	}],

	//老师排序
	gJsonTeacherSort: [{
		value: 1,
		text: "默认排序"
	}, {
		value: 2,
		text: "星级升序"
	}, {
		value: 3,
		text: "星级降序"
	}],

	//作品排序
	gJsonWorkSort: [{
		value: 5,
		text: "默认排序"
	}, {
		value: 6,
		text: "浏览降序"
	}, {
		value: 7,
		text: "点赞降序"
	}],

	//点评排序
	gJsonCommentSort: [{
		value: 8,
		text: "状态"
	}, {
		value: 9,
		text: "日期"
	}],

	//作品权限类型JSON
	gJsonWorkPublicType: [{
		value: 0,
		text: '不公开'
	}, {
		value: 1,
		text: '公开'
	}],

	//老师级别
	gProfessionalType: [{
		value: 1,
		text: '教授/国家一级演员'
	}, {
		value: 2,
		text: '副教授/国家二级演员'
	}],

	//课程类型
	gJsonCourseType: [{
		value: 1,
		text: '可约课程'
	}, {
		value: 2,
		text: '已有课程'
	}],

	//图片类型
	gAuthImgage: [{
		value: 0,
		text: '图片预览'
	}, {
		value: 1,
		text: '选择图片'
	}],

	//首页的子页面id
	gIndexChildren: [{
		value: 0,
		webviewId: "modules/home/home.html"
	}, {
		value: 1,
		webviewId: "modules/activity/activityList.html"
	}, {
		value: 2,
		webviewId: "modules/course/myCourse.html"
	}, {
		value: 3,
		webviewId: "modules/works/workIndex.html"
	}, {
		value: 4,
		webviewId: "modules/my/my.html"
	}],

	//考评级别
	gExamGrade: [{
		value: 0,
		text: "无"
	}, {
		value: 1,
		text: "一级"
	}, {
		value: 2,
		text: "二级"
	}, {
		value: 3,
		text: "三级"
	}, {
		value: 4,
		text: "四级"
	}, {
		value: 5,
		text: "五级"
	}, {
		value: 6,
		text: "六级"
	}, {
		value: 7,
		text: "七级"
	}, {
		value: 8,
		text: "八级"
	}, {
		value: 9,
		text: "九级"
	}, {
		value: 10,
		text: "十级"
	}],

	//考评订单状态
	gExamOrderStatus: [{
		value: 0,
		text: "未支付"
	}, {
		value: 1,
		text: "已支付"
	}],

	//活动状态
	gActivityStatus: [{
		value: 1,
		text: "准备中"
	}, {
		value: 2,
		text: "报名中"
	}, {
		value: 3,
		text: "进行中"
	}, {
		value: 4,
		text: "已结束"
	}],

	//报名状态
	gExamStatus: [{
		value: 1,
		text: "报名中"
	}, {
		value: 2,
		text: "考试中"
	}, {
		value: 3,
		text: "已结束"
	}, {
		value: 4,
		text: "可查询"
	}],

	//授课选择
	gInstructType: [{
		value: 1,
		text: '学生选择老师'
	}, {
		value: 2,
		text: '老师选择学生'
	}],

	//授课申请状态
	gIsConfirm: [{
		value: 0,
		text: '未申请'
	}, {
		value: 1,
		text: '已通过'
	}, {
		value: 2,
		text: '申请中'
	}],

	//老师作品类别
	gTeacherWorksFamous: [{
		value: -1,
		text: '全部'
	}, {
		value: 0,
		text: '专业老师'
	}, {
		value: 1,
		text: '名师'
	}],

	//用户收支明细
	gAccountDetail: [{
		value: 0,
		text: '全部'
	}, {
		value: 1,
		text: '收入'
	}, {
		value: 2,
		text: '支出'
	}],

	//老师点评类型
	gTeacherCommentType: [{
		value: 1,
		text: '作品点评'
	}, {
		value: 2,
		text: '作业点评'
	}],

	//是否有授课老师/同学
	gIsHaveInstructType: {
		isHaveTeacher: 1, //是否有授课老师
		isHaveClassmate: 2 //是否有同学
	},

	gArrayDayOfWeek: ['日', '一', '二', '三', '四', '五', '六'],
	gVarLocalDownloadTask: 'global.downloadTasks', //下载任务，包括已完成下载和未完成下载
	gVarLocalUploadTask: 'global.UploadTasks',
	gVarLocalAllSubjectsStr: 'global.AllSubjectsStr',
	gVarLocalAllSubjectsBothJson: 'global.AllSubjectsBothJson', //科目及科目类型的二级Json
	gVarLocalAllSubjectClassesJson: 'global.AllSubjectClassesJson', //所有科目类型的Json
	gVarLocalAllSubjectsJson: 'global.AllSubjectsJson', //所有科目的Json
	gVarLocalAllSubjectsIndexJson: 'global.AllSubjectsIndexJson', //所有首页显示科目的Json
	gVarLocalPageIDBeforeLogin: 'global.PageIDBeforeLogin', //登录前的页面ID

	/*获取网络状态值
	 * CONNECTION_UNKNOW: 网络连接状态未知  固定值0
	 * CONNECTION_NONE: 未连接网络  固定值1
	 * CONNECTION_ETHERNET: 有线网络  固定值2
	 * CONNECTION_WIFI: 无线WIFI网络  固定值3
	 * CONNECTION_CELL2G: 蜂窝移动2G网络  固定值4
	 * CONNECTION_CELL3G: 蜂窝移动3G网络  固定值5
	 * CONNECTION_CELL4G: 蜂窝移动4G网络  固定值6
	 * @description 获取网络状态的函数
	 */
	//gNetworkState: plus.networkinfo.getCurrentType(),
};