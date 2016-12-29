
mui.plusReady(function() {
	//mui初始化
	mui.init();
	var App = new Vue({
		el: "#vue-container",
		data: function() {
			return {
				header: JSON.parse(plus.storage.getItem('header')),
				PageIndex: 1,
				flag: 1,
				item: [
					//				{
					//					name
					//					tiem
					//					state
					//					pass
					//					changce
					//					score
					//					passscore
					//					allscore
					//				}
				]
			};
		},
		methods: {
			//数据初始化
			datainit: function() {
				plus.nativeUI.showWaiting();
				this.PageIndex = 1;
				var data = JSON.stringify({
					Header: this.header,
					Body: {
						PageIndex: this.PageIndex,
						PageSize: 5
					}
				});
				sendAjax(ApiObj.GetMyExam, data, function(data) {
					App.item = data.Body.Items;
					if(data.Body.TotalCount > 5) {
						mui("#slider .mui-scroll").pullToRefresh().refresh(true);
						App.flag = 1;
					} else {
						App.flag = 0;
					}
					mui('.mui-scroll-wrapper').scroll().scrollTo(0, 0, 100);
					plus.nativeUI.closeWaiting();
					App.PageIndex++;
				},function(){
					mui.alert("网络错误");
				});
			},
			//列表加载
			datapush: function(callback) {
				plus.nativeUI.showWaiting();
				var data = JSON.stringify({
					Header: App.header,
					Body: {
						PageIndex: App.PageIndex,
						PageSize: 5
					}
				});
				sendAjax(ApiObj.GetMyExam, data, function(data) {
					console.log(data);
					App.item = App.item.concat(data.Body.Items);
					plus.nativeUI.closeWaiting();
					if(data.Body.TotalCount > 5) {
						App.flag = 1;
					} else {
						App.flag = 0;
					}
					App.PageIndex++;
					callback();
				},function(){
					plus.nativeUI.closeWaiting();
					mui.alert("网络错误");
				});
			},
			//最初载入
			dataload: function() {
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
						contentrefresh : "正在加载...",
						contentnomore:'没有更多数据了',
						callback: function() {
							var self = this;
							setTimeout(function(){
								App.datapush(function(){
									if(App.flag === 1) {
											self.endPullUpToRefresh();
									} else {
											self.endPullUpToRefresh(true);
									}
								});
							},1000);  
						}
					}
				});
				mui('.mui-scroll-wrapper').scroll().scrollTo(0, 0, 100);
				//根据id向服务器请求新闻详情
			}
		},
		mounted: function() {
			this.dataload();

		}
	});
});
