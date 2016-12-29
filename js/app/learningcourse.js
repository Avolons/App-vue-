if('addEventListener' in document) {
	document.addEventListener('DOMContentLoaded', function() {
		FastClick.attach(document.body);
	}, false);
}
mui.plusReady(function() {
	mui.init({
		gestureConfig: {
			doubletap: true
		}
	});
	var App = new Vue({
		el: "#vue-container",
		data: function() {
			return {
				header: JSON.parse(plus.storage.getItem('header')), //ajax数据头部
				timeSend: null, //视屏播放断点发送计时器
				player: null, //播放器对象
				Title: null, //页面总标题
				IsFirstMenu:0,//是否单层结构
				courseTitle: null, //课程列表标题
				netType: plus.storage.getItem("netType"), //移动网络播放
				autoPlay: plus.storage.getItem("autoPlay"), //自动播放
				userSrc: plus.storage.getItem("Pic"), //用户头像
				userName: plus.storage.getItem("UserName"), //用户名称
				courseList: null,
//				[
					//				{
					//					Id: 514,
					//					Src: "sfasdfsafd",
					//					Title: "sfasdfasd",
					//					PassTime: 5656
					//				}
//				], //课程列表
				getList: [
					//				{
					//					Src: "sfsafsda",
					//					UserName: "sfs",
					//					Contect: "sfasfdsf",
					//					Time: "21546"
					//				}
				], //心得列表
				timeData: {
					CourseId: null, //课程id
					WareId: null, //课件id
					SortId: null, //章节id
					wareType: 2, //
					RecordId: null, //课程学习记录
					Time: 0 //当前学习时间
				},
				//按钮切换
				buttonCheck: {
					course: true,
					get: false
				},
			}
		},
		methods: {
			//********
			tablecheck: function(ite) {
				this.buttonCheck.course = false;
				this.buttonCheck.get = false;
				this.buttonCheck[ite] = true;
			},
			//*************时间格式化函数
			getNowFormatDate: function() {
				var date = new Date();
				var seperator1 = "-";
				var seperator2 = ":";
				var month = date.getMonth() + 1;
				var strDate = date.getDate();
				if(month >= 1 && month <= 9) {
					month = "0" + month;
				}
				if(strDate >= 0 && strDate <= 9) {
					strDate = "0" + strDate;
				}
				var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate + " " + date.getHours() + seperator2 + date.getMinutes() + seperator2 + date.getSeconds();
				return currentdate;
			},
			//**********课程点击函数
			courseClick: function(ite) {
				//两级目录
				if (this.IsFirstMenu===0) {
					var List = App.courseList;
					for (var j=0;j<List.length;j++) {
						for (var k=0;k<List[j].childern.length;k++) {
							List[j].childern[k].ischeck= false;
						}
					}
					ite.ischeck = true;
	
					//进行视屏切换
					App.timeData.SortId = ite.id;
					var src = ite.src;
					this.videoCheck(src);
				} else{
					var List = App.courseList;
					//显示被点击状态
					for(var i in List) {
						List[i].ischeck = false;
					};
					ite.ischeck = true;
	
					//进行视屏切换
					App.timeData.SortId = ite.id;
					var src = ite.src;
					this.videoCheck(src);
				}
				
			},
			//***********新增心得函数
			AddGet: function() {
				//修复iOS 8.x平台存在的bug，使用plus.nativeUI.prompt会造成输入法闪一下又没了
				var btnArray = ['取消', '确定'];
				var header = this.header; //头部信息
				var WareId=this.timeData.WareId;//课件id
				var Id=this.timeData.CourseId;//课程id
				
				mui.prompt('请输入你的笔记：', '', '新增笔记', btnArray, function(e) {
					if(e.index == 1) {
						plus.nativeUI.showWaiting();
						var src = App.userSrc;
						//获取img的src值
						var time = App.getNowFormatDate();
						//获取回复时的时间- 
						var thisname = App.userName;
						//回复的昵称，本人的昵称 
						var content=e.value;
						//回复的具体内容
						var ajaxdata = JSON.stringify({
							Body: {
								WareId: WareId,
							    Contect: content,
							    doFlag: 0,
							    Id: Id
							},
							Header: header
						});
						sendAjax(ApiObj.AddCourseXinDe, ajaxdata, function(data) {
							if(data.Code === 200) {
								App.getList.push({
									Src: src,
									UserName: thisname,
									Contect: content,
									Time: time
								}); //数组添加新的回复
							}
							plus.nativeUI.closeWaiting();
						},function(){
							mui.alert("网络错误");
							plus.nativeUI.closeWaiting();
						});
					}
				});
			},
			//***视屏切换函数,player-播放器对象，src-播放器地址,auto-是否自动播放,net:非wifi播放，parentNet，当前播放环境，data-计时函数发送对象,header,头部对象
			videoCheck: function(src) {
				var parentNet = (plus.networkinfo.getCurrentType() != "CONNECTION_WIFI");
				var auto = this.autoplay;
				var net = this.netType;
				var player = this.player;
				var header = this.header;
				//视屏数据渲染
				player.src({
					type: "application/x-mpegURL",
					src: src
				});
				//视屏重置
				player.load();
				//首先清除计时器
				clearInterval(App.timeSend);
				//设置自动播放属性的时候进行播放
				player.ready(function() {
					//是否自动播放
					if(auto === "ture") {
						//是否是wifi环境
						if(parentNet) {
							player.play();
						} else {
							//允许非wifi环境下播放
							if(net === "true") {
								player.play();
							} else {
								mui.confirm('当前非wifi环境，是否继续播放？', '确认播放', btnArray, function(e) {
									if(e.index == 1) {
										player.play();
									} else {
										return false;
									}
								});
							}
						}
					}
				});
				//播放时启动定时器,每十秒发送一次数据
				player.on('play', function() {
					App.timeSend = setInterval(function() {
						App.timeData.Time = player.currentTime();
						var send_data = JSON.stringify({
							Body: App.timeData,
							Header: header
						});
						//十秒发送一次数据
						sendAjax(ApiObj.SaveLearnWare, send_data, function() {

						});
					}, 10000);
				});
				// 播放器停止，取消定时器
				player.on('pause', function() {
					clearInterval(App.timeSend);
				});
			},
			//*******数据初始化函数
			dataInit: function(thisWbview) {
				//获取到的所有数据；
				var data = thisWbview.data;
				this.timeData.CourseId = data.WareId;
				this.timeData.WareId = data.CourseId;
				this.timeData.RecordId = data.RecordId;
				var header = this.header;
				//课程目录ajax列表
				var courseList = JSON.stringify({
					Body: {
						LearnProcess: data.LearnProcess,
						Id: data.CourseId
					},
					Header: header,
				});
				//我的心得ajax列表
				var getLists = JSON.stringify({
					Body: {
						PageIndex: 1,
						PageSize: 20,
						CourseId: data.CourseId
					},
					Header: header,
				});
				//console.log(getList);
				//课程目录渲染过程
				sendAjax(ApiObj.GetCourseWareTree, courseList, function(data) {
					console.log(JSON.stringify(data));
					//***标题的更改 
					App.Title = data.Body.title;
					//***二级标题的更改
					App.courseTitle = data.Body.title;
					//列表的渲染
					App.courseList = data.Body.childernone;
					//定点ajax函数数据封装完成
					//等于1说明只有1级目录结构
					App.IsFirstMenu=data.Body.IsFirstMenu;
					if(data.Body.IsFirstMenu===1){
						App.timeData.SortId = data.Body.childernone[0].id;
						//视屏初始化
						App.videoCheck(data.Body.childernone[0].src);
						App.courseList[0].ischeck = true;
					}else{
						App.timeData.SortId = data.Body.childernone[0].childern[0].id;
						//视屏初始化
						App.videoCheck(data.Body.childernone[0].childern[0].src);
						App.courseList[0].childern[0].ischeck = true;
					}
					
				});
				//课程我的心得渲染过程
				sendAjax(ApiObj.GetCourseXinDe, getLists, function(data) {
					console.log(data);
					//*******数据渲染
					App.getList = data.Body.Items;
				})
			}

		},
		mounted: function() {
			//***********重写back函数，退出后会关闭整个页面
			var thiswebview = plus.webview.currentWebview();
			mui.back = function() {
				if(!$('#zjzxVideo').hasClass('video-zjzx-fullscreen')) {
					$('#zjzxVideo').addClass('video-zjzx-fullscreen');
					plus.navigator.setFullscreen(false);
					plus.screen.lockOrientation("portrait-primary");
				} else {
					plus.screen.lockOrientation("portrait-primary");
					plus.webview.close(thiswebview);
				}
				//强制竖屏
			};
			//首先进行视屏初始化
			this.player = videojs('zjzxVideo');
			//双击暂停和播放
			this.player.on('doubletap', function() {
				myPlayer.paused() ? myPlayer.play() : myPlayer.pause();
			});
			//点击显示播放条
			this.player.on('tap', function() {
				$('.vjs-control-bar').css('opacity', 1);
				setTimeout(function() {
					$('.vjs-control-bar').css('opacity', 0);
				}, 3000);
			});

			this.dataInit(plus.webview.currentWebview());

		}
	})

})