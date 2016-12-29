$('#courseCenter div').height(parseInt($('#courseCenter>li').width() * 0.4 / (5 / 3)));
//启用fastclick插件

mui.plusReady(function() {
	mui.init({
		//预加载课程详情页面
		preloadPages: [{
			id: 'courseInformation.html',
			url: 'courseInformation.html',
			styles: {
				scrollIndicator: "none"
			}
		}],
	});
	//vue实例对象
	var App = new Vue({
		el: "#vue-container",
		data: function() {
			return {
				//是否可以上拉动加载
				flag: 1,
				//被点击的次数
				clicktime: 0,
				//是否有消息
				isMessage: false,
				//请求参数主体
				ajaxData: {
					PageIndex: 1, //页码
					PageSize: 20, //一次性拉取数量
					ClassId: 0, //课程id
					Coursesort: 0, //最新或者是最热
					Pricesort: 0, //收费课程或者免费课程

				},
				//导航栏是否被选中
				navSelect: {
					//课程类别列表
					Type: {
						sel: false,
						value: "全部类别",
						child: {
							all: "全部类别",
							typeList: [{
								ClassName: "",
								ChindleList: [{
									ClassName: "",
									ClassId: ""
								}]
							}]
						}
					},
					//最火或者最热课程
					newHot: {
						sel: false,
						value: "默认",
						child: [{
							mess: "默认",
							sel: true
						}, {
							mess: "最新",
							sel: false
						}, {
							mess: "最热",
							sel: false
						}]
					},
					//免费或者收费课程
					free: {
						sel: false,
						value: "全部",
						child: [{
							mess: "全部",
							sel: true
						}, {
							mess: "收费",
							sel: false
						}, {
							mess: "免费",
							sel: false
						}]
					}
				},
				//课程数据类型
				stateType: {
					'默认': 0,
					'最新': 1,
					'最热': 2,
					'全部': 0,
					'收费': 1,
					'免费': 2,
				},
				//课程主体数据
				courseList: [
					//				{
					//					Id: "course_118",
					//					Src: "images/home/hot_four.png",
					//					Title: "成功人士的准则",
					//					Introduce: "成功人士的五项自我管理成功人",
					//					Price: 200
					//				},
				],
				//遮罩层对象
				mask: mui.createMask(function() {
					App.navSelect.Type.sel = false;
					App.navSelect.newHot.sel = false;
					App.navSelect.free.sel = false;
				})
			};
		},
		methods: {
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
				urlopenwindow(function() {
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
			},
			//打开导航栏
			fun_openNav: function(item) {
				if(this.navSelect[item].sel === true) {
					this.navSelect[item].sel = false;
					this.mask.close();
				} else {
					this.mask.show();
					this.navSelect.Type.sel = false;
					this.navSelect.newHot.sel = false;
					this.navSelect.free.sel = false;
					this.navSelect[item].sel = true;
				}
			},
			//普通二级导航栏点击收起，同时刷新课程列表
			fun_closeNav: function(item, obj) {
				if(item.sel === true) {
					return false;
				} else {
					for(var i in obj.child) {
						obj.child[i].sel = false;
					}
					obj.value = item.mess;
					obj.sel = false;
					item.sel = true;
					App.mask.close();
					//数据更换，开始刷新课程
					if(obj == App.navSelect.newHot) {
						App.ajaxData.Coursesort = App.stateType[item.mess];
					} else {
						App.ajaxData.Pricesort = App.stateType[item.mess];
					}
					//重置页码
					App.ajaxData.PageIndex = 1;
					plus.nativeUI.showWaiting();
					//刷新课程
					App.fun_datainit();
				}
			},
			//第一导航点击切换效果
			fun_closeOne: function(item, obj) {
				for(var i in obj) {
					obj[i].istap = false;
				}
				item.istap = true;
				//用于触发视图更新，暂时不知道为什么有这种bug
				var result = App.navSelect.Type.value;
				App.navSelect.Type.value = "";
				App.navSelect.Type.value = result;
			},
			//三级导航栏点击收起，同时刷新课程列表
			fun_closeNav2: function(item, obj) {
				for(var i in obj) {
					obj[i].ischeck = false;
				}
				item.ischeck = true;
				this.navSelect.Type.value = item.ClassName;
				this.mask.close();
				//数据刷新切换
				//重置页码
				App.ajaxData.PageIndex = 1;
				App.ajaxData.ClassId = item.ClassID;
				plus.nativeUI.showWaiting();
				App.fun_datainit();
			},
			//收起全部
			fun_closeAll: function() {
				this.mask.close();
			},
			//全部选择
			fun_selectAll: function() {
				App.navSelect.Type.value = "全部类别";
				this.mask.close();
				//数据切换
				App.ajaxData.PageIndex = 1;
				App.ajaxData.ClassId = 0;
				plus.nativeUI.showWaiting();
				App.fun_datainit();
			},
			fun_courseClick: function(id, src) {
				//向后台传输自带的id值,将id值传递进去
				var detailPage = null;
				//				  向后台传输自带的id值
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
			fun_datainit: function() {
				//显示等待中
				setTimeout(function() {
					var header = JSON.parse(plus.storage.getItem('header'));
					console.log(plus.storage.getItem('header'));
					var data = JSON.stringify({
						body: App.ajaxData,
						Header: header,
					});
					sendAjax(ApiObj.GetCourseListByFilter, data, function(data) {
						if(data.Body.TotalCount > 20) {
							App.flag = 1;
							mui("#slider .mui-scroll").pullToRefresh().refresh(true);
						} else {
							App.flag = 0;
						}
						App.courseList = data.Body.Items;

						App.ajaxData.PageIndex++;
						App.$nextTick(function() {
							$('#courseCenter div').height(parseInt($('#courseCenter>li').width() * 0.4 / (5 / 3)));
						});
						mui('.mui-scroll-wrapper').scroll().scrollTo(0, 0, 100);
						plus.nativeUI.closeWaiting();
						//关闭等待中
					}, function() {
						//关闭等待中
						mui.alert("网络错误，请刷新重试");
					});
				}, 50);
			},
			//数据添加
			fun_dataPush: function(callback) {
				//显示等待中
				plus.nativeUI.showWaiting();
				setTimeout(function() {
					var header = JSON.parse(plus.storage.getItem('header'));
					var data = JSON.stringify({
						body: App.ajaxData,
						Header: header,
					});
					sendAjax(ApiObj.GetCourseListByFilter, data, function(data) {
						App.courseList = App.courseList.concat(data.Body.Items);
						if(data.Body.TotalCount > 20) {
							App.flag = 1;

						} else {
							App.flag = 0;
						}
						App.ajaxData.PageIndex++;
						App.$nextTick(function() {
							$('#courseCenter div').height(parseInt($('#courseCenter>li').width() * 0.4 / (5 / 3)));
						});
						callback();
						plus.nativeUI.closeWaiting();
						//关闭等待中
					}, function() {
						//关闭等待中
						mui.alert("网络错误，请刷新重试");
					});
				}, 500);
			},
			fun_navinit: function() {
				window.addEventListener('clicked', function(event) {
					//获得事件参数
					if(App.clicktime === 0) {
						//当前App是否存在已读消息
						App.isMessage = JSON.parse(plus.storage.getItem("isMessage"));
						App.clicktime++;
						var header = JSON.parse(plus.storage.getItem('header'));
						var data = JSON.stringify({
							Header: header,
						});
						//请求当前页面的课程分类数据
						sendAjax(ApiObj.GetSortList, data, function(datas) {
							//获得数据后将默认的第一列，第一条显示为被选中状态，同时更新ajaxdata默认数据;
							App.navSelect.Type.child.typeList = datas.Body.Items;
							App.navSelect.Type.child.typeList[0].istap = true;
							mui("#slider .mui-scroll").pullToRefresh({
								down: {
									callback: function() {
										console.log(this);
										var self = this;
										setTimeout(function() {
											App.ajaxData.PageIndex = 1;
											App.fun_datainit();
											self.endPullDownToRefresh();
										}, 1000);
									}
								},
								up: {
									contentrefresh: "正在加载...",
									contentnomore: '没有更多数据了',
									callback: function() {
										var self = this;
										setTimeout(function() {
											App.fun_dataPush(function() {
												if(App.flag === 1) {
													self.endPullUpToRefresh();
												} else {
													self.endPullUpToRefresh(true);
												}
											});
										}, 1000);
									}
								}
							});

							mui('.mui-scroll-wrapper').scroll().scrollTo(0, 0, 100);

						});
					}
				});
			}
		},
		mounted: function() {
			this.fun_navinit();

		}
	});
});