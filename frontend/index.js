// import Socket from "./model/Socket.js";
import protobuf from "protobufjs";
import Socket from "./model/Socket";

const viewerArray = [];
let playerArray = [0];
var good = false;
var isPlayerSend = false;
let value;

var Type = protobuf.Type,
  Field = protobuf.Field;

let self;
function ProtoBuf(properties) {
  // protobuf.Message.call(this, properties);
  protobuf.Message.call(this, properties);
}
(ProtoBuf.prototype = Object.create(protobuf.Message)).constructor = ProtoBuf;

//Field.d(1, "fixed32", "required")(ProtoBuf.prototype, "id")
//Field.d(2, "bytes", "required")(ProtoBuf.prototype, "pos")
//Field.d(3, "sfixed32", "required")(ProtoBuf.prototype, "angle")
Field.d(1, "fixed32", "required")(ProtoBuf.prototype, "id");
Field.d(2, "float", "required")(ProtoBuf.prototype, "pox");
Field.d(3, "float", "required")(ProtoBuf.prototype, "poy");
Field.d(4, "float", "required")(ProtoBuf.prototype, "poz");
Field.d(5, "sfixed32", "required")(ProtoBuf.prototype, "roy");

const HOST = "localhost";
const PORT = 3000;
const sockets = new Map();

const generateConnections = () => {
  for (let i = 0; i < 50; i++) {
    sockets.set(
      i,
      new Socket("server", "lo1", i % 2 === 0 ? "A" : "B").connect(HOST, PORT)
    );
  }
};

const loginAll = () => {
  for (let i = 0; i < sockets.size; i++) {
    const socket = sockets.get(i);
    try {
      Socket.emit(socket, Socket.createPlayer(i));
    } catch (e) {
      let loop = setInterval(() => {
        if (socket.readyState === 1) {
          Socket.emit(socket, Socket.createPlayer(i));
          clearInterval(loop);
        }
      }, 16);
    }
  }
};

generateConnections();
// 이후 로그인 시도
setTimeout(() => {
  // loginAll();
  // 로케이션 데이터 전송 테스트
  // setTimeout(() => {
  //   locationFunction();
  // }, 3000);
}, 3000);

function promiseGet(socket) {
  return new Promise((resolve, reject) => {
    if (socket.readyState === 1) {
      resolve(socket);
    }
  });
}

function locationFunction() {
  setInterval(() => {
    for (let i = 0; i < 50; i++) {
      const pack = new ProtoBuf({
        id: i,
        pox: Math.floor(Math.random() * 1000) / 100,
        poy: 0,
        poz: Math.floor(Math.random() * 1000) / 100,
        roy: 0,
      });
      value = ProtoBuf.encode(pack).finish();
      promiseGet(sockets.get(i)).then((ws) => {
        try {
          ws.send(value);
        } catch (error) {
          if (error instanceof Error) {
            // possibly still 'CONNECTING'
            if (ws.readyState !== 1) {
              var waitSend = setInterval(ws.send(value), 1000);
            }
          }
        }
      });
    }
  }, 16);
}

setTimeout(() => {
  // locationFunction();
}, 3000);

form.innerHTML = `
  <input type="text" name="" id="id" />
  <input type="password" name="" id="pw" />
  <button id="login" onclick="login()">login</button>
`;

function login() {
  {
    
    id: id.value;
    pw: pw.value;
  }
}
