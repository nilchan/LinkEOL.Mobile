var wgtVer = null; //设置更新包版本号
var ServerVersion = ""; //检查最新增量包版本号
var downloadUrl = "" //增量包下载地址

/*
 * 更新流程
 *(1)从服务器获取是否有最新增量号 checkVersion() checkUpdate()
 *(2)下载增量包  downloadWgt()
 *(3)安装增量包 installWgt(path)
 */

//页面初始化时获取当前的更新包版本号
function plusReady() {
	//getVersion();
	if (plus.webview.currentWebview().id != 'moreInfo.html' && getLocalItem('useApp') !='' ) {
		checkVersion();
	}
}
if (window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}

//版本检测
function checkVersion() {
	mui.ajax(common.gServerUrl + "API/Common/GetLatestVersion", {
		type: "GET",
		success: function(responseText) {
			var result = eval("(" + responseText + ")");
			ServerVersion = result.Version;
			downloadUrl = common.gServerUrl + result.Url;
			//mui.toast("ServerVersion:"+ServerVersion+",downloadUrl:"+downloadUrl);
			checkUpdate();
		}
	});
}

//检测是否有增量包
function checkUpdate() {
	//getVersion();
	plus.runtime.getProperty(plus.runtime.appid, function(inf) {
		wgtVer = inf.version;

		ServerVersion = common.transformNum(ServerVersion);
		wgtVer = common.transformNum(wgtVer);
		var toastText = "";
		if (ServerVersion != "") {
			if (wgtVer && (wgtVer < ServerVersion)) {
				downloadWgt();
			} else {
				toastText = "已是最新版本";
			}
		} else {
			toastText = "获取不到版本信息，请检查后重试~";
		}
		if (plus.webview.currentWebview().id == 'moreInfo.html') {
			mui.toast(toastText);
		}
	})
}
/* 此处先不让用户取消更新
 * //决定是否更新
function decideUpdate() {
	var btnArray = ['确定', '取消'];
	mui.confirm('是否下载最新版本', '发现新版本', btnArray, function(e) {
					if (e.index == 0) {
						downloadWgt();
					} else {
						
					}
				})
}*/

//下载增量包wgt
function downloadWgt() {
	plus.nativeUI.showWaiting("正在下载...", {
		color: "white",
		background: "rgba(0,0,0,0.5)",
		loading: {
			display: "none"
		}
	});
	plus.downloader.createDownload(downloadUrl, {
		filename: "_doc/update/"
	}, function(d, status) {
		if (status == 200) {
			mui.toast("下载成功");
			plus.nativeUI.closeWaiting();
			installWgt(d.filename); // 安装wgt包
		} else {
			//console.log("下载失败！");
			plus.nativeUI.closeWaiting();
			mui.toast("下载失败！");
		}
	}).start();
}

//更新应用资源
function installWgt(path) {
	plus.nativeUI.showWaiting("正在安装...", {
		color: "white",
		background: "rgba(0,0,0,0.5)",
		loading: {
			display: "none"
		}
	});
	plus.runtime.install(path, {}, function() {
		//console.log("安装wgt文件成功！");
		//mui.toast("安装wgt文件成功！");
		plus.nativeUI.closeWaiting();
		if (common.isIOS()) {
			plus.nativeUI.alert("应用资源更新完成，请重启本应用！", function() {
					
			}, "更新提醒", "确定");
		} else {
			plus.nativeUI.alert("应用资源更新完成！", function() {
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
		plus.nativeUI.closeWaiting();
		//console.log("更新失败[" + e.code + "]：" + e.message);
		mui.toast("更新失败[" + e.code + "]：" + e.message);
	});
}

/*function getVersion() {
	plus.runtime.getProperty(plus.runtime.appid, function(inf) {
		wgtVer = inf.version;
	})
}*/