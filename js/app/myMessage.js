mui.plusReady(function() {
	//mui初始化
	mui.init({
		preloadPages: [{
			id: 'messageInformation.html',
			url: 'messageInformation.html'
		}],
	});

	var App = new Vue({
		el: "#vue-container",
		data: function() {
			return {
				clicktime: 0,
				header: JSON.parse(plus.storage.getItem('header')),
				PageIndex: 1,
				flag: 1,
				item: [
					//				{
					//					Status:0,////0是未读，1是已读
					//					Id:
					//					Src:
					//					Title:,
					//					Time:
					//					Innertext:
					//				}
				]
			};
		},
		methods: {
			//数据初始化
			datainit: function() {
				plus.nativeUI.showWaiting();
				App.flag = 1;
				App.PageIndex = 1;
				var data = JSON.stringify({
					Header: App.header,
					Body: {
						PageIndex: App.PageIndex,
						PageSize: 20
					}
				});
				sendAjax(ApiObj.GetMessageList, data, function(data) {
					App.item = data.Body.Items;
					if(data.Body.TotalCount > 20) {
						mui("#slider .mui-scroll").pullToRefresh().refresh(true);
						App.flag = 1;
					} else {
						App.flag = 0;
					}
					App.PageIndex++;
					mui('.mui-scroll-wrapper').scroll().scrollTo(0, 0, 100);
					plus.nativeUI.closeWaiting();
				});
			},
			//消息列表被点击事件
			itemclick: function(ite) {
				var detailPage = null;
				if(!detailPage) {
					detailPage = plus.webview.getWebviewById('messageInformation.html');
				}
				var data = JSON.stringify({
					Header: App.header,
					Body: {
						Id: ite.Id,
					}
				});
				//后台发送改消息的已读信息
				sendAjax(ApiObj.SetMessageRead, data, function(data) {
					ite.Status = 1; //已读状态
					//触发详情页面的newsId事件
					mui.fire(detailPage, 'messageId', {
						id: ite.Id,
					});
					mui.openWindow({
						id: 'messageInformation.html',
						styles: {
							scrollIndicator: "none"
						}
					});
				});
			},
			//列表加载
			datapush: function(callback) {
				plus.nativeUI.showWaiting();
				var data = JSON.stringify({
					Header: App.header,
					Body: {
						PageIndex: App.PageIndex,
						PageSize: 20
					}
				});
				sendAjax(ApiObj.GetMessageList, data, function(data) {
					App.item = App.item.concat(data.Body.Items);
					if(data.Body.TotalCount > 20) {
						App.flag = 1;
					} else {
						App.flag = 0;
					}
					plus.nativeUI.closeWaiting();
					App.PageIndex++;
					callback();
				});
			},
			//最初载入
			dataload: function() {
				var App = this;
				if(App.clicktime === 0) {
					//获得事件参数
					urlopenwindow(function() {
						mui("#slider .mui-scroll").pullToRefresh({
							down: {
								callback: function() {
									var self = this;
									setTimeout(function() {
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
										App.datapush(function(){
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
						App.clicktime++;
					});
				}
				//根据id向服务器请求新闻详情
			}
		},
		mounted: function() {
			this.dataload();
		}
	});
});