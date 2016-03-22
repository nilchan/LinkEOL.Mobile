var downloader = downloader || {};

var dtask = null; //下载任务
var downloadUrl = common.gServerUrl + "API/Video/GetVideoUrl?workId="; //视频下载地址
var options = {
	method: "GET"
}; //视频获取参数
/**
 * 上传视频
 * 
 * @param {int} workid 作品ID
 * @param {Function} callback 状态改变时的回调函数
 */
downloader.createDownloadTask = function(workId,callback) {
	plus.downloader.createDownload(downloadUrl + workId, options);
}