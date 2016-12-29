/*
"Header": {
    "App": {
      "PackageName": "sample string 1",//包名
      "AppName": "sample string 2",//应用名称
      "Version": "sample string 3",//版本号
      "TenantId": 4,//施教机构id
      "Channel": "sample string 5"//应用安装来源
    },
    "Device": {
      "Platform": "sample string 1",//"iOS或者Android",
      "Model": "sample string 2",//"设备型号",
      "ScreenSize": "sample string 3",//"屏幕大小",
      "IMEI": "sample string 4",//"IMEI",安卓专用
      "Mac": "sample string 5",//设备唯一标示，ios专用
      "ClientId": "sample string 6"//空着
    },
    "User": {
      "Token": "sample string 1"//由后台获取
    }
  }
 */

var AppConfig = {
	//url 配置
	// url:'http://zjzxvpn.zjzx.cn/',
//	url:'http://192.168.1.112/', 
	url: 'http://appapi.zjzx.cn/', 
	phoneNumber: '01060603959', //咨询电话
};

//接口对象
var ApiObj = {
	//***课程相关
	GetNewestCourseList: "api/Course/GetNewestCourseList", //获得最新的课程列表
	GetCourseList: "api/Course/GetCourseList", //课程搜索
	GetCourseHotsearch: "api/Course/GetCourseHotsearch", //热门搜索
	GetMyCourseList: "api/Course/GetMyCourseList", //我的云课堂
	GetSortList: "api/Course/GetSortList", //获得课程分类
	GetCourseListByFilter: "api/Course/GetCourseListByFilter", //课程中心
	GetCourseInfo: "api/Course/GetCourseInfo", //课程详情
	StartlearnCourse: "api/Course/StartlearnCourse", //开始学习课程
	GetCourseWareTree: "api/Course/GetCourseWareTree", //获取课件资源目录
	SaveLearnWare: "api/Course/SaveLearnWare", //保存视频学习时间
	GetCourseXinDe: "api/Course/GetCourseXinDe", //获取课程学习心得
	GetMyCourseXinDe: "api/Course/GetMyCourseXinDe", //获取我的学习心得
	GetMyCourseXinDeInfo: "api/Course/GetMyCourseXinDeInfo", //我的学习心得详情
	GetMyCourseLearnRecord: "api/Course/GetMyCourseLearnRecord", //我的学习记录
	GetPayCourseInfo: "api/Course/GetPayCourseInfo", //获取课程价格详情
	GetCardInfo: "api/Course/GetCardInfo", //获得学习卡详情
	ActivationCrad: "api/Course/ActivationCrad", //激活学习卡
	GetCertificateList: "api/Course/GetCertificateList", //证书查询
	AddCourseXinDe:"api/Course/AddCourseXinDe",//添加课程心得
	//***用户相关
	Login: "api/User/Login", //登录
	IsExistsUserName: "api/User/IsExistsUserName", //查询账号是否存在
	Register: "api/User/Register", //注册
	SendVerificationCode: "api/User/SendVerificationCode", //获取手机验证码
	ChangePassword: "api/User/ChangePassword", //修改密码
	GetMessageList: "api/User/GetMessageList", //获得消息列表
	GetMessageInfo: "api/User/GetMessageInfo", //获得消息详情
	SetMessageRead: "api/User/SetMessageRead", //更新消息状态
	GetMyTransaction: "api/User/GetMyTransaction", //获取我的交易
	GetMyExam: "api/User/GetMyExam", //获取我的考试
	//***支付中心
	CreateOrder: "api/Payment/CreateOrder", //创建订单
	GetTOPayUnifiedorderInfo: "api/Payment/GetTOPayUnifiedorderInfo", //获取支付签名数据
	CheckOrderState: "api/Payment/CheckOrderState", //查询订单支付状态
	//***系统相关
	GetTenantIdByUrl: "api/System/GetTenantIdByUrl", //根据域名返回租户信息
	GetMainInfo: "api/System/GetMainInfo", //首页
	GetNewsList: "api/System/GetNewsList", //获取新闻列表
	GetNewsInfo: "api/System/GetNewsInfo",//获取新闻详情
	GetAppversion:"api/System/GetAppversion"//获取最新版本
};

/***
 本地对象存储
 * header：app系统配置参数
 * version：app系统版本号
 * isMessage:是否有新消息
 * Home_jsonData:首页的本地存储
 * hist:课程搜索页的历史搜索记录
 * UserName：用户姓名
 * Pic：用户头像地址
 * netType：移动环境下播放
 * autoPlay：视频自动播放
 * ***/

