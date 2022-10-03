// import Socket from "./model/Socket.js";
import protobuf from "protobufjs";
import Message from "./model/Protobuf";
import Socket from "./model/Socket";
import Channel from "./model/Channel";

const viewerArray = [];
let playerArray = [0];
var good = false;
var isPlayerSend = false;
let value;

const HOST = "localhost";
const PORT = 3000;
const sockets = new Map();

const declareProtobuf = new Message({
  id: "fixed32",
  // channel: "string",
  type: "string",
  device: "string",
  authority: "bool",
  avatar: "string",
  pox: "float",
  poy: "float",
  poz: "float",
  roy: "float",
  state: "string",
  host: "string",
  timestamp: "fixed64",
});

const player = declareProtobuf.setMessage({
  id: 1,
  // channel: "lo1A",
  type: "player",
  device: "android",
  authority: true,
  avatar: "avatar_info",
  pox: Math.ceil(Math.random() * 100),
  poy: Math.ceil(Math.random() * 100),
  poz: Math.ceil(Math.random() * 100),
  roy: Math.random() * 10,
  state: "online",
  host: window.location.host,
  timestamp: new Date().getTime(),
});

// console.log(message);
const encoded = Message.encode(player).finish();
// console.log(encoded);
// console.log(Message.decode(encoded));

function connectOne() {
  const ws = new Socket("server", "server1", "A", HOST, PORT).ws;
  setTimeout(() => {
    if (ws.readyState === 1) {
      // chat test
      // ws.send('test data');
      ws.send(encoded);
    }
  }, 1000);
}
window.connectOne = connectOne;

/**
 * 소켓 생성 및 커넥션 구성
 */
const generateConnections = () => {
  for (let i = 0; i < 75; i++) {
    sockets.set(i, new Socket("server", "server1", "A", HOST, PORT).ws);
  }
};

/**
 * 전체 로그인 테스트 (player 데이터 주입)
 */
const loginAll = () => {
  for (let i = 0; i < 75; i++) {
    const encodedData = Message.encode(Socket.createPlayer(i)).finish();
    const socket = sockets.get(i);
    try {
      socket.send(encodedData);
    } catch (e) {
      let loop = setInterval(() => {
        if (socket.readyState === 1) {
          socket.send(encodedData);
          clearInterval(loop);
        }
      }, 16);
    }
  }
};

function start() {
  generateConnections();
  // 이후 로그인 시도
  setTimeout(() => {
    loginAll();
    // 로케이션 데이터 전송 테스트
    // setTimeout(() => {
    //   locationFunction();
    // }, 3000);
  }, 10000);
}
window.start = start;
// function viewerFunction(i) {
//   const viewerData = {
//     type: "viewer",
//     device: `android${i}`,
//     host: "https://location.com",
//     timestamp: new Date().getTime(),
//   };
//   sockets.get(i).getSocket().send(JSON.stringify(viewerData));
// }

// function playFunction(i) {
//   const playerData = {
//     type: "player",
//     // channel: `lo1A`,
//     id: `${i}`,
//     device: "ios",
//     authority: "host",
//     avatar: "avatar1",
//     pox: Math.floor(Math.random() * 1000) / 100,
//     poy: 0,
//     poz: Math.floor(Math.random() * 1000) / 100,
//     roy: 5,
//     state: "login",
//     host: "https://localhost:3000",
//     timestamp: new Date().getTime(),
//   };
//   sockets.get(i).getSocket().send(JSON.stringify(playerData));
// }

// function promiseGet(socket) {
//   return new Promise((resolve, reject) => {
//     if (socket.readyState === 1) {
//       resolve(socket);
//     }
//   });
// }

function locationFunction() {
  setInterval(() => {
    for (let i = 0; i < 50; i++) {
      const pack = new protobuf.Message({
        id: i,
        pox: Math.floor(Math.random() * 1000) / 100,
        poy: 0,
        poz: Math.floor(Math.random() * 1000) / 100,
        roy: 0,
      });
      value = protobuf.Message.encode(pack).finish();
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
