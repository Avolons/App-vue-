
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
				this.PageIndex = 1;
				var data = JSON.stringify({
					Header: this.header,
					Body: {
						PageIndex: this.PageIndex,
						PageSize: 200
					}
				});
				sendAjax(ApiObj.GetNewsList, data, function(data) {
					App.item = data.Body.Items;
					if(data.Body.TotalCount > 20) {
						App.flag = 1;
					} else {
						App.flag = 0;
					}
					App.PageIndex++;

				});
			},
			//最初载入
			dataload: function() {
				this.datainit();
				//获得事件参数
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
				});
				mui('.mui-scroll-wrapper').scroll().scrollTo(0, 0, 100);
				//根据id向服务器请求新闻详情
			},
			itemclick:function(ite){
				var detailPage = null;
				if(!detailPage) {
					detailPage = plus.webview.getWebviewById('newsInformation.html');
				}
				//触发详情页面的newsId事件
				mui.fire(detailPage, 'newsId', {
					id: ite.Id,
				});
				mui.openWindow({
					id: 'newsInformation.html',
					styles: {
						scrollIndicator: "none"
					}
				});
			}
		},
		mounted: function() {
			this.dataload();
		}
	});
});