mui.plusReady(function() {
	if(!JSON.parse(plus.storage.getItem('header'))) {
		var header = {
			App: {
				PackageName: null, //包名
				AppName: null, //应用名称
				Version: null, //版本号
				TenantId: null, //施教机构id
				Channel: null //应用安装来源
			},
			Device: {
				Platform: null, //"iOS或者Android",
				Model: null, //"设备型号",
				ScreenSize: null, //"屏幕大小",
				IMEI: null, //"IMEI",安卓专用
				Mac: null, //设备唯一标示，ios专用
				ClientId: null //空着
			},
			User: {
				Token: null //由后台获取
			}
		};

		header.App.PackageName = 'andrics_sdf'; //人为设定这个值

		plus.runtime.getProperty(plus.runtime.appid, function(wgtinfo) {
			//设置app的名称
			header.App.AppName = wgtinfo.name;
			//设置app的版本号
			header.App.Version = wgtinfo.version;
		});

		//施教机构值
		header.App.TenantId = 8; //施教机构id，人为设置

		header.App.Channel = plus.runtime.origin; //应用安装来源

		header.Device.Platform = plus.os.name; //当前系统名称（安卓/ios）

		header.Device.Model = plus.device.model; //设备的型号

		header.Device.ScreenSize = plus.screen.resolutionHeight + '*' + plus.screen.resolutionWidth; //设备的宽高比

		if(plus.device.imei.indexOf(",")===-1){
			header.Device.IMEI = plus.device.imei; //设备的国际移动设备身份码(安卓机使用);
		}else{
			header.Device.IMEI = plus.device.imei.split(",")[0]; //设备的国际移动设备身份码(安卓机使用);
		}
		
		if(plus.device.uuid.indexOf(",")===-1){
			header.Device.Mac = plus.device.uuid; //设备的唯一标示（ios使用）;
		}else{
			header.Device.Mac = plus.device.uuid.split(",")[0]; //设备的唯一标示（ios使用）;
		}

		header.User.Token = null; 
		//从本地获取到token值，并将其注入
		//将header保存到本地数据区中
		plus.storage.setItem("header", JSON.stringify(header));

		//清空token值
	}
});

//判断是否处于登录状态
function urlopenwindow(callback) {  
	//获取token值
	var token = JSON.parse(plus.storage.getItem('header')).User.Token;
	//		console.log(token);
	if(token) {
		callback();
	} else {
		//获取当前页面url
		var thisWebview = plus.webview.currentWebview().id;

		console.log(thisWebview);
		//自定义事件触发登陆页面
		var loginHtml = plus.webview.getWebviewById('login.html');

		mui.fire(loginHtml, 'logined', {
			webviewId: thisWebview
		});

		mui.openWindow({
			url: "login.html",
			show: {
				aniShow: "slide-in-bottom",
				 duration:200,
				 //页面显示动画，默认为”slide-in-right“；
			},
		});
	}
}

//ajax封装函数
function sendAjax(urls, data, callback, errors) {
	errors = errors || function() {
		return false;
	};
	urls = AppConfig.url + urls;
	console.log(urls);
	mui.ajax(urls, {
		data: data,
		dataType: 'json', //服务器返回json格式数据
		type: 'post', //HTTP请求类型
		timeout: 5000, //超时时间设置为5秒；
		success: function(data) {
			//			console.log(data);
			if(data.Message == "验证权限失败!") {
				console.log("验证权限失败!");
				//清除token值
				
				var thisWebview = plus.webview.currentWebview().id;
				console.log(thisWebview);
				//自定义事件触发登陆页面
				var loginHtml = plus.webview.getWebviewById('login.html');

				mui.fire(loginHtml, 'logined', {
					webviewId: thisWebview
				});

				mui.openWindow({
					url: "login.html",
					show: {
						aniShow: "slide-in-bottom",
						duration:200, //页面显示动画，默认为”slide-in-right“；
					},
				});
				return false;
			}
			callback(data);
		},
		error: function(xhr, type, errorThrown) {
			//异常处理；
			console.log(type);
			mui.ajax(urls, {
				data: data,
				dataType: 'json', //服务器返回json格式数据
				type: 'post', //HTTP请求类型
				timeout: 5000, //超时时间设置为5秒；
				success: function(data) {
					callback(data);
				},
				error: function(xhr, type, errorThrown) {
					//异常处理；
					console.log(type);
					errors();
				}
			});
		}
	});
}
//阻尼系数
var deceleration = mui.os.ios ? 0.003 : 0.0009;
var jQuery=jQuery||null;
if(jQuery) {
	$('.mui-scroll-wrapper').scroll({
		bounce: false,
		indicators: true, //是否显示滚动条
		deceleration: deceleration
	});
}
