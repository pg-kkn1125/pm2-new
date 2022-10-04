"use strict";

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
let users = [];

const declareProtobuf = new Message({
  id: "fixed32",
  // channel: "string",
  nickname: "string",
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

// const player = declareProtobuf.setMessage({
//   id: 1,
//   // channel: "lo1A",
//   type: "player",
//   device: "android",
//   authority: true,
//   avatar: "avatar_info",
//   pox: Math.ceil(Math.random() * 100),
//   poy: Math.ceil(Math.random() * 100),
//   poz: Math.ceil(Math.random() * 100),
//   roy: Math.random() * 10,
//   state: "online",
//   host: window.location.host,
//   timestamp: new Date().getTime(),
// });

// console.log(message);
// const encoded = Message.encode(player).finish();
// console.log(encoded);
// console.log(Message.decode(encoded));
let ws = null;

function handleError() {}
function handleClose() {}

let viewer = false;

function connectOne() {
  viewer = true;
  ws = new WebSocket(`ws://localhost:3000/server?channel=server1A`);
  ws.binaryType = "arraybuffer";
  // setTimeout(() => {
  //   if (ws.readyState === 1) {
  //     // chat test
  //     // ws.send('test data');
  //     ws.send(encoded);
  //   }
  // }, 1000);

  ws.onopen = (e) => {
    el_result.innerHTML = "소켓이 연결되었습니다.";
    el_result.classList.add("active");
  };

  ws.onmessage = (message) => {
    if (typeof message.data === "string") {
      try {
        const json = JSON.parse(message.data);
        console.log("login data /", json);

        const userList = Object.entries(json).map(([k, v]) => v);
        if (userList[0] instanceof Array) {
          users.push(...userList[0]);
        } else {
          const found = userList.find(
            (list) => list.nickname === user.nickname
          );
          if (found) {
            user = found;
          }

          if (json.length < users.length) {
            users = users.filter((us) =>
              Boolean(json.find((js) => js.nickname === us.nickname))
            );
          } else {
            users.push(...userList);
          }
        }
        el_result.innerHTML = message.data;
      } catch (e) {}
    } else {
      const reader = new FileReader();
      try {
        const decoder = new TextDecoder();
        const result = decoder.decode(message.data);
        const jsonparsed = JSON.parse(result);

        users = users.map((user) => {
          if (user.nickname === jsonparsed.nickname) {
            user = jsonparsed;
          }
          return user;
        });

        el_result.innerHTML = result;
        // reader.onload = (result) => {
        //   const decodedData = decoder.decode(result.result);
        //   // console.log(result);
        //   // console.log(decodedData);
        //   el_result.innerHTML = decodedData;
        //   console.log("binary", JSON.parse(decodedData));
        // };
      } catch (e) {}
    }
  };
  ws.onerror = handleError;
  ws.onclose = handleClose;

  loginboard.innerHTML = `<input id="nickname" type="text" placeholder="nickname" /><button onclick="login()">login</button>`;
}

window.onload = () => {
  connectOne();
};
let idx = 0;
let user = Socket.createPlayer(idx);
function login() {
  console.log("nickname : ", nickname.value, "로 로그인");
  ws.send(
    Message.encode(
      declareProtobuf.setMessage(
        Object.assign(user, { nickname: nickname.value })
      )
    ).finish()
  );
  idx++;
  // canvas.classList.remove("disable");
  loginboard.classList.add("disable");
}

window.login = login;

/**
 * 소켓 생성 및 커넥션 구성
 */
const generateConnections = () => {
  for (let i = 1; i <= 75; i++) {
    sockets.set(i, new Socket("server", "server1", "A", HOST, PORT).ws);
  }
};

/**
 * 전체 로그인 테스트 (player 데이터 주입)
 */
const loginAll = () => {
  for (let i = 1; i <= 75; i++) {
    const encodedData = Message.encode(
      declareProtobuf.setMessage(Socket.createPlayer(i))
    ).finish();
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
// window.start = start;
// start();

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

/**
 * 로케이션 및 스테이트 데이터 테스트
 */
// import { users } from "./index";
// import Message from "./model/Protobuf";

/**
 * 키보드 조작
 */
let active = {
  w: false,
  s: false,
  a: false,
  d: false,
};
function handleMove(e) {
  switch (e.key) {
    case "w":
      active.w = true;
      break;
    case "s":
      active.s = true;
      break;
    case "a":
      active.a = true;
      break;
    case "d":
      active.d = true;
      break;
  }
}
function handleStop(e) {
  switch (e.key) {
    case "w":
      active.w = false;
      break;
    case "s":
      active.s = false;
      break;
    case "a":
      active.a = false;
      break;
    case "d":
      active.d = false;
      break;
  }
}
window.addEventListener("keydown", handleMove);
window.addEventListener("keyup", handleStop);

canvas.width = innerWidth;
canvas.height = innerHeight;

// const declareProtobuf = new Message({
//   id: "fixed32",
//   // channel: "string",
//   type: "string",
//   device: "string",
//   authority: "bool",
//   avatar: "string",
//   pox: "float",
//   poy: "float",
//   poz: "float",
//   roy: "float",
//   state: "string",
//   host: "string",
//   timestamp: "fixed64",
// });

window.addEventListener("resize", () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
});

window.addEventListener("blur", () => {
  active.w = false;
  active.s = false;
  active.a = false;
  active.d = false;
});

class User {
  x = 0;
  y = 0;

  constructor(data) {
    Object.entries(data).forEach(([key, value]) => {
      this[key] = value;
    });
  }
}

let position = {
  x: canvas.clientWidth / 2,
  y: canvas.clientHeight / 2,
};

let SPEED = 2;

// const player = declareProtobuf.setMessage({
//   id: 1,
//   // channel: "lo1A",
//   type: "player",
//   device: "android",
//   authority: true,
//   avatar: "avatar_info",
//   pox: Math.ceil(Math.random() * 100),
//   poy: Math.ceil(Math.random() * 100),
//   poz: Math.ceil(Math.random() * 100),
//   roy: Math.random() * 10,
//   state: "online",
//   host: window.location.host,
//   timestamp: new Date().getTime(),
// });
// const encoded = Message.encode(player).finish();

function animate() {
  if (canvas.getContext) {
    // draw
    let ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    if (Object.entries(active).some(([key, value]) => value)) {
      // 위치값 전송
      if (active.w) {
        position.y -= SPEED;
      }
      if (active.s) {
        position.y += SPEED;
      }
      if (active.a) {
        position.x -= SPEED;
      }
      if (active.d) {
        position.x += SPEED;
      }
      // console.log("move");
      ws?.send(
        JSON.stringify(
          Object.assign(user, {
            pox: position.x,
            poy: position.y,
          })
        )
      );
    }

    users.forEach((user) => {
      // console.log(user);
      if (user.type === "player") {
        ctx.fillText(user.nickname, user.pox + 35 / 2, user.poy - 10);
        ctx.textAlign = "center";
        ctx.fillRect(user.pox, user.poy, 35, 35);
      }
    });
  }

  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
