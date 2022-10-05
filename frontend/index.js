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
let TEST_COUNT = 250;

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

function connectOne(i) {
  viewer = true;
  const parameters = location.search
    .slice(1)
    .split("&")
    .filter((p) => p)
    .map((p) => p.split("="));
  const params = Object.fromEntries(parameters);
  ws = new WebSocket(`ws://localhost:3000/server?channel=server1${params.ch}`);
  sockets.set(i || 0, ws);
  sockets.get(i || 0).binaryType = "arraybuffer";
  // setTimeout(() => {
  //   if (ws.readyState === 1) {
  //     // chat test
  //     // ws.send('test data');
  //     ws.send(encoded);
  //   }
  // }, 1000);

  sockets.get(i || 0).onopen = (e) => {
    el_result.innerHTML = "소켓이 연결되었습니다.";
    el_result.classList.add("active");
  };

  sockets.get(i || 0).onmessage = (message) => {
    if (typeof message.data === "string") {
      try {
        const json = JSON.parse(message.data);
        console.log("login data /", json);

        const userList = Object.entries(json).map(([k, v]) => v);
        if (userList[0] instanceof Array) {
          users.push(...userList[0]);
        } else {
          const found = userList.map((list) =>
            list.nickname === user.nickname ? Object.assign(list, user) : list
          );
          // if (found) {
          //   user = found;
          // }

          if (json.length < users.length) {
            users = users.filter((us) =>
              Boolean(json.find((js) => js.nickname === us.nickname))
            );
          } else {
            users.push(...userList);
          }
        }
        // el_result.innerHTML = message.data;
      } catch (e) {
        // console.log(e)
      }
    } else {
      try {
        if (message.data instanceof Blob) {
          const reader = new FileReader();
          reader.onload = (result) => {
            const decodedData = decoder.decode(result.result);
            // console.log(result);
            // console.log(decodedData);
            el_result.innerHTML = decodedData;
            console.log("binary", JSON.parse(decodedData));
          };
        } else {
          const decoder = new TextDecoder();
          const result = decoder.decode(message.data);
          // console.log(result.match(/\}/));

          if (result.match(/\}/) && result.split(/\}/).length > 1) {
            const multiline = result
              .split(/\}/)
              .filter((re) => re)
              .map((re) => JSON.parse(re + "}"));

            users = multiline;
            // console.log(users)
          } else {
            const jsonparsed = JSON.parse(result);
            users = users.map((user) => {
              if (user.id === 0) {
                if (user.nickname === jsonparsed.nickname) {
                  user = jsonparsed;
                }
              } else {
                if (user.id === jsonparsed.id) {
                  user = jsonparsed;
                }
              }
              return user;
            });
          }
        }

        // el_result.innerHTML = result;
      } catch (e) {
        console.log(e);
      }
    }
  };
  sockets.get(i || 0).onerror = handleError;
  sockets.get(i || 0).onclose = handleClose;
  if (i >= 1) {
  } else {
    loginboard.innerHTML = `<input id="nickname" type="text" placeholder="nickname" /><button onclick="login()">login</button>`;
  }
}

window.addEventListener("load", () => {
  connectOne();
  window.login = login;
});
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

/**
 * 소켓 생성 및 커넥션 구성
 */
const generateConnections = () => {
  for (let i = 1; i <= TEST_COUNT; i++) {
    // sockets.set(i, new Socket("server", "server1", "A", HOST, PORT).ws);
    connectOne(i);
  }
};

/**
 * 전체 로그인 테스트 (player 데이터 주입)
 */
const loginAll = () => {
  for (let i = 1; i <= TEST_COUNT; i++) {
    const player = Socket.createPlayer(i);
    // users.push(player);
    const encodedData = Message.encode(
      declareProtobuf.setMessage(player)
    ).finish();
    const socket = sockets.get(i);
    try {
      socket.send(encodedData);
    } catch (e) {
      // let loop = setInterval(() => {
      //   if (socket.readyState === 1) {
      //     socket.send(encodedData);
      //     clearInterval(loop);
      //   }
      // }, 16);
    }
  }
};

function start(i) {
  generateConnections();
  // 이후 로그인 시도
  setTimeout(() => {
    loginAll();
    // 로케이션 데이터 전송 테스트
    // setTimeout(() => {
    //   locationFunction();
    // }, 3000);
    let itv = 0;
    console.log(users);
    setTimeout(() => {
      setInterval(() => {
        if (itv % 74 === 0) itv = 0;
        sockets.get(itv + 1)?.send(
          JSON.stringify(
            Object.assign(users[itv], {
              pox: position.x * Math.random() * 2,
              poy: position.y * Math.random() * 2,
            })
          )
        );
        itv++;
      }, 8);
    }, 1000);
  }, 20000);
}
window.start = start;
// start();
window.addEventListener("load", () => {
  // start()
});

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
      ws?.send?.(
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
        if (user.nickname === "234234") {
          console.log("있음");
        } else {
          console.log("없음");
        }
        ctx.fillText(user.nickname, user.pox + 35 / 2, user.poy - 10);
        ctx.textAlign = "center";
        ctx.fillRect(user.pox, user.poy, 35, 35);
      }
    });
  }

  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

export default users;
