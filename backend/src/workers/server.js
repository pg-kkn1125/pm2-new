// app을 require해야 데이터 업데이트가 공유되는 것으로 판단.
// 데이터 변경을 수행한 파일을 require하지 않으면 공유되지 않음.
const SERVER_NAME = process.env.SERVER_NAME;
const SERVER_COUNT = process.env.SERVER_COUNT;

const Queue3 = require("../queue/queue3");
const Queue2 = require("../queue/queue2");
const { emitter } = require("../util/emitter");
const { app, declareProtobuf } = require("../app");
const { parseChannel } = require("../util/tools");
const Protobuf = require("../model/Protobuf");
const { User } = require("../model/User");
const Channel = require("../model/Channel");
const decoder = new TextDecoder();
const pm2 = require("pm2");

const channel = new Channel();
let user = null;
let deviceID = {
  a: 0,
  b: 0,
  c: 0,
  d: 0,
  e: 0,
};
let userChannel = "a";

const locationQueue = new Queue3();
const stateQueue = new Queue2();
const sockets = new Map();
let wsBox = null;

// for (let i = 1; i <= 50; i++) {
//   console.log(i);
//   stateQueue.enter(
//     JSON.stringify({
//       type: "player",
//       id: i,
//       device: "ios",
//       authority: "host",
//       avatar: "avatar1",
//       pox: 500,
//       poy: 300,
//       poz: 0,
//       roy: 5,
//       state: "login",
//       host: "https://localhost:3000",
//       timestamp: "20220922",
//       nickname: "test" + i,
//       // ...(nickname && { nickname: nickname }),
//     })
//   );
// }

/**
 * histogram
 */

emitter.on(`${SERVER_NAME + SERVER_COUNT}`, (app, ws, data) => {
  const [th, ch] = parseChannel(ws.params.channel);
  userChannel = ch.toLowerCase();

  deviceID[userChannel]++;
  sockets.set(ws, {
    did: String(deviceID[userChannel]),
    ch: userChannel,
    ws: ws,
  });
  wsBox = ws;
  // 앱, 소켓 저장
  channel.initialize(app, ws, sockets.get(ws).ch, sockets.get(ws).did);
  // 유저 데이터 생성
  user = new User(data.type, data);
  user.setApp(app);
  user.setWs(ws);
  user.setDeviceID(sockets.get(ws).did);
  // 유저 데이터 저장
  channel.addUser(user);

  app.publish(
    String(sockets.get(ws).did),
    JSON.stringify(channel.getUserList())
  );
});

emitter.on(
  `${SERVER_NAME + SERVER_COUNT}:message`,
  (app, ws, messageObject, message) => {
    // console.log("message", sockets.get(ws).did);
    console.log("message");
    locationQueue.enter(message);
    const [th, ch] = parseChannel(ws.params.channel);
    Object.assign(sockets.get(ws), {
      ch: ch.toLowerCase(),
    });
    console.log(sockets);
    user = Object.assign(new User(messageObject.type, messageObject), {
      pox: messageObject.pox,
      poy: messageObject.poy,
      poz: messageObject.poz,
      roj: messageObject.roj,
    });
    //  new User(messageObject.type, messageObject);
    user.setApp(app);
    user.setWs(ws);

    // channel.deleteOrigin(sockets.get(ws).did);
    // channel.initialize(app, ws, ch.toLowerCase(), sockets.get(ws).did);
    channel.changeUser(sockets.get(ws).did, user);

    // Object.assign(players.get(messageObject.deviceID), messageObject);
  }
);

emitter.on(
  `${SERVER_NAME + SERVER_COUNT}:player:insert`,
  (app, ws, decodedData, message) => {
    console.log("login");

    // console.log("insert", sockets.get(ws).did);
    const [th, ch] = parseChannel(ws.params.channel);
    Object.assign(sockets.get(ws), {
      ch: ch.toLowerCase(),
    });
    stateQueue.enter(JSON.stringify(decodedData));
    user = new User(decodedData.type, decodedData);
    user.setApp(app);
    user.setWs(ws);

    // channel.deleteOrigin(sockets.get(ws).did);
    // channel.initialize(app, ws, ch.toLowerCase(), sockets.get(ws).did);
    channel.changeUser(sockets.get(ws).did, user);

    // 로그인 유저 데이터 저장
    // playerList = channel.getUserList();
  }
);

emitter.on(`${SERVER_NAME + SERVER_COUNT}:close`, (ws, code, message) => {
  // unsubscribe 에러 발생 함.
  const [th, ch] = parseChannel(ws.params.channel);
  Object.assign(sockets.get(ws), {
    ch: ch.toLowerCase(),
  });
  channel.closeOrigin(sockets.get(ws).ch, sockets.get(ws).did);

  app.publish(sockets.get(ws).ch, JSON.stringify(channel.getUserList()));
});

const sendLocation = setInterval(() => {
  // console.log(locationQueue.count)
  if (wsBox) {
    for (let i = 1; i <= 50; i++) {
      const jsons = {
        type: "player",
        id: i,
        device: "ios",
        authority: "host",
        avatar: "avatar1",
        pox: 700 * Math.random(),
        poy: 500 * Math.random(),
        poz: 0,
        roy: 5,
        state: "login",
        host: "https://localhost:3000",
        timestamp: "20220922",
        nickname: "test" + i,
        // ...(nickname && { nickname: nickname }),
      };
      locationQueue.enter(new TextEncoder().encode(JSON.stringify(jsons)));
    }
  }
  if (locationQueue.count !== 0) {
    // console.log(sockets.get(wsBox).ch + ":: 로케이션 뿌림");
    // console.log(sockets.get(wsBox).ch);
    // app.publish(sockets.get(wsBox).ch, locationQueue.get(), true, true);
    app.publish(sockets.get(wsBox).ch, locationQueue.get(), true, true);
  }
}, 8);

setTimeout(() => {
  const sendState = setInterval(() => {
    if (stateQueue.count !== 0) {
      // console.log(sockets.get(wsBox).ch);
      // app.publish(sockets.get(wsBox).ch, stateQueue.get());
      app.publish(sockets.get(wsBox).ch, stateQueue.get());
    }
  }, 16);
  setInterval(() => {
    pm2.list((err, list) => {
      if (err) {
        console.log(err);
      }
      list.forEach((li) => {
        if (li.name === "server1") {
          // console.log(li.monit.cpu);
          // console.log(li.monit.memory);
          // console.log(li.pm2_env.status);
        }
      });
    });
  }, 100);
}, 14);

//ping
setInterval(() => {
  app.publish("server", "");
}, 55000);

// pm2 process send a ready sign
process.send("ready");
