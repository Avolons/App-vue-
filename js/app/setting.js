mui.plusReady(function() {
	mui.init({
		preloadPages:[
    {
      url:'aboutUs.html',
      id:'aboutUs.html'
    }
  ]
	});
	var App = new Vue({
		el: "#vue-container",
		data: function() {
			return {
				local: plus.storage, //本地存储
			};
		},
		methods: {
			// token值重置方法
			f_setToken: function() {
					var header=JSON.parse(plus.storage.getItem('header'));
					header.User.Token=null;
					plus.storage.setItem("UserName",null);
					plus.storage.setItem("Pic",null);
					plus.storage.setItem("header",JSON.stringify(header));		
			},
			// 打开关于我们
			f_openAboutUs: function() {
				mui.openWindow({
					url: 'aboutUs.html',
					id: 'aboutUs.html',
					show: {
						aniShow: "slide-in-bottom",
						//页面显示动画，默认为”slide-in-right“；
					},
				});
			},
			// 更换施教机构，此方法暂时隐藏
			f_change: function() {
					
			},
			// 设置是否允许移动网络播放
			f_netType: function() {
				if(event.detail.isActive) {
					this.local.setItem("netType", "true");
				} else {
					this.local.setItem("netType", "false");
				}
			},
			// 设置时候允许自动播放
			f_autoPlay: function() {
				if(event.detail.isActive) {
					this.local.setItem("autoPlay", "true");
				} else {
					this.local.setItem("autoPlay", "false");
				}
			},
			// 清除缓存功能，实际没有这个功能，
			f_clear: function() {
				plus.nativeUI.shoWWaiting();
				setTimeout(function() {
					mui.alert("已清除所有缓存", '缓存清理', "确定", null, "div");
					plus.nativeUI.closeWaiting();
				}, 1000);
			},
			// 检查更新功能，比较复杂
			f_checkNew: function() {

			},
			// 退出操作
			f_close: function() {
				if(mui.os.ios) {
					//重置token值
					App.setToken();
					mui.openWindow({
						url: 'home.html',
						id: 'home.html',
						show: {
							aniShow: 'pop-in'
						},
						waiting: {
							autoShow: false
						}
					});
					return;
				}
				var btnArray = [{
					title: "注销当前账号"
				}, {
					title: "直接关闭应用"
				}];
				plus.nativeUI.actionSheet({
					cancel: "取消",
					buttons: btnArray
				}, function(event) {
					var index = event.index;
					switch(index) {
						//清除当前登录数据
						case 1:
							App.setToken();
							var thiswebview = plus.webview.currentWebview();
							plus.webview.hide(thiswebview);
							var detailPage = plus.webview.getWebviewById('mine.html');
							mui.fire(detailPage, 'token', {
								token: true
							});
							break;
						case 2:
							//直接关闭当前页面
							plus.runtime.quit();
							break;
					}
				});
			}
		},
		mounted: function() {
				
		}
	});
});