// app을 require해야 데이터 업데이트가 공유되는 것으로 판단.
// 데이터 변경을 수행한 파일을 require하지 않으면 공유되지 않음.

let testCount = 0;

const Queue3 = require("../queue/queue3.js");
const { emitter } = require("./db");
const { app } = require("../app.js");
const { parseChannel } = require("../util/tools.js");
const Protobuf = require("../model/Protobuf.js");
const decoder = new TextDecoder();

/*
for(let i = 0; i < 5000; i++) {
    locationQueue.enter(`{"id":"tewtewt","pox":${i},"poy":${2.213124515},"poz":${1223.241421123123},"rox":${i},"roy":${2.213124515},"roz":${1223.241421123123}}`)
}
*/

// var uint8array, messageString, messageObject, locationTmp;

const locationQueue = new Queue3();
const sockets = new Map();
const viewers = new Map();
const players = new Map();

const USER_LIMIT_AMOUNT = 25;

let deviceIDCH_1 = 0;
let deviceIDCH_2 = 0;

emitter.on("lo1", (app, ws, data) => {
  const [th, ch] = parseChannel(ws.params.channel);
  if (data.channel === "A") {
    deviceIDCH_1++;
    initialSetupViewer(app, ws, data, ch + deviceIDCH_1);
  } else if (data.channel === "B") {
    deviceIDCH_2++;
    initialSetupViewer(app, ws, data, ch + deviceIDCH_2);
  } else {
  }
  console.log(`CH_1`, deviceIDCH_1, "viewer");
  console.log(`CH_2`, deviceIDCH_2, "viewer");
});

function initialSetupViewer(app, ws, data, deviceID) {
  const messageObject = { type: "viewer" };
  sockets.set(ws, deviceID);
  ws.subscribe(String(deviceID));
  ws.subscribe("server");
  ws.send(JSON.stringify(data));
  // 전체 클라이언트 응답
  app.publish(
    "server",
    JSON.stringify(Object.assign(data, { from: "server" }))
  );
  viewers.set(
    sockets.get(ws),
    Object.assign(messageObject, { deviceID: sockets.get(ws) })
  );

  app.publish(
    String(sockets.get(ws)),
    JSON.stringify(new Array(viewers.get(sockets.get(ws))))
  );
  if (players.size > 0)
    app.publish("server", JSON.stringify(Object.fromEntries(players)));

  console.log("deviceID: " + messageObject.deviceID + " has joined!");
  console.log(
    "current connect players: " +
      players.size +
      " / current connect viewers: " +
      viewers.size
  );
}

emitter.on("lo1:message", (app, ws, messageString, messageObject) => {
  stateQueue.enter(messageString);
  Object.assign(players.get(messageObject.deviceID), messageObject);
});

emitter.on("lo1:player:insert", (app, ws, decodedData, message) => {
  locationQueue.enter(message);
  if (players.has(decodedData.id)) {
    Object.assign(players.get(decodedData.id), {
      pox: decodedData.pox,
      poy: decodedData.poy,
      poz: decodedData.poz,
      //rox: messageObject.rox,
      roy: decodedData.roy,
      //roz: messageObject.roz,
      //row: messageObject.row,
    });
  } else {
    // player 등록
    players.set(
      sockets.get(ws),
      Object.assign(decodedData, { deviceID: sockets.get(ws) })
    );
    // viewer 제거
    viewers.delete(sockets.get(ws));
    // viewer 구독 해제
    ws.unsubscribe(String(sockets.get(ws)));
    // player 구독
    ws.subscribe(String(sockets.get(ws)));
    // 전체 서버 사용자에 player 데이터 전송
    app.publish("server", JSON.stringify(Object.fromEntries(players)));
    console.log(
      "deviceID: " +
        decodedData.deviceID +
        " has logined! to " +
        decodedData.id +
        "!!"
    );
    console.log(
      "current connect players: " +
        players.size +
        " / current connect viewers: " +
        viewers.size
    );
  }
});

emitter.on("close", (ws, code, message) => {
  if (viewers.has(sockets.get(ws))) viewers.delete(sockets.get(ws));

  if (players.has(sockets.get(ws))) {
    players.delete(sockets.get(ws));
    app.publish("server", JSON.stringify(Object.fromEntries(players)));
  }

  console.log(sockets.get(ws) + " exited!");
  sockets.delete(ws);
  console.log(
    "current connect players: " +
      players.size +
      " / current connect viewers: " +
      viewers.size
  );
});

const sendLocation = setInterval(() => {
  // console.log(locationQueue.count)
  if (locationQueue.count !== 0) {
    testCount++;
    console.log(testCount);
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
