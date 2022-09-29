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
  loginAll();
  setTimeout(() => {
    locationFunction();
  }, 3000);
}, 3000);

// function viewerFunction(i) {
//   const viewerData = {
//     type: "viewer",
//     device: `android${i}`,
//     host: "https://location.com",
//     timestamp: "20220921",
//   };
//   sockets.get(i).getSocket().send(JSON.stringify(viewerData));
// }

// function playFunction(i) {
//   const playerData = {
//     type: "player",
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
//     timestamp: "20220922",
//   };
//   sockets.get(i).getSocket().send(JSON.stringify(playerData));
// }

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

// (async function example() {
//   // let driver = await new Builder().forBrowser("chrome").build();
//   try {
//     for (let i = 1; i < 51; i++) {
//       sockets.set(
//         i,
//         new Socket("server", "lo1", i % 2 === 0 ? "A" : "B").connect(HOST, PORT)
//       );
//       await sockets.get(i).getSocket();
//       sockets.get(i).binaryType = "arraybuffer";
//       sockets.get(i).onOpen((ws) => viewerFunction(i));
//       viewerArray.push(i);
//     }
//   } catch (err) {
//     console.log(err, 2);
//   } finally {
//     sockets.get(50).onMessage((message) => {
//       console.log(message.data);
//       if (isPlayerSend === false) {
//         if (typeof message.data === "string") {
//           let newData = JSON.parse(message.data);
//           if (Object.values(newData)[0] !== undefined) {
//             var newType = Object.values(newData)[0];
//             if (newType.deviceID === 51) {
//               for (let i = 1; i < 51; i++) {
//                 playFunction(i);
//                 isPlayerSend = true;
//               }
//             } else {
//               return;
//             }
//           }
//         } else {
//           //console.log("good");
//         }
//       }
//     });
//     setTimeout(() => {
//       locationFunction();
//     }, 4000);
//   }
// });
