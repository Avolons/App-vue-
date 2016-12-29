//启用fastclick插件
if('addEventListener' in document) {
	document.addEventListener('DOMContentLoaded', function() {
		FastClick.attach(document.body);
	}, false);
}
mui.plusReady(function() {
	mui.init({});
	//为适应不同的尺寸进行的判断
	var App = new Vue({
		el: "#vue-container",
		data: function() {
			return {
				header: JSON.parse(plus.storage.getItem('header')), //ajax头部信息
				src: "./images/course/logo.jpg",
				courseid: null, //课程id
				title: null,
				teacher: null,
				effective: null,
				time: null, //报名时间
				intrdouce: null,
				price: null,
				Paystate: 0, //支付状态
				wareid: null, //章节id
				bookList: [

				]
			}
		},
		methods: {
			//****拨打咨询电话
			call: function() {
				plus.device.dial(AppConfig.phoneNumber, true);
			},
			//****进入学习页面
			study: function() {
				//数据拼接                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
				var datas = JSON.stringify({
					body: {
						Id: App.courseid,
					},
					Header: App.header,
				});
				sendAjax(ApiObj.StartlearnCourse, datas, function(data) {
					//	console.log(JSON.stringify(data));
					if(data.Code == 200) {
						//打开新页面并携带额外参数
						mui.openWindow({
							url: 'learningCourse.html',
							styles: {
								scrollIndicator: 'none'
							},
							extras: {
								data: data.Body,
							}
						});
					} else {
						mui.alert(data.Message);
					}
				});
			},
			//*****进行报名
			design: function() {
				if(JSON.parse(plus.storage.getItem('header')).User.Token) {
					console.log(App.courseid);
					mui.openWindow({
						url: 'coursePurchase.html',
						styles: {
							scrollIndicator: 'none'
						},
						extras: {
							courseid: App.courseid,
						}
					});
				} else {
					mui.alert("请登录后购买");
					return false;
				};
				return false;
			},
			//******数据初始化
			datainit: function() {
				window.addEventListener('newsId', function(event) {
					plus.nativeUI.showWaiting();
					//获得事件参数
					var courseid = parseInt(event.detail.id);
					App.courseid = parseInt(event.detail.id);
					App.src = event.detail.src;
					//根据id向服务器请求课程详情
					var data = JSON.stringify({
						Body: {
							Id: courseid,
						},
						Header: App.header,
					});
					//console.log(data);
					sendAjax(ApiObj.GetCourseInfo, data, function(data) {
						//数据渲染开始
						var body = data.Body;
						console.log(body);
						App.title = body.Title;
						App.teacher = body.Teacher;
						App.effective = body.Effectivetime;
						App.time = body.Signtime;
						App.price = body.Price;
						App.intrdouce = body.Intrdouce;
						App.Paystate = body.Paystate;
						App.bookList = body.Teaching_list;
						plus.nativeUI.closeWaiting();
					},function(){
						mui.alert("网络错误");
						plus.nativeUI.closeWaiting();
					});
				});
			}
		},
		mounted: function() {
			//数据初始化
			this.datainit();
		}
	});
});