// RTCPeerConnection：核心对象，每一个连接对象都需要新建该对象

// SDP(Session Description Protocol，会话描述协议)：包含建立连接的一些必要信息，比如IP地址等，sdp由RTCPeerConnection对象方法创建，我们目前不需要知道该对象中的具体内容，使用黑盒传输即可
// ICE(Interactive Connectivity Establishment，交互式连接建立技术)：用户之间建立连接的方式，用来选取用户之间最佳的连接方式

// WebRTC 的底层传输原理是UDP 只负责传输不保证安全性与可靠性
//获取流 ： getUserMedia ：有3个参数，对获取流的配置（分辨率，帧数，摄像头，视轨， 音轨） ， 成功的回调参数（即数据流） ， 失败的回调参数（带错误信息）

// 音视频通道 ： RTCPeerConnection 作用： 提供创建，保持，监控，关闭 ( 视频/音频 ) 避免出现NAT阻塞连接，就需要利用ICE来创建交互式连接，一般是使用STUN协议（打孔）：作用是允许客户端对IP支持，仅仅在连接时使用，创建连接后，直接时客户端之间的流动，如果STUN无法使用会使用TURN的中继服务器

// 信道 :RTCDataChannel（ 其他数据格式）  传输原理： SCTP 协议  依赖在两端建立的DTLS信道运行



//webRTC的传输协议：
//安全实时传输协议(SRTP，Secure Real-time Transport Protocol) 通过 IP 网络交付音频和视频等实时数据的标准安全格式。
//安全实时控制传输协议(SRTCP，Secure Real-time Control Transport Protocol) 通过 SRTP 流交付发送和接收方统计及控制信息的安全控制协议。

//发出端

//确认浏览支持的编码方式 视频 vp8 vp9 h264 音频opus

function createConnection(el, constraints) {  //el：video标签  constraints：对视频流的配置参数
    navigator.mediaDevices.getUserMedia(constraints)
        .then(handleSuccess)
        .catch(handleError)
}


function handleSuccess(stream) { //stream 利用getusermedia获取的视频流
    var iceServer = {
        "iceServers": [{
            "url": "stun:stun.l.google.com:19302"
        }]
    };  //公共的stun代理
    var localConnection  //本地连接
    let localVidea = document.querySelector("#" + el)  //本地的videa标签
    localVidea.srcObject = stream                    // 把本地的视频流传输给本地的videa标签播放

    localConnection = new RTCPeerConnection(iceServer)   //用于允许对象在不同浏览器通讯
    localConnection.addStream(stream)   //把本地的流添加进传输列表
    localConnection.onaddstream = function (e) { //监听是否有流传进来
        console.log("对方发出的流", e.stream)
    }
    localConnection.onicecandidate = function (e) {   //寻找合适的ICE （交互连接）
        if (e.candidate) {
            sendCandidate(e.candidate)
            // that.socket.send(JSON.stringify({
            //     "eventName": "__ice_candidate",
            //     "data": {
            //         "label": e.candidate.sdpMLineIndex,
            //         "candidate": e.candidate.candidate,
            //         "socketId": socketId
            //     }
            // }));
            // that.emit("pc_get_ice_candidate", e.candidate, socketId, localConnection);
        }
    }
    location.createOffer().then(offer=>{   //即SDP 数据
        localConnection.setLocalDescription(offer)
        .then(sendOffer)
    })

}
function handleError(err){  //报错信息
    console.log(err)
}
//接受端
function getStream(el){
    var video = document.querySelector("#"+el)
    remoteConnection = new RTCPeerConnection()
    remoteConnection.onaddstream = function (e) { //监听是否有流传进来
        console.log("对方发出的流", e.stream)
    }
    remoteConnection.onicecandidate=function(event){
        if(event.candidate){
            sendCandidate(event.candidate)
        }
    }
}
//发出通知
function sendOffer(offer){
    socket.emit('sendOffer', offer)
    console.log('offer 已发出')
}
//发出回复
function sendAnswer(answer){
    socket.emit('sendAnswer', answer)
    console.log('answer 已发出')
}
//发出ice信息
function sendIce(ice){
    socket.emit('sendIce', ice)
    console.log('ice 已发出')
}