// Option 1: Import the entire three.js core library.
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { users } from "./index";
import Message from "./model/Protobuf";

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

    if (Object.entries(active).some((dir) => dir)) {
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
    }

    users.forEach((user) => {
      ctx.fillRect(user.x, user.y, 35, 35);
    });
  }

  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
