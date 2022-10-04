// app을 require해야 데이터 업데이트가 공유되는 것으로 판단.
// 데이터 변경을 수행한 파일을 require하지 않으면 공유되지 않음.
const SERVER_NAME = process.env.SERVER_NAME;
const SERVER_COUNT = process.env.SERVER_COUNT;

const Queue3 = require("../queue/queue3");
const Queue2 = require("../queue/queue2");
const { emitter } = require("../util/emitter");
const { app } = require("../app");
const { parseChannel } = require("../util/tools");
const Protobuf = require("../model/Protobuf");
const { User } = require("../model/User");
const Channel = require("../model/Channel");
const decoder = new TextDecoder();

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
// let playerList = [];

/*
for(let i = 0; i < 5000; i++) {
    locationQueue.enter(`{"id":"tewtewt","pox":${i},"poy":${2.213124515},"poz":${1223.241421123123},"rox":${i},"roy":${2.213124515},"roz":${1223.241421123123}}`)
}
*/
// console.log(SERVER_NAME + SERVER_COUNT);
// var uint8array, messageString, messageObject, locationTmp;

const locationQueue = new Queue3();
const stateQueue = new Queue2();
const sockets = new Map();

emitter.on(`${SERVER_NAME + SERVER_COUNT}`, (app, ws, data) => {
  // console.log("open", sockets.get(ws));
  // testCount++;
  const [th, ch] = parseChannel(ws.params.channel);
  userChannel = ch.toLowerCase();

  deviceID[userChannel]++;
  sockets.set(ws, String(deviceID[userChannel]));
  // 앱, 소켓 저장
  channel.initialize(app, ws, userChannel, sockets.get(ws));
  // 유저 데이터 생성
  user = new User(data.type, data);
  user.setApp(app);
  user.setWs(ws);
  // 유저 데이터 저장
  channel.addUser(user);

  app.publish(String(sockets.get(ws)), JSON.stringify(channel.getUserList()));
});

emitter.on(
  `${SERVER_NAME + SERVER_COUNT}:message`,
  (app, ws, messageObject, message) => {
    // console.log("message", sockets.get(ws));
    // console.log("message");
    locationQueue.enter(message);
    const [th, ch] = parseChannel(ws.params.channel);

    user = Object.assign(new User(messageObject.type, messageObject), {
      pox: messageObject.pox,
      poy: messageObject.poy,
      poz: messageObject.poz,
      roj: messageObject.roj,
    });
    //  new User(messageObject.type, messageObject);
    user.setApp(app);
    user.setWs(ws);

    // channel.deleteOrigin(sockets.get(ws));
    // channel.initialize(app, ws, ch.toLowerCase(), sockets.get(ws));
    channel.changeUser(sockets.get(ws), user);

    // Object.assign(players.get(messageObject.deviceID), messageObject);
  }
);

emitter.on(
  `${SERVER_NAME + SERVER_COUNT}:player:insert`,
  (app, ws, decodedData, message) => {
    console.log("login");

    // console.log("insert", sockets.get(ws));
    const [th, ch] = parseChannel(ws.params.channel);

    stateQueue.enter(JSON.stringify(decodedData));
    user = new User(decodedData.type, decodedData);
    user.setApp(app);
    user.setWs(ws);

    // channel.deleteOrigin(sockets.get(ws));
    // channel.initialize(app, ws, ch.toLowerCase(), sockets.get(ws));
    channel.changeUser(sockets.get(ws), user);

    // 로그인 유저 데이터 저장
    // playerList = channel.getUserList();
  }
);

emitter.on(`${SERVER_NAME + SERVER_COUNT}:close`, (ws, code, message) => {
  // unsubscribe 에러 발생 함.
  const [th, ch] = parseChannel(ws.params.channel);
  userChannel = ch.toLowerCase();
  channel.closeOrigin(userChannel, sockets.get(ws));

  app.publish(String("server"), JSON.stringify(channel.getUserList()));
});

const sendLocation = setInterval(() => {
  // console.log(locationQueue.count)
  if (locationQueue.count !== 0) {
    // console.log("로케이션 뿌림");
    app.publish("server", locationQueue.get(), true, true);
  }
}, 8);

setTimeout(() => {
  const sendState = setInterval(() => {
    if (stateQueue.count !== 0) {
      app.publish("server", stateQueue.get());
    }
  }, 16);
}, 14);

//ping
setInterval(() => {
  app.publish("server", "");
}, 55000);

// pm2 process send a ready sign
process.send("ready");
