
mui.plusReady(function() {
	mui.init();
	var App = new Vue({
		el: "#vue-container",
		data: function() {
			return {
				//本地存储
				storage: plus.storage,
				//历史记录数据,最多四个
				histvalue:null,
				//ajax请求数据
				ajaxData: {
					PageIndex: 1, //当前页码
					PageSize: 99, //显示的条数
					Searchstr: null, //搜索的数据
				},
				//课程列表
				courseList: [
//				{
//					Src: "sdf",
//					Title: "sd",
//					Introduce: 'sfas',
//					Price: "df",
//					Id: 121,
//				}
				],
				//热门搜索数据
				hotSearch: [
//				{
//					CourseId: 1222,
//					Title: 'sfs'
//				}
				]
			};
		},
		//方法区
		methods: {
			//数据搜索
			fun_valSearch: function(str) {
				var header = JSON.parse(plus.storage.getItem('header'));
				var data = JSON.stringify({
					body: this.ajaxData,
					Header: header
				});
				sendAjax(ApiObj.GetCourseList, data, function(data) {
					//console.log(JSON.stringify(data));
					App.courseList = data.Body.Items;
					//数据更新
					App.$nextTick(function() {
						$('#search_list div').height(parseInt($('#search_list>li').width() * 0.4 / (5 / 3)));
					});
				});
				//搜索历史更新
				this.fun_localsave(str);
				//保存到本地
				App.storage.setItem("hist", JSON.stringify(App.histvalue));
			},
			//数据初始化,获得热门搜索数组,
			fun_dataInit: function() {
				var header = JSON.parse(plus.storage.getItem('header'));
				var data = JSON.stringify({
					Header: header,
					Body: {
						PageIndex: 1,
						PageSize: 4
					}
				});
				sendAjax('api/Course/GetCourseHotsearch', data, function(data) {
					App.hotSearch = data.Body.Items;
				});
			},
			//清除搜索数据
			fun_clear:function(){
				App.ajaxData.Searchstr=null;
				App.courseList=null;
			},
			//点击回车键搜索内容
			fun_keysearch: function() {
				if(event.keyCode == 13) {
					if(!App.ajaxData.Searchstr){
						mui.alert("搜索关键字不能为空");
						return false;
					}
					App.fun_valSearch(App.ajaxData.Searchstr);
				}
				if(!App.ajaxData.Searchstr){
					App.courseList=null;
				}
			},
			//点击搜索键搜索内容
			fun_iconsearch: function() {
				if(!App.ajaxData.Searchstr){
						mui.alert("搜索关键字不能为空");
						return false;
					}
					App.fun_valSearch(App.ajaxData.Searchstr);
			},
			//课程页面跳转
			fun_courseSearch: function(id, src) {
				//打开详情页面
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
			//历史记录删除
			fun_histdel: function() {
				//变成一个空数组
				App.histvalue = [];
				App.storage.setItem("hist", JSON.stringify(App.histvalue));
			},
			//历史记录点击方法
			fun_histclick: function(val) {
				this.ajaxData.Searchstr = val;
				this.fun_valSearch(val);
			},
			//本地数据存储方法
			fun_localsave: function(str) {
				for(var i in App.histvalue){
					if(App.histvalue[i]===str){
						//删除这个元素，并且重新排序
						App.histvalue.remove(str);
						App.histvalue.unshift(str);
						return false;
					}
				}
				if(App.histvalue.length>=4){
					App.histvalue.splice(3,1);
					App.histvalue.unshift(str);
				}else{
					App.histvalue.unshift(str);
				}
			},

		},
		//加载后预执行
		mounted: function() {
			//搜索历史数据初始化
			this.histvalue=JSON.parse(plus.storage.getItem("hist"))||[];
			//为js标准库数据挂载心得方法
			Array.prototype.indexOf = function(val) {
				for(var i = 0; i < this.length; i++) {
					if(this[i] == val) return i;
				}
				return -1;
			};
			Array.prototype.remove = function(val) {
				var index = this.indexOf(val);
				if(index > -1) {
					this.splice(index, 1);
				}
			};
			this.fun_dataInit();
			//删除数组中的每一项，方法array.indexOf("")，获取元素的索引
			//array.remove(""),删除该数组
		}
	});
});
