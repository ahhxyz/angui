
angui.controller("global",function($scope,$http,$location){
	$scope.beginTime=(new Date()).valueOf();

	$scope.tabs=[];
	$scope.dialogs=[];	
	$scope.moduleNames=["ERP---企业资源管理计划","MES---制造执行系统","MALL---商城管理","OA---协同工作","设置"]
	$scope.moduleMaps=moduleMaps;
	//该步赋值在$http.get()时完成
	$scope.menus=[];
	//左侧菜单特殊的DIV结构就决定了要采用以下这种特殊的方式来存储这个树结构，以便在迭代时能方便地输出所需要的DIV结构

	for(var menu in $scope.moduleNames){
		$scope.menus.push({name:$scope.moduleNames[menu],menu:menus[menu]});
	};
	$scope.items={};//含有URL字段的所有条目。必须定义成对象，否则以下面方式添加的所有元素在模板中都无法获取，虽然该数组不会用在模板里面


/*
	 *判断给定的参数是否代表一个模块。
	 *如果该参数是数字，只要该数字是$scope.moduleMaps的索引，那么就代表一个模块；
	 *如果该参数是字符串，只要其是$scope.moduleMaps的某个元素的索引为0的子元素，那么就代表一个模块
	 */
	$scope.isModule=function(arg){
		for(var i in $scope.moduleMaps){
			if(arg==i||arg==$scope.moduleMaps[i][0]){
				return true;
			}
		}
		return false;
	}


/*
	 *根据URL获取关键字
	 *URL类型：
	 	/0/1/params;/common/user/params;/user/params;/1/1/params;/erp/bom/params;
	 *这些URL均会原样发送到服务器端，主要是针对不包含模块的URL要能正确地获取其关键字。
	 */
	$scope.getKey=function(url){
		var position;//如果URL是视图查询的：/Common/User&Role;/User&Role
		if((position=url.indexOf("&"))!=-1){
			url=url.slice(0,position);
			if((position=url.lastIndexOf("/"))==url.length-1){
				url=url.slice(0,position);
			}
		}
		var key;
		var urls=url.toLowerCase().split("/");//url必须以:"/"开头，否则这一步会出错
		//先判断是否包含了模块部分,也就是判断urls[0]是一个模块名还是一个控制器名;
		var hasModule=$scope.isModule;
		/*
		if(urls[1]!=0&&urls[1]!="common"&&!$scope.moduleMaps[urls[1]]){//符合这些条件是urls[1]表示一个控制器名的必要条件
			//再遍历$scope.moduleMaps看其是否是该数组的索引或是该索引对应的模块名
			for(var i in $scope.moduleMaps){
				if(urls[1]==$scope.moduleMaps[i][0].toLowerCase()){
					hasModule=true;
					break;
				}else{
					hasModule=false;
				}
			}
		}
		*/
		if(hasModule){
			key=url.split("/").slice(0,3).join("/");
		}else{
			key=url.split("/").slice(0,2).join("/");
		}
		return key;
	}


	$scope.setItems=function(){
		var url,key;
				
		for(var x in $scope.menus){
			for(var y in $scope.menus[x]["menu"]){
				url=$scope.menus[x]["menu"][y]["url"];
				if(url){
					key=url;
					if(url.indexOf("|")==-1){
						//keyName=url.split("/").slice(0,3).join("/");
						key=$scope.getKey(url);
					}
					
					$scope.items[key]=$scope.menus[x]["menu"][y];
				}			
			}
		}
	}
				
	$scope.setItems();

	/*
	这个必须同步返回，异步返回实现不了所要的效果
		$http.get("/0/0")
		 	 .success(function(data){
		 		
		 	 	$scope.moduleMaps=data;
		 	 })
		 	 .error(function(err){
		 	 	console.log(err)
		 	 });
	*/	
	

	/*
	 *最重要的部分
	 *核心思想：通过URL的改变来引起视图和数据的改变
	 *思路：
	 *1.首先根据URL的基础的部分获取一个字符串存放在变量key中，这个变量就是该URL在容器中的一个标识；
	 *2.根据这个key在$scope.items中获取对应的信息，这些信息会在容器中创建新的元素时时使用到;
	 *3.根据key判断对应的容器元素是否已经打开，如果已经打开，则将容器类型，容器索引、元素索引（当该元素为tag时)存入，
	 	否则，根据item的信息构建该元素的内容来创建该元素;
	 *4.请求数据：根据tabIndex、tagIndex等信息来获取当前请求的、已经存在的容器元素，判断该元素是否存在data字段，
	 	(1)是，则比较当前的URL与path是否相等，不相等的话就重新请求数据来设置该元素的data字段;
	 	(2)否，则直接请求数据
	 
	 */
	$scope.$watch(
	  	function() {
	    	return $location.path();
	    }, 
		function(path) {

			//首先根据路径来在页面显示tab或dialog而不是直接请求服务器,下面的代码只是用来测试
			if(path==""||path=="/"){ //第一个条件表示非根路径；第二个条件是针对关闭唯一的选项卡时设置的uri
				return;
			}
			//这里最主要的操作是修改$scope.tabs或$scope.dialogs,这2个数组中的键名是请求服务器的URL，这个URL不一定要显示在地址栏

			//判断是否登录
		$scope.beginTime=(new Date()).valueOf();

			/*
			 */

			/*
			 *解析当前URL
			 */
			var key="",urls,paths,indexs,item,realDirs,tplPath,urlInfos,rows=50,page=1,finalElem,tabIndex,tagIndex,method="GET",targetElem={};

			if(path.search(/\/\w\/{0,}\/{1}\w{0,}\|/)==-1){//表示一个服务器端的资源，即要想服务器发送的URL
				urls=path.split("/").slice(1);
				paths=urls.slice(0,2);
				//key="/"+paths.join("/");
				key=$scope.getKey(path);
				//如果定义了参数到目录的映射，那么获取真实的目录名
				//realDirs=$scope.getRealDirs(urls);
				
				tplPath=$scope.getTplPath(key);
				//"App/"+(realDirs?realDirs[0]:paths[0])+"/View/"+(realDirs?realDirs[1]:paths[1])+"/index.html";
				if(path.search(/\/rows\/[\d]{0,}\/{0,1}/)!=-1){
					rows=path.match(/\/rows\/[\d]{0,}\/{0,1}/)[0].split("/")[2];
				}
				if(path.search(/\/page\/[\d]{0,}\/{0,1}/)!=-1){	
					page=path.match(/\/page\/[\d]{0,}\/{0,1}/)[0].split("/")[2];
				}	
			}else{//表示一个客户端资源，即数组$scope.menus的一个元素且其下还有终极元素.这种情况下path就是所有资源素的url字段，没有其他附加参数
				key=path;
				var tagUrls=key.split("|");
				var tags=[];
				var tagKey,tagTplPath;
				for(var tagUrl in tagUrls){
					if(!$scope.keyInTarget(tagUrls[tagUrl])){
						tagKey=$scope.getKey(tagUrls[tagUrl]);				
						tagTplPath=$scope.getTplPath(tagKey);
						tags.push(
							{
							key:tagKey,
							url:$scope.items[tagUrls[tagUrl]]["url"],
							name:$scope.items[tagUrls[tagUrl]]["name"],
							tplPath:tagTplPath
							}
							);
					}	

				}
				tags[0]["current"]=true;

			}

			for(var itemIndex in $scope.items){
				if(itemIndex==key){
					item=$scope.items[itemIndex];

				}
			}
			
			var target=typeof(item.target)=="undefined"?"tab":"dialog";
			var targetName=target+"s";
			var targetFuncSuffix=target.replace(target.slice(0,1),target.slice(0,1).toUpperCase());
			var theIndex;//确定当前元素是否已经打开，并将相关信息存入该变量
			if($scope[targetName].length>0&&(theIndex=$scope.isOpend(key))){//已有容器存在，如果能找到键名符合的容器，则予以显示
				//获取容器类型、索引及tag索引（如果存在）
			
				$scope["show"+targetFuncSuffix](theIndex[1]);
				panelName=targetFuncSuffix;
				finalElem=$scope[targetName][theIndex[1]];
				if(theIndex[2]){//当未定义的target元素是终极条目时，检查该终极条目是否是以tag形式打开了
						
					for(var  tagIndex in $scope[targetName][theIndex[1]]["tags"]){
						if($scope[targetName][theIndex[1]]["tags"][tagIndex]["key"].indexOf(key)==0){
							break;
						}
					}
					finalElem=$scope[targetName][theIndex[1]]["tags"][tagIndex];
					$scope.showTag(theIndex[1],tagIndex);
					//return;			
				}
				
				//return ;
				

			}else{	//构造新的容器数据
				
				

				/*
				 *创建新的targetElem
				 */


				targetElem["name"]=$scope.items[key]["name"]
				targetElem["url"]=$scope.items[key]["url"]
				targetElem["key"]=key;
				targetElem["rows"]=rows;
				targetElem["page"]=page;
				targetElem["tplPath"]=tplPath;
				targetElem["current"]=true;

	 			targetElem["path"]=path+"/rows/"+targetElem["rows"]+"/page/"+targetElem["page"];
				tabIndex=$scope[targetName].push(targetElem)-1;
				finalElem=$scope[targetName][tabIndex];


				if(tags){
					for(var tag in tags ){
						var theTag=tags[tag];
						theTag["rows"]=rows;
						theTag["page"]=page;
						theTag["method"]=method;
						
		 				theTag["path"]=theTag["url"]+"/rows/"+rows+"/page/"+page;
					}
					targetElem["tags"]=tags;
					
					tagIndex=0;
					finalElem=$scope[targetName][tabIndex]["tags"][tagIndex];
					delete targetElem["url"];//含有tag的容器不具有url、path及tplpath字段
					delete targetElem["path"];
					delete targetElem["tplPath"];
				}
			$scope["show"+targetFuncSuffix](tabIndex);

			}
		
 			/*
			 *请求对应列表数据
			 */

			if(finalElem["path"]&&!finalElem["data"]&&finalElem["httpUrl"]!=path){

			

				$http({
		 			method:method,
		 			url:finalElem["path"]
		 		}).success(function(data){
		 			finalElem["data"]=data;

		 		}).error(function(msg){
		 			$scope.responseInfo=msg.Data;
		 			console.log(msg)
		 		});

			}			 		
			
			//$scope[targetName][tabIndex]["current"]=true;
			console.log($scope.tabs)
			$scope.endTime=(new Date()).valueOf();
			var t=($scope.endTime-$scope.beginTime)/1000;
			console.log("耗时："+t+"秒");


	    }
 	);

	$scope.showTab=function($index){
		for(var i in $scope.tabs){
			$scope.tabs[i]["current"]=false;
		}
		$scope.tabs[$index]["current"]=true;

		//$scope.$apply();
	},
	$scope.showTag=function(tabIndex,index){
		for (var i in $scope.tabs[tabIndex]["tags"]){
			$scope.tabs[tabIndex]["tags"][i]["current"]=false;
		}
		//$scope.tabs[tabIndex]["href"]是对应tab的url和原先的current tag的uri组成的href值
		$scope.tabs[tabIndex]["tags"][index]["current"]=true;
		//$scope.tabs[tabIndex]["href"]="/"+$scope.tabs[tabIndex]["href"].split("/").slice(1,4).join("/")+$scope.tabs[tabIndex]["tags"][index]["uri"];
	},

	$scope.closeTarget=function(target,$index){ //如果放在Main控制器中的话，对$scope.isClosedTab设置值不起作用
		if($scope[target][$index]["current"]){
			var index,path;
			if($scope[target][$index+1]){
				index=$index+1;
			}else if($scope[target][$index-1]){
				index=$index-1;
			}else{
				$location.url("/")
			}

		}

		if($scope[target].length>1&&$index<$scope[target].length-1){ //如果当前tab个数大于一且要关闭的是不是最后一个tab

			for (var i=$index;i<$scope[target].length-1;i++){
				$scope[target][$index]=$scope[target][$index+1];

			} 
		}
		$scope[target].length--;//如果当前只有一个tab或要关闭的是最后一个tab，那么就会跳过上面的if语句而直接执行这条语句;
		index=index==$index+1?index-1:index;
		if(typeof(index)!="undefined"){
			path=$scope[target][index]["path"];

				if($scope[target][index]["tags"]){
					for(var i in $scope[target][index]["tags"]){
						if($scope[target][index]["tags"][i]["current"]){
							path=$scope[target][index]["tags"][i]["path"];
							break;
						}
					}
				}
			$location.url(path)
		}



	};


	/*
	 *根据给出的数组元素来打开一个tab，本质是修改$scope.tabs数组
	 *如果该元素没有子元素，那么以普通形式展示，否则以tag的形式展示	
	 */
	$scope.openTab=function(url){

	};

	$scope.post=function(url){
		//更改地址栏，设置相应的method为POST
	};

	$scope.put=function(url){

	};

/*
 *检查制定关键字的链接是否已经打开。如果没有则返回false；如果有，则返回target的类型（tab、dialog）、链接在target中的索引、是否是tag
 */
	$scope.isOpend=function(key){
		var targets=["Tabs","Dialogs"],target,isEqual,inTag;
		for(var i in targets){
			target=$scope[targets[i].toLowerCase()];
			for(var x  in target){
				if(target[x]["key"].indexOf(key)!=-1){//包含2种情况：/0/1|/0/2 》/0/1|/0/2、/0/1 》/0/1/rows/50和 /0/1 》/0/1|0/2
					if(target[x]["key"].indexOf("|")!=-1&&target[x]["key"]!=key){//检查是否是上面的第三种情形，即要打开的条目已在tag中打开
						inTag=true;
					}

					return [targets[i].slice(0,targets[i].length-1),x,inTag];
				}
			}
		}
		return false;
	};

	/*
	 *检查给定的关键字是否存在于target中
	 */
		$scope.keyInTarget=function(key){
		var targets=["Tabs","Dialogs"],target,isEqual,inTag;
		for(var i in targets){
			target=$scope[targets[i].toLowerCase()];
			for(var x  in target){
				if(target[x]["key"].indexOf(key)==0){//包含2种情况：/0/1|/0/2 》/0/1|/0/2、/0/1 》/0/1/rows/50和 /0/1 》/0/1|0/2

					return true;
				}
			}
		}
		return false;
	};
 
	$scope.getTplPath=function(key){
		var keys=key.split("/");
		var modulePath,controllerPath;
		if(keys.length==2){
			modulePath="Common";
			controllerPath=$scope.moduleMaps["0"][1][keys[1]]||keys[1];//这里的"0"表示Common模块的映射名
		}else{
			modulePath=keys[1];
			controllerPath=keys[2];
			if($scope.moduleMaps[keys[1]]){//相当于typeof($scope.moduleMaps[keys[0]])!="undefined"
				modulePath=$scope.moduleMaps[keys[1]][0];
				if($scope.moduleMaps[keys[1]][1][keys[2]]){
				
					controllerPath=$scope.moduleMaps[keys[1]][1][keys[2]];
				}
			}
		}

		return		"App/"+modulePath+"/View/"+controllerPath+"/index.html";
	};


	$scope.toPage=function(url,index){
	 	console.log(url,index,$scope.pageNum[index])
	};

	$scope.newArray=function(num){

		var arr= [];
		for(var i=0;i<num;i++){
			arr[i]=i;			
		}
		return arr;
	};

})
angui.controller("Themes",function($scope,$element,cookiesDo){
	$scope.themes=[
	 {value:"Blue",name:"蓝色"},
	 {value:"Orange",name:"金黄色"},
	 {value:"Default",name:"默认"},
	];
	$scope.change=function (val){
		cookiesDo.set("cimser_theme",val);
		var css=document.getElementById('themes');
		var href=css.href;
		var start=href.indexOf('Themes')+7;
		var end=href.lastIndexOf('.');
		css.href=href.replace(href.substring(start,end),val+'/'+val);
	}
	var ck=cookiesDo.get();
	if(typeof(ck["cimser_theme"])!="undefined"){
		$scope.change(ck["cimser_theme"]);
	};
})

