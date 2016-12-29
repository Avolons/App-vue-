mui.plusReady(function() {
	mui.init();
	var App = new Vue({
		el: "#vue-container",
		data: function() {
			return {
				clicktime: 0,
				flag: 1, //是否可以下拉刷新
				TotalCount: null,
				PageSize: 20,
				header: JSON.parse(plus.storage.getItem('header')),
				PageIndex: 1,
				timeList: {
					mes: '最近学习',
					val: false,
					child: [{
						mes: '最近学习',
						val: true,
					}, {
						mes: '最新课程',
						val: false,
					}, ]
				},
				typeList: {
					mes: "全部",
					val: false,
					child: [{
						mes: '全部',
						val: true,
					}, {
						mes: '未学习',
						val: false,
					}, {
						mes: '学习中',
						val: false,
					}, {
						mes: '已暂停',
						val: false,
					}, {
						mes: '已完成',
						val: false,
					}, {
						mes: '已过期',
						val: false,
					}, ]
				},
				Sorttype: 0, //时间排序
				LearnState: -1, //学习状态
				clicktime: 0, //被点击次数
				cloudList: [
					//							{
					//								Id: null,
					//								Title: null,
					//								Src: null,
					//								LearnProcessStr: null,
					//								LastLearnTime: null,
					//								AllowEnterTime: null,
					//							}
				],
				dataobj: {
					'最近学习': 0,
					'最新课程': 1,
					'全部': -1,
					'未学习': 0,
					'学习中': 1,
					'已暂停': 2,
					'已完成': 3,
					'已过期': 4
				},
				mask: mui.createMask(function() {
					App.typeList.val = false;
					App.timeList.val = false;
				})
			};
		},
		methods: {
			//数据初始化
			datainit: function() {
				var datas = JSON.stringify({
					Header: App.header,
					Body: {
						PageIndex: App.PageIndex,
						PageSize: App.PageSize,
						Sorttype: App.Sorttype,
						LearnState: App.LearnState,
					}
				});
				console.log(datas);
				sendAjax(ApiObj.GetMyCourseList, datas, function(data) {
					if(data.Body.TotalCount > 20) {
						mui("#slider .mui-scroll").pullToRefresh().refresh(true);
						App.flag = 1;
					} else {
						App.flag = 0;
					}
					//console.log(JSON.stringify(data));
					App.recordList = data.Body.Items;
					mui('.mui-scroll-wrapper').scroll().scrollTo(0, 0, 100);
					plus.nativeUI.closeWaiting();
					App.PageIndex++;
				});
			},
			//课程点击函数
			courseclick: function(item) { 
				//向后台传输自带的id值,将id值传递进去
				var detailPage = null;
				//向后台传输自带的id值
				//获得详情页面
				if(!detailPage) {
					detailPage = plus.webview.getWebviewById('courseInformation.html');
				}
				//触发详情页面的newsId事件
				mui.fire(detailPage, 'newsId', {
					id: item.Id,
					src: item.Src
				});
				//打开详情页面
				mui.openWindow({
					id: 'courseInformation.html'
				});
			},
			//第一层点击函数
			topclick: function(item) {
				if(item.val === true) {
					item.val = false;
					this.mask.close();
				} else {
					this.typeList.val = false;
					this.timeList.val = false;
					item.val = true;
					this.mask.show();
				}
			},
			//二层点击函数
			twoclick: function(item, parent) {
				for(ite in parent.child) {
					parent.child[ite].val = false;
				}
				item.val = true;
				parent.mes = item.mes;
				if(parent === this.timeList) {
					App.Sorttype = App.dataobj[parent.mes];
				} else {
					App.LearnState = App.dataobj[parent.mes];
				}
				this.mask.close();
				this.PageIndex = 1;
				this.datainit();
				plus.nativeUI.showWaiting();
			},
			//下拉加载函数
			datapush: function(callback) {  
				var datas = JSON.stringify({
					Header: App.header,
					Body: {
						PageIndex: App.PageIndex,
						PageSize: App.PageSize,
						Sorttype: App.Sorttype,
						LearnState: App.LearnState
					}
				});
				sendAjax(ApiObj.GetMyCourseList, datas, function(data) {
					console.log(data);
					if(data.Body.TotalCount > 20) {
						App.flag = 1;
					} else {
						App.flag = 0;
					}
					//console.log(JSON.stringify(data));
					App.cloudList = App.cloudList.concat(data.Body.Items);
					App.PageIndex++;
					callback();
				});
			}

		},
		mounted: function() {
			//被点击后触发事件
			window.addEventListener('clicked', function(event) {
				if(App.clicktime === 0) {

					setTimeout(function() {
						urlopenwindow(function() {

							mui("#slider .mui-scroll").pullToRefresh({
								down: {
									callback: function() {
										var self = this;
										setTimeout(function() {
											App.PageIndex--;
											App.datainit();
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
											App.datapush(function() {
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

							App.clicktime++;
							mui('.mui-scroll-wrapper').scroll().scrollTo(0, 0, 100);
						});
					}, 100);
				}
				//获得事件参数
				//根据id向服务器请求新闻详情
			});

			window.addEventListener('token', function(event) {
				App.header = JSON.parse(plus.storage.getItem('header'));

				//获得事件参数
				mui("#slider .mui-scroll").pullToRefresh({
					down: {
						callback: function() {
							var self = this;
							setTimeout(function() {
								App.PageIndex--;
								App.datainit();
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
								App.datapush();
								if(App.flag === 1) {
									self.endPullUpToRefresh();
								} else {
									self.endPullUpToRefresh(true);
								}
							}, 1000);
						}
					}
				});

				App.clicktime++;
				mui('.mui-scroll-wrapper').scroll().scrollTo(0, 0, 100);
				//根据id向服务器请求新闻详情
			});

		}

	});
});