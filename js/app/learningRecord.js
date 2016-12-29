
mui.plusReady(function() {
	mui.init();
	var App = new Vue({
		el: "#vue-container",
		data: function() {
			return {
				flag: 1,//是否可以下拉刷新
				TotalCount: null,
				PageSize: 20,
				header: JSON.parse(plus.storage.getItem('header')),
				PageIndex: 1,
				recordList: [
					//							{
					//								Id: null,
					//								Title: null,
					//								Src: null,
					//								LearnProcessStr: null,
					//								LastLearnTime: null,
					//								AllowEnterTime: null,
					//								CoursePercentage
					//							}
				],
			};
		},
		methods: {
			//数据初始化
			datainit: function() {
				plus.nativeUI.showWaiting();
				var datas = JSON.stringify({
					Header: App.header,
					Body: {
						PageIndex: App.PageIndex,
						PageSize: App.PageSize
					}
				});
				sendAjax(ApiObj.GetMyCourseLearnRecord, datas, function(data) {
					if(data.Body.TotalCount > 20) {
						mui("#slider .mui-scroll").pullToRefresh().refresh(true);
						App.flag = 1;
					} else {
						App.flag = 0;
					}
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
			//下拉加载函数
			datapush: function(callback) {
				var datas = JSON.stringify({
					Header: App.header,
					Body: {
						PageIndex: App.PageIndex,
						PageSize: App.PageSize
					}
				});
				sendAjax(ApiObj.GetMyCourseLearnRecord, datas, function(data) {
					console.log(data);
					if(data.Body.TotalCount > 20) {
						App.flag = 1;
					} else {
						App.flag = 0;
					}
					//console.log(JSON.stringify(data));
					App.recordList = App.recordList.concat(data.Body.Items);
					App.PageIndex++;
					callback();
				});
			}

		},
		mounted: function() {
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
		}
	});
});