angui.controller('Main',function($scope,$element,arrayDo){
	$scope.icons={};
	$scope.elemState={
		leftState:true,
		middleState:false,
		rightState:false,
	};
	$scope.icons.left="left"

	$scope.toggleLeft=function(){
		var $m={left:0};
		var $r={left:"6px",width:"99%"};
		$scope.elemState.leftState=!$scope.elemState.leftState;
		$scope.elemState.middleState=!$scope.elemState.middleState?$m:false
		$scope.elemState.rightState=!$scope.elemState.rightState?$r:false
		$scope.icons.left=$scope.icons.left=="left"?"right":"left"
	};


	/*
	 *
	 */

	 $scope.dialog=function(path){
	 	console.log(path);
	 };


})

angui.controller("page",function($scope){

})


angui.controller('Menu',function($scope,$element){
	$scope.accordingState=[];
	$scope.accordingStateCode=[];
	$scope.accordingState[0]=true
	$scope.accordingStateCode[0]="up";
	for (var x =1;x<5;x++){
		$scope.accordingState[x]=false;
		$scope.accordingStateCode[x]="down";

	}
	$scope.accordingToggle=function(index){
		if (!$scope.accordingState[index]){
			$scope.accordingState[index]=!$scope.accordingState[index];
			$scope.accordingStateCode[index]=$scope.accordingStateCode[index]=="up"?"down":"up";
			for (var y =0;y<5;y++){
				if(y!=index){
					$scope.accordingState[y]=false
					$scope.accordingStateCode[y]="down";

				}
			}
		}
	};
	
	
$scope.toggleTree=function(index,$index){
		var menu=$scope.menus[index]["menu"];
		var item=menu[$index];
		var id=item["id"];
		var up=menu[$index+1]["hide"]>0?false:true;
		for(var i=$index+1;menu[i]["pid"]==item["id"];i++){
			if(!menu[i]["hide"]){
				menu[i]["hide"]=0;				
			}
			if(up){
				menu[i]["hide"]++;
			}else{
				menu[i]["hide"]--;
			}
		}
		
	}	
	$scope.leftWidth={};
	$scope.menuState=true;
	$scope.toggle=function(){
		//$scope.menuState=!$scope.menuState;
			$scope.leftWidth={width:10};

	}
})

