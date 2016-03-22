目录结构说明 

    module   →  各模块界面
    content  →  各模块的css
    images   →  各模块图片
    script   →  各模块js及各种js插件包


	modules		//所有页面，包括各页面的模板html
	|
        |--account      //账户模块
	|
        |--comment  	//点评模块
	|
        |--commom	//公用的模块
	|
	|--my		//我的 模块
	|
	|--index	//首页模块
	|
	|--works	//作品模块
	|
	Content		//所有的css
        |
        |--bootstrap    //bootstrap的css
	|
        |--common       //公用的css
	|
        |--fonts        //字体图标的css
	|
	|--mui		//mui的css
	|
	|
	images		//所用到的所有图片
	|
        |--account      //account模块的图片
	|
	|
	|--comment	//点评模块的的图片
	|
        |--common       //公用的图片
	|
	|--index 	//首页模块的图片
	|
	|--my		//我的 模块的图片
	|
	|--works	//作品模块的图片
	|
	|
	script          //用到的所有js文件
	|
	|--account      //Account模块的js
	|
	|--common	//公用的js
	|
	|--comment	//点评模块的js
	|
	|--my		//我的 模块的js
	|
	|--index	//首页模块的js
	|
	|--works	//作品模块的js	
	|
	|--mui		//mui的js	
	|
	|--libs         //用到的js插件,非外部插件不放这里	
            |
            |--bootstrap//bootstrap类库，3.3.5
   	    |	                      
	    |--bootstrap-hover-dropdown //鼠标移上自动下拉          
	    |
            |--jquery   //jquery框架，1.11.3
            |
            |--knockout  //knockout库，3.3.0
            |
            |--mobiscroll//日期插件js
            |
            |--require   //require库，2.1.20
            	|
           	|--require-css  //require-css库，0.1.2
           	|
          	|--require-text //require-text库，2.0.12
           	|
            |--sammy     //sammy库，0.7.6
            |
            |
	|
	|--main.js      //require的main文件
        |
        |
	index.html		//首页
	|
	|
	Readme.txt		//项目说明文件


	
	
							     
    注意  sui的在线包名跟离线（本地）包名名字不一致，导入要注意
	  -------------------------------------------------------
