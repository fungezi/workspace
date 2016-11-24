var http = require("http");//用来创建服务器

var fs = require("fs");//读写文件操作

var path = require("path");//提供文件路径相关功能

//上面的都是node内置的模块

//下面这个需要自己去安装 npm install mime
var mime = require("mime");//可以根据文件扩展名得出文件的类型

var cache = {};//缓存最近的数据


//设置聊天模块
var chatServer = require("./lib/chat_server");




function send404(response){
	response.writeHead(404,{"Content-Type":"text/plain"});
	response.write("Error 404: resource not found.");
	response.end();
}

function sendFile(response,filePath,fileContents){
	response.writeHead(
		200,
		{"Content-Type":mime.lookup(path.basename(filePath))}
	);
	response.end(fileContents);
}
function serverStatic(response,cache,absPath){
	if(cache[absPath]){//若是有缓存就从缓存读取，否则就读取文件里的数据
		sendFile(response,absPath,cache[absPath]);
	}else{
		fs.exists(absPath,function(exists){
			if(exists){
				fs.readFile(absPath,function(err,data){
					if(err){
						send404(response);
					}else{
						cache[absPath] = data;
						sendFile(response,absPath,data);
					}
				})
			}else{
				send404(response);
			}
		})
	}
}

var server = http.createServer(function(request,response){

	var filePath = false;

	if(request.url == "/"){
		filePath = "public/index.html";
	}else{
		filePath = "public" + request.url;
	}

	var absPath = "./" + filePath;
	serverStatic(response,cache,absPath);
});

chat_server.listen(server);

//启动服务器
server.listen(8000,function(){
	console.log("Server listening on port 8000");
})