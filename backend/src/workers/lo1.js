// app을 require해야 데이터 업데이트가 공유되는 것으로 판단.
// 데이터 변경을 수행한 파일을 require하지 않으면 공유되지 않음.

const Queue3 = require("../queue/queue3.js");
const { emitter } = require("./db");
// ---------- protobuf js ------------
const protobuf = require("protobufjs");
const { app } = require("../server.js");
var Type = protobuf.Type,
  Field = protobuf.Field;
function ProtoBuf(properties) {
  protobuf.Message.call(this, properties);
}
(ProtoBuf.prototype = Object.create(protobuf.Message)).constructor = ProtoBuf;
const decoder = new TextDecoder();

//Field.d(1, "fixed32", "required")(ProtoBuf.prototype, "id")
//Field.d(2, "bytes", "required")(ProtoBuf.prototype, "pos")
//Field.d(3, "sfixed32", "required")(ProtoBuf.prototype, "angle")
Field.d(1, "fixed32", "required")(ProtoBuf.prototype, "id");
Field.d(2, "float", "required")(ProtoBuf.prototype, "pox");
Field.d(3, "float", "required")(ProtoBuf.prototype, "poy");
Field.d(4, "float", "required")(ProtoBuf.prototype, "poz");
Field.d(5, "sfixed32", "required")(ProtoBuf.prototype, "roy");
/*
for(let i = 0; i < 5000; i++) {
    locationQueue.enter(`{"id":"tewtewt","pox":${i},"poy":${2.213124515},"poz":${1223.241421123123},"rox":${i},"roy":${2.213124515},"roz":${1223.241421123123}}`)
}
*/

var uint8array, messageString, messageObject, locationTmp;

const locationQueue = new Queue3();
const sockets = new Map();
const viewers = new Map();
const players = new Map();

let deviceIDCH_1 = 0;
let deviceIDCH_2 = 0;

emitter.on("lo1", (app, ws, data) => {
  // console.log("app", app);
  // console.log("ws", ws);
  // console.log("data", data);
  if (data.channel === "A") {
    deviceIDCH_1++;
    initialSetupViewer(app, ws, data, deviceIDCH_1);
  } else if (data.channel === "B") {
    deviceIDCH_2++;
    initialSetupViewer(app, ws, data, deviceIDCH_2);
  } else {
    //
  }
  console.log(`CH_1`, deviceIDCH_1);
  console.log(`CH_2`, deviceIDCH_2);

  // 클라이언트 단일 응답
});

function initialSetupViewer(app, ws, data, deviceID) {
  const messageObject = { type: "viewer" };
  sockets.set(ws, deviceIDCH_1);
  ws.subscribe(String(deviceIDCH_1));
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

  //clients.get(deviceID).send(JSON.stringify(new Array(players.get(deviceID))), isBinary)
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

emitter.on("lo1:message", (ws, message, isBinary) => {
  if (isBinary) {
    locationQueue.enter(message);
    locationTmp = ProtoBuf.decode(new Uint8Array(message));
    if (players.has(locationTmp.id)) {
      Object.assign(players.get(locationTmp.id), {
        pox: locationTmp.pox,
        poy: locationTmp.poy,
        poz: locationTmp.poz,
        //rox: messageObject.rox,
        roy: locationTmp.roy,
        //roz: messageObject.roz,
        //row: messageObject.row,
      });
    }
  } else {
    messageString = decoder.decode(new Uint8Array(message));
    messageObject = JSON.parse(messageString);
    messageHandler(messageString, messageObject, ws, isBinary);
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

process.send("ready");

function messageHandler(messageString, messageObject, ws, isBinary) {
  if (messageObject.type === "player") {
    players.set(
      sockets.get(ws),
      Object.assign(messageObject, { deviceID: sockets.get(ws) })
    );
    viewers.delete(sockets.get(ws));
    ws.unsubscribe(String(sockets.get(ws)));

    app.publish("server", JSON.stringify(Object.fromEntries(players)));
    console.log(
      "deviceID: " +
        messageObject.deviceID +
        " has logined! to " +
        messageObject.id +
        "!!"
    );
    console.log(
      "current connect players: " +
        players.size +
        " / current connect viewers: " +
        viewers.size
    );
  } else if (messageObject.type === "chat") {
    chatQueue.enter(messageString);
  } else if (messageObject.type === 4) {
    stateQueue.enter(messageString);
    Object.assign(players.get(messageObject.deviceID), messageObject);
  }
}

const sendLocation = setInterval(() => {
  if (locationQueue.count !== 0) {
    app.publish("server", locationQueue.get(), true, true);
  }
}, 8);

/*
setTimeout(() => 
    const sendChat = setInterval(() => {
        app.publish('server', chatQueue.get())
    }, 16)
}, 10)

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
