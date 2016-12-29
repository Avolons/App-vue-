/****
 2016.12.12
 wzh
 api：
 * 
 * 
 * ***/

mui(document).imageLazyload({
	placeholder: 'images/home/hot_four.png'
});
mui.plusReady(function() {
	//mui初始化
	mui.init({
		swipeBack: true, //启用右滑关闭功能
	});

	var App = new Vue({
		el: "#vue-container",
		data: function() {
			return {
				isMessage: true, //是否存在新消息
				//轮播图信息
				slider: [{
					CourseId: 11,
					Src: "img",
				}, ],
				//大家热搜
				hotSearch: [
					//				{
					//					CourseId: 11,
					//					Src: "sdf",
					//					Title: "sdfasfd"
					//				}
				],
				color: ["color1", "color2", "color3", "color4"],
				//热点新闻
				hotNews: {
					Id: null,
					Src: null,
					Title: null,
					newlist: [
						//					{
						//						Id: 111,
						//						Title: 'sdfsafdff'
						//					}
					]
				},
				//最新课程
				newCourses: [
					//				{
					//					Id: 11,
					//					Src: "sfsa",
					//					Title: "sfsadf",
					//					Introduce: "sfsafsdf",
					//					Price: "sfdsdfsdf",
					//				}
				]
			};
		},
		//方法区
		methods: {
			//前台数据初始化
			dataInit: function() {
				var header = JSON.parse(plus.storage.getItem('header'));
				var data = JSON.stringify({
					Header: header
				});
				setTimeout(function() {
					sendAjax(ApiObj.GetMainInfo, data, function(data) {
						//*********数据做本地存储
						plus.storage.setItem('Home_jsonData', JSON.stringify(data));
						//是否有消息
						App.isMessage = data.Body.IsSHowReddot;
						//本地存储消息状态
						plus.storage.setItem("isMessage", JSON.stringify(data.Body.IsSHowReddot));
						//创建轮播图
						App.slider = data.Body.slider;
						//创建大家热搜
						App.hotSearch = data.Body.hotsearch;

						//常见新闻列表
						App.hotNews = data.Body.hotnews;
						//最新课程列表
						var datas = JSON.stringify({
							Header: header
						});
						sendAjax(ApiObj.GetNewestCourseList, datas, function(data) {
							//创建最新课程列表
							App.newCourses = data.Body.Items;
							App.$nextTick(function() {
								$('#moreCourse>li').height($('#moreCourse>li').width() * 0.4 / (5 / 3));
								$('#moreCourse div').height(parseInt($('#moreCourse>li').width() * 0.4 / (5 / 3)) - 20);
								//图片懒加载
								mui(document).imageLazyload({
									placeholder: 'images/home/load.jpg'
								});
							});
						});
					}, function() {
						var btnArray = ['否', '是'];
						mui.confirm('加载失败，是否重新加载？', '重新加载', btnArray, function(e) {
							if(e.index == 1) {
								//重新加载
								App.dataInit();
							} else {
								mui.alert('加载失败');
							}
						});
					});
				}, 200);
			},
			//搜索框搜索事件
			fun_search: function() {
				mui.openWindow({
					id: 'courseSearch.html',
					show: {
						aniShow: "slide-in-right",
						duration: 200
					}
				});
			},
			//消息打开事件,处理后将本地存储置为消息已读
			fun_message: function() {
				urlopenwindow(function(){
					this.isMessage = false;
				plus.storage.setItem("isMessage", JSON.stringify(false));
				var detailPage = plus.webview.getWebviewById('messageNotification.html');
				//*****向消息详情页发送自定义事件
				mui.fire(detailPage, 'clicked', {
					click: true
				});
				mui.openWindow({
					id: 'messageNotification.html',
					show: {
						duration: 200
					}
				});
				});
				//消息设置为已读
			},
			//轮播图点击事件
			fun_sliderclick: function(id, src) {
				//需要将img的src和课程的id值都传输到后台去
				var detailPage = null;
				//向后台传输自带的id值
				//获得详情页面
				if(!detailPage) {
					detailPage = plus.webview.getWebviewById('courseInformation.html');
				}
				//触发详情页面的newsId事件
				mui.fire(detailPage, 'newsId', {
					id: id,
					src: src
				});
				//打开详情页面
				mui.openWindow({
					id: 'courseInformation.html'
				});
			},
			//大家热搜点击跳转
			fun_hotsearch: function(id, src) {
				var detailPage = null;
				//向后台传输自带的id值
				//获得详情页面
				if(!detailPage) {
					detailPage = plus.webview.getWebviewById('courseInformation.html');
				}
				//触发详情页面的newsId事件
				mui.fire(detailPage, 'newsId', {
					id: id,
					src: src
				});
				//打开详情页面
				mui.openWindow({
					id: 'courseInformation.html'
				});
			},
			//更多新闻,点击跳转
			fun_moreNews: function() {
				mui.openWindow({
					url: 'newslist.html',
					styles: {
						top: 0, //新页面顶部位置
						bottom: 0
					}
				});
			},
			//新闻图片点击事件
			fun_newimg: function(id) {
				var detailPage = null;
				//向后台传输自带的id值
				//获得详情页面
				if(!detailPage) {
					detailPage = plus.webview.getWebviewById('newsInformation.html');
				}
				//触发详情页面的newsId事件
				mui.fire(detailPage, 'newsId', {
					id: id
				});
				//打开详情页面
				mui.openWindow({
					id: 'newsInformation.html'
				});
			},
			//新闻点击事件
			fun_newsclick: function(id) {
				var detailPage = null;
				//向后台传输自带的id值
				//获得详情页面
				if(!detailPage) {
					detailPage = plus.webview.getWebviewById('newsInformation.html');
				}
				//触发详情页面的newsId事件
				mui.fire(detailPage, 'newsId', {
					id: id
				});
				//打开详情页面
				mui.openWindow({
					id: 'newsInformation.html'
				});
			},
			//最新课程绑定事件
			fun_newscourse: function(id, src) {
				var detailPage = null;
				// 向后台传输自带的id值
				//获得详情页面
				if(!detailPage) {
					detailPage = plus.webview.getWebviewById('courseInformation.html');
				}
				//触发详情页面的newsId事件
				mui.fire(detailPage, 'newsId', {
					id: id,
					src: src
				});
				//打开详情页面
				mui.openWindow({
					id: 'courseInformation.html'
				});
			},
			fun_reload: function() {

			}

		},
		mounted: function() {
			//预加载新闻列表页面
			setTimeout(function() {
				mui.preload({
					url: "newslist.html",
					id: "newslist.html", //默认使用当前页面的url作为id
					styles: {
						scrollIndicator: "none"
					}, //窗口参数
				});
			}, 200);

			//预加载新闻详情页面
			setTimeout(function() {
				mui.preload({
					url: "newsInformation.html",
					id: "newsInformation.html", //默认使用当前页面的url作为id
					styles: {
						scrollIndicator: "none"
					}, //窗口参数
				});
			}, 400);
			//进行轮播图初始化工作，5000毫秒切换一次
			var slider = mui("#sliderquery");
			slider.slider({
				interval: 5000
			});
			//********进入后先启用本地缓存数据
			(function() {
				if(plus.storage.getItem('Home_jsonData')) {
					var data = JSON.parse(plus.storage.getItem('Home_jsonData'));
					this.isMessage = JSON.parse(plus.storage.getItem("isMessage"));
					//创建轮播图
					this.slider = data.Body.slider;
					//创建大家热搜
					this.hotSearch = data.Body.hotsearch;
				}
			}());
			//数据初始化
			this.dataInit();

			//为导航栏四个快捷方式添加各自相应的事件
			var templates = {};
			//滑动显示方式
			var aniShow = "pop-in";
			var getTemplate = function(name, header, content) {
				var template = templates[name];
				//定义template为templates的name属性值
				//一定会预加载父模板
				if(!template) {
					//预加载共用父模板；
					var headerWebview = mui.preload({
						url: header,
						id: name + "-main",
						styles: {
							popGesture: "hide",
						},
						//侧滑返回隐藏webviw窗口，仅ios有效
						extras: {
							mType: 'main'
						}
						//额外参数，当打开新页面是有效，如果是跳转到一个已经预加载的页面，则无效
					});
					//预加载共用子webview
					var subWebview = mui.preload({
						url: !content ? "" : content,
						id: name + "-sub",
						styles: {
							top: '45px',
							bottom: '0px',
							scrollIndicator: "none"
						},
						extras: {
							mType: 'sub'
						}
					});
					//subWebview.show();
					subWebview.addEventListener('loaded', function() {
						setTimeout(function() {
							subWebview.show();
						}, 50);
					});
					//子页面加载完成后延迟显示
					subWebview.hide();
					//子页面隐藏
					headerWebview.append(subWebview);
					//iOS平台支持侧滑关闭，父窗体侧滑隐藏后，同时需要隐藏子窗体；
					if(mui.os.ios) { //5+父窗体隐藏，子窗体还可以看到？不符合逻辑吧？
						headerWebview.addEventListener('hide', function() {
							subWebview.hide("none");
						});
					}
					templates[name] = template = {
						name: name,
						header: headerWebview,
						content: subWebview,
					};
				}
				return template;
				//返回出来的template中含有主模板，子模板和name属性值
			};
			var initTemplates = function() {
				getTemplate('default', 'template.html');
			};
			mui('#nav_four').on('tap', 'li', function() {
				var id = this.getAttribute('data-href');
				if(!JSON.parse(plus.storage.getItem('header')).User.Token & id != "activateLearningCard.html" & id != "certificateQuery.html") {
					var thisWebview = plus.webview.currentWebview().id;

					//自定义事件触发登陆页面
					var loginHtml = plus.webview.getWebviewById('login.html');

					mui.fire(loginHtml, 'logined', {
						webviewId: thisWebview
					});

					mui.openWindow({
						url: "login.html",
						show: {
							aniShow: "slide-in-bottom",
							duration: 200,
							//页面显示动画，默认为”slide-in-right“；
						},
					});
					
					return false;
				}

				//获得所设置的href值
				var href = id;
				//TODO  by chb 当初这么设计，是为了一个App中有多个模板，目前仅有一个模板的情况下，实际上无需这么复杂
				//使用父子模板方案打开的页面
				//获得共用模板组
				var template = getTemplate('default'); //getTemplate('default');
				//判断是否显示右上角menu图标；
				//获得共用父模板
				var headerWebview = template.header;
				//获得共用子webview
				var contentWebview = template.content;
				var title = this.getElementsByTagName("a")[0].innerText.trim();

				//通知模板修改标题，并显示隐藏右上角图标；
				mui.fire(headerWebview, 'updateHeader', {
					title: title,
					target: href,
					aniShow: aniShow
				});
				if(mui.os.ios || (mui.os.android && parseFloat(mui.os.version) < 4.4)) {
					var reload = true;
					if(!template.loaded) {
						if(contentWebview.getURL() != this.href) {
							contentWebview.loadURL(this.href);
						} else {
							reload = false;
						}
					} else {
						reload = false;
					}
					(!reload) && contentWebview.show();
					headerWebview.show(aniShow, 150);
				}

			});
			//父子页面切换方式初始化
			initTemplates();
			mui("#slider .mui-scroll").pullToRefresh({
				down: {
					callback: function() {
						var self = this;
						setTimeout(function() {
							App.dataInit();
							self.endPullDownToRefresh();
						}, 1000);
					}
				}
			});
			//不触发，不往下滑动
			mui('.mui-scroll-wrapper').scroll().scrollTo(0, 0, 100);
		}
	});
});