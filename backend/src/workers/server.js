// app을 require해야 데이터 업데이트가 공유되는 것으로 판단.
// 데이터 변경을 수행한 파일을 require하지 않으면 공유되지 않음.
const SERVER_NAME = process.env.SERVER_NAME;
const SERVER_COUNT = process.env.SERVER_COUNT;

const Queue3 = require("../queue/queue3");
const { emitter } = require("../util/emitter");
const { app } = require("../app");
const { parseChannel } = require("../util/tools");
const Protobuf = require("../model/Protobuf");
const { User } = require("../model/User");
const Channel = require("../model/Channel");
const decoder = new TextDecoder();

const channel = new Channel();
let user = null;
let deviceID = 0;

/*
for(let i = 0; i < 5000; i++) {
    locationQueue.enter(`{"id":"tewtewt","pox":${i},"poy":${2.213124515},"poz":${1223.241421123123},"rox":${i},"roy":${2.213124515},"roz":${1223.241421123123}}`)
}
*/
// console.log(SERVER_NAME + SERVER_COUNT);
// var uint8array, messageString, messageObject, locationTmp;

const locationQueue = new Queue3();
const sockets = new Map();

emitter.on(`${SERVER_NAME + SERVER_COUNT}`, (app, ws, data) => {
  deviceID++;

  sockets.set(ws, deviceID);
  // console.log("open", sockets.get(ws));
  // testCount++;
  const [th, ch] = parseChannel(ws.params.channel);
  // 앱, 소켓 저장
  channel.initialize(app, ws, ch, sockets.get(ws));
  // 유저 데이터 생성
  user = new User(data.type, data);
  user.setApp(app);
  user.setWs(ws);
  // 유저 데이터 저장
  channel.addUser(user);
});

emitter.on(
  `${SERVER_NAME + SERVER_COUNT}:message`,
  (app, ws, messageString, messageObject) => {
    // console.log("message", sockets.get(ws));
    // stateQueue.enter(messageString);
    const [th, ch] = parseChannel(ws.params.channel);
    locationQueue.enter(messageObject);
    user = new User(messageObject.type, messageObject);
    user.setApp(app);
    user.setWs(ws);

    channel.deleteOrigin(sockets.get(ws));
    channel.initialize(app, ws, ch, sockets.get(ws));
    channel.changeUser(sockets.get(ws), user);
    // Object.assign(players.get(messageObject.deviceID), messageObject);
  }
);

emitter.on(
  `${SERVER_NAME + SERVER_COUNT}:player:insert`,
  (app, ws, decodedData, message) => {
    // console.log("insert", sockets.get(ws));
    const [th, ch] = parseChannel(ws.params.channel);
    locationQueue.enter(message);
    user = new User(decodedData.type, decodedData);
    user.setApp(app);
    user.setWs(ws);

    channel.deleteOrigin(sockets.get(ws));
    channel.initialize(app, ws, ch, sockets.get(ws));
    channel.changeUser(sockets.get(ws), user);
  }
);

emitter.on(`${SERVER_NAME + SERVER_COUNT}:close`, (ws, code, message) => {
  channel.closeOrigin(sockets.get(ws));
});

const sendLocation = setInterval(() => {
  // console.log(locationQueue.count)
  if (locationQueue.count !== 0) {
    // console.log("로케이션 뿌림");
    app.publish("server", locationQueue.get(), true, true);
  }
}, 8);

/*
setTimeout(() => {
    const sendState = setInterval(() => {
        app.publish('server', stateQueue.get())
    }, 16)
}, 14)
*/

//ping
setInterval(() => {
  app.publish("server", "");
}, 55000);

// pm2 process send a ready sign
process.send("ready");
