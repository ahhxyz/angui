	/*
	 *不管这个数组是嵌套形式的，tpl始终是唯一和确定的，输出的href也是固定的，与数组的数据结构无关，必须保证这一点。
	 *menus数组是树形数据结构，且这个树结构必须是已经排序好的。
	 */
	//键名(也就是替代真实模块名和控制器名的字符串)可以使用字母，所以定义成了下面的结构：
	var moduleMaps={
		"0":["Common",{"0":"Index","1":"User","2":"Role","3":"Department","4":"Position","5":"Company"}],
		"1":["Erp",{"0":"BOM","1":"WorkCenter","2":"Routing","3":"waixie","4":"MPS","5":"CRP"}],
	};	
	var menus=[
		[
		//erp菜单数据
			{id:2,name:"生产管理",level:1},
				{id:3,name:'生产主数据',pid:2,level:2,icon:"fa-bar-chart-o",url:"/1/0|/1/1|/1/2|/1/3"},
					{id:4,name:"物料清单",pid:3,level:3,isFinal:true,url:"/1/0/group",isShow:true,icon:"fa-list-ol",},
					{id:5,name:"工作中心",pid:3,level:3,isFinal:true,url:"/1/1",isShow:true,icon:"fa-stack-exchange",},
					{id:6,name:"工艺路线",pid:3,level:3,isFinal:true,url:"/1/2",isShow:true,icon:"fa-arrows-v",},
					{id:7,name:"外协单位",pid:3,level:3,isFinal:true,url:"/1/3",isShow:true,icon:"fa-arrows-v",},
				{id:8,name:'生产计划',pid:2,level:2},
					{id:9,name:"主生产计划",pid:8,level:3,isFinal:true,url:"/1/6",hide:1},
					{id:10,name:"粗能力计划",pid:8,level:3,isFinal:true,url:"/1/7",hide:1},
					{id:11,name:"生产计划",pid:8,level:3,isFinal:true,url:"/1/8",hide:1},

				{id:12,name:'生产控制',pid:2,level:2},
					{id:13,name:"生产订单",pid:12,level:3,isFinal:true,hide:1},
					{id:14,name:"工单",pid:12,level:3,isFinal:true,hide:1},
					{id:15,name:"完工收货",pid:12,level:3,isFinal:true,hide:1},
					{id:16,name:"成本核算",pid:12,level:3,isFinal:true,hide:1},
				{id:20,name:'及时生产',pid:2,level:2},	
			{id:30,name:'物料控制',pid:1,level:1},
					{id:31,name:'物料主数据',pid:30,level:2},
						{id:32,name:"库存地点",pid:31,level:3,isFinal:true,hide:1},
						{id:33,name:"物料组",pid:31,level:3,isFinal:true,hide:1},
						{id:32,name:"库存地点",pid:31,level:3,isFinal:true,hide:1},
						{id:33,name:"物料主数据",pid:31,level:3,isFinal:true,hide:1},
						{id:34,name:"供应商",pid:31,level:3,isFinal:true,hide:1},
						{id:35,name:"采购组织",pid:31,level:3,isFinal:true,hide:1},
						{id:36,name:"采购组",pid:31,level:3,isFinal:true,hide:1},
					{id:37,name:"采购",pid:30,level:2},
						{id:38,name:"询价单",pid:37,level:3,isFinal:true,hide:1},
						{id:39,name:"采购计划",pid:37,level:3,isFinal:true,hide:1},
						{id:40,name:"采购订单",pid:37,level:3,isFinal:true,hide:1},
						{id:41,name:"采购收货",pid:37,level:3,isFinal:true,hide:1},
						{id:42,name:"采购发票",pid:37,level:3,isFinal:true,hide:1},
					{id:43,name:'库存管理',pid:30,level:2},
						{id:44,name:"库存清单",pid:43,level:3,isFinal:true,hide:1},
						{id:45,name:"周期盘点",pid:43,level:3,isFinal:true,hide:1},
		],
		//MES菜单数据
		[
			{id:54,name:'BOM管理',pid:53,level:1,isFinal:true},
			{id:55,name:'工序管理',pid:53,level:1,isFinal:true},
			{id:56,name:'工艺路线',pid:53,level:1,isFinal:true},
			{id:57,name:'制造服务管理',pid:53,level:1,isFinal:true},
			{id:58,name:'设备信息管理',pid:53,level:1,isFinal:true},
		],	

		//商城菜单数据
		[
		
			{id:47,	name:'商品分类',pid:46,level:1,isFinal:true},	
			{id:48,name:'商品管理',pid:46,level:1,isFinal:true},
			{id:49,name:"支付管理",pid:46,level:1,isFinal:true},
			{id:50,name:"会员管理",pid:46,level:1,isFinal:true},
			{id:51,name:"积分管理",pid:47,level:1,isFinal:true},
			{id:52,name:"售后服务",pid:48,level:1,isFinal:true},
		],
		//OA菜单数据
		[
		
			{id:60,name:'即时信息',pid:59,level:1},
				{id:61,name:'公司同事',pid:60,level:2,isFinal:true,target:"dialog"},
				{id:62,name:'A公司好友',pid:60,level:2,isFinal:true,target:"dialog"},
				{id:63,name:'A公司好友',pid:60,level:2,isFinal:true,target:"dialog"},
				{id:64,name:'A公司好友',pid:60,level:2,isFinal:true,target:"dialog"},
			{id:65,name:'邮件',pid:59,level:1},
				{id:66,name:'已收',pid:65,level:2,isFinal:true,target:"dialog"},
				{id:67,name:'已发',pid:65,level:2,isFinal:true,target:"dialog"},
				{id:68,name:'垃圾箱',pid:65,level:2,isFinal:true,target:"dialog"},
		],
		//设置，即Common模块
		[
			{id:69,name:"用户管理",level:1,url:"/User/&Role&Department&",isFinal:true},
			{id:70,name:"角色管理",level:1,url:"/Role&Company",isFinal:true},
			{id:71,name:"部门管理",level:1,url:"/0/3",isFinal:true},
			{id:72,name:"岗位管理",level:1,url:"/0/4",isFinal:true},
			{id:69,name:"公司管理",level:1,url:"/0/4",isFinal:true},

		]
	];


