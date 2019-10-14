//引入socket.io
const socketio = require("socket.io");
//引入http 构建服务器
const http = require("http");

//构建服务器;
const app = http.createServer();

//得到基于ws构建的服务器
const io = socketio(app);

//创建用户数组
let needData = {};
let getVoice = false
//监听事件
io.on("connection", socket => {
  console.log("连接成功");


  socket.on("sendOffer", data => {
    console.log("sendOffer");
    needData.offer = data
    // io.sockets.emit("Offer", data);
  });

  socket.on("sendAnswer", data => {
    console.log("sendAnswer");
    needData.answer = data
    io.sockets.emit("Answer", data);
  });

  socket.on("sendCandidate", data => {
    console.log(data.id);
    if (data.id == "get") {
      console.log("接收端发出ice");
      io.sockets.emit("sendcandidate", data.data)
    } else {
      needData.sendCandidate = data.data
    }
    // io.sockets.emit("candidate", data)
  })

  socket.on("getdata", () => {
    console.log("已经发出数据")
    io.sockets.emit("Offer", needData.offer);
    io.sockets.emit("candidate", needData.sendCandidate)
  })


  socket.on("issend",data=>{
    console.log(data)
  })

  console.log(getVoice)

  socket.on("sendData", data => {
    console.log(data)
    getVoice = data
  })

  socket.on("sendStream", data => {
    if (getVoice) {
      console.log(data)
      socket.emit("returnStream", data)
    } else {
      return null;
    }


  })


});

//端口
app.listen(4567);
console.log("服务器: ws://127.0.0.1:4567");
