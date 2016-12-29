mui.plusReady(function() {
	mui.init();
	var App = new Vue({
		el: "#vue-container",
		data: function() {
			return {
				Title: null,
				items: [
					//				{
					//					Id:null,
					//					Src:null,
					//					UserName
					//					Contect
					//					Time
					//				}
				]
			}
		},
		mounted: function() {
			var name = plus.webview.currentWebview().name;
			this.Title=plus.webview.currentWebview().title;
			var header = JSON.parse(plus.storage.getItem('header'));
			var data = JSON.stringify({
				Header: header,
				Body: {
					PageIndex: 1,
					PageSize: 100,
					CourseId: name
				}
			});
			sendAjax(ApiObj.GetMyCourseXinDeInfo, data, function(datas) {
				console.log(datas);
				if(datas.Code == 200) {
					App.items=datas.Body.Items;
					//宽度重置

//					resetWidth();
				} else {
					mui.alert(datas.Body.Message);
				}
			});
		}
	})
})