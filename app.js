// http协议创建server
// const http = require('http')
// const server = http.createServer((req,res)=>{res.send('******')})
// server.listen(5000,()=>{console.log('服务器通过5000端口运行起来了')})
// const server = http.createServer({port:5000})

const { data } = require('jquery');


// // 先下载ws依赖,然后引入ws
// const Websocket = require("ws");
// // 实例化websocket的server,同时定义端口号,Websocket.creatServer和new Websocket.Server等价
// const wsserver = new Websocket.Server({port:3000});
// // 监听连接
// wsserver.on('connection',function(ws){
// 	// 监听客户端发送过来的信息
// 	ws.on('message',function(message){
// 		console.log('客户端发送来的信息:'+message);
// 		ws.send('服务端接收到信息:'+message+'后再发送一条反馈信息给客户端')
// 	})
// })

const app = require('express')();
const server = require('http').Server(app);
// socket.io实例初始化的时候需要传入一个httpServer对象
const io = require('socket.io')(server);

let users = []//表示用户列表
// 设置静态资源目录为public
app.use(require('express').static('public'))

app.get('/',(req,res)=>{
	// res.sendFile(__dirname+'/index.html')
	res.redirect('/index.html')
})

io.on('connection',socket=>{
	//socket.emit生成当前连接对象的事件,io.emit生成所有连接对象的广播事件
	// 1.监听登录状态
	socket.on('login',function(data){
		// 每次新建用户时都要在users[]中查找是否已存在相同的data,如果已存在就表示不是新用户不能创建角色登录
		let user = users.filter(item=>item.username===data.username)
		// 如果用户存在,登录失败
		if(user.length>0){
			socket.emit('Loginfail',{msg:'登录失败'})
			console.log('登录失败')
		}else{
			users.push(data)
			console.log('登录时的',users);
			socket.emit('LoginSuccess',data)
			// 1)把新增的用户数据传递给前端
			io.emit('addUser',data)
			// 2)把用户列表users传递给前端
			io.emit('userList',users)
			// 把登录成功的用户名和头像存储起来
			socket.username = data.username
			socket.avatar = data.avatar
		}
	})
	// 2.监听离线状态
	socket.on('disconnect',()=>{
		// 1)把离开的用户数据传递给前端
		// 可以把当前用户找出来删除,
		// var idx = users.indexOf(users.filter(item => {item.username===socket.username}))
		
		// users.splice(idx,1)

		// 也可以直接找出不是当前用户的所有人
		
		users = users.filter(item => item.username!=socket.username)
		console.log('登出后的',users);
		io.emit('offUser',{
			username:socket.username,
			avatar:socket.avatar
		})
		// 2)把更新的用户列表users传递给前端
		io.emit('userList',users)
	})
	// 3.监听前端发送的消息
	socket.on('sendMsg',data=>{
		console.log(data);
		// 1)再把消息广播给前端所有用户
		io.emit('receiveMessage',data)
	})
	// 4.监听前端发送的文件
	socket.on('sendFile',data=>{
		console.log(data);
		// 再把文件广播给前端所有用户
		io.emit('receiveFile',data)
	})
})



// server.on('request',(req,res)=>{
// 	fs.readFile(__dirname+'/index.html',function(err,data){
// 		if(err){
// 			res.writeHead(500)
// 			return res.end('error load index.html')
// 		}else{
// 			res.writeHead(200)
// 			res.end(data)
// 		}
// 	})
// })

server.listen(3000,()=>{
	console.log('服务器通过3000端口运行起来了')
})