/*
 *自定义服务
 */

/*
angui.factory("demo",function(){
	var arr=[];
	arr["name"]="姓名";
	return arr;
})
这样定义的服务，可以直接这样demo["name"]来获取值;
*/
angui.factory("cookiesDo",[function(){//左放括号后面可以加上：“ "$http", ”来注入该服务中依赖的其它服务
	var cookie=[];
	return {	
		get:function(){
			if(document.cookie.length>0){
				var ck=document.cookie.split(";");
					for (var i in ck){
						var data=ck[i].replace(" ","").split("=");
						cookie[data[0]]=data[1];
					}
				return cookie;
			}
		},
		set:function(name,value){
		document.cookie=name+"="+value;//该语句会将新的cookie字符串附件在原字符串的后面，不用手动和原字符串连接;

		},	
	};
}]);


/*
 *自定义指令
 *
 */


angui.directive('draggable', function($document) {
	var startX=0, startY=0, x = 0, y = 0;
	return function(scope, element, attr) {
			element.css({
			position: 'relative',
			});
		
		element.bind('mousedown', function(event) {
			startX = event.screenX - x;
			startY = event.screenY - y;
			$document.bind('mousemove', mousemove);
			$document.bind('mouseup', mouseup);
		});
	
		function mousemove(event) {
			y = event.screenY - startY;
			x = event.screenX - startX;
			element.css({
			top: y + 'px',
			left:  x + 'px'
			});
		}
	
		function mouseup() {
			$document.unbind('mousemove', mousemove);
			$document.unbind('mouseup', mouseup);
		}

	}
});

/*
 *点击时以tab的形式打开，内容的具体展示分普通和tags两种
 */
angui.directive("tab",function(){
	return{};

})

/*
 *点击时以dialog的形式打开，内容的具体展示分普通和tags两种
 */
angui.directive("dialog",function(){
	return{};

})

 angui.directive('ePost',function (){
 	
 	return {
 		restrict:'A',
 		tmplate:'<div>{{url}}</div>',
 		replace:true
 	};
 });

angui.directive("ePage",function($location){
	return function(scope,element,attr){
		element.bind("click",function(){
			$location.url($location.url().replace(/\/rows\/[\d]{0,}\//,"/rows/"+attr.page+"/"));

		})
	}
})


 angui.service("arrayDo",function() {
 	this.remove=function(arr,from,to){
	    var rest = arr.slice((to || from) + 1 || arr.length);
	    arr.length = from < 0 ? arr.length + from : from;
	    arr.push.apply(arr, rest);
		return arr;
	}
});

