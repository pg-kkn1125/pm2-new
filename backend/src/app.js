//  데이터 규격
//  {
// 	  channel: 'lo1A',
//    lo1 = 스레드, A = 채널 (A | B)
// 	  type: 'viewer',
// 	  device: this.#State.getState('device', 'deviceType'),
// 	  host: window.location.host,
// 	  timestamp: new Date().getTime()
//  }
const uws = require("uWebSockets.js");
const { parseChannel, resourceCheck } = require("./util/tools");
let { emitter } = require("./util/emitter");
const Packet = require("./model/Packet");
const Protobuf = require("./model/Protobuf");

/**
 * Protobuf declare
 */
const declareProtobuf = new Protobuf({
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

let linkServer = {
  name: "server",
  num: 1,
  getLink() {
    return this.name + this.num;
  },
};

// const messanger = new Messanger();
const PORT = 3000;
let isDisableKeepAlive = false;

let params = "";
let server = "";

/**
 * 스레드 리소스 체크
 */
// setTimeout(() => {
//   setInterval(() => {
//     resourceCheck(linkServer.getLink());
//   }, 16);
// }, 2000);
let deviceID = 0;

const app = uws
  .App({})
  .ws("/*", {
    // properties
    idleTimeout: 32,
    maxBackpressure: 1024,
    maxPayloadLength: 1024, // 패킷 데이터 용량 (용량이 넘을 시 서버 끊김)
    compression: uws.DEDICATED_COMPRESSOR_3KB,
    upgrade(res, req, context) {
      // open보다 먼저 실행
      if (req.getQuery().length > 0) {
        const parameters = Object.fromEntries([req.getQuery().split("=")]);
        res.upgrade(
          {
            url: req.getUrl(),
            params: parameters,
          },
          /* Spell these correctly */
          req.getHeader("sec-websocket-key"),
          req.getHeader("sec-websocket-protocol"),
          req.getHeader("sec-websocket-extensions"),
          context
        );
      }
    },
    // method
    open(ws) {
      if (isDisableKeepAlive) {
        ws.close();
      }

      const { channel } = ws.params;
      [th] = parseChannel(channel);
      server = th;

      // 최초 연결 시 viewer type 메세지 전송
      openSend(ws);
    },
    message: handleMessage,
    drain(ws) {
      console.log("WebSocket backpressure: ", ws.getBufferedAmount());
    },
    close(ws, code, message) {
      emitter.emit(`${server}:close`, ws, code, message);

      // if (isDisableKeepAlive) {
      //   ws.unsubscribe(String(procId));
      // }
      params = "";
    },
  })
  .listen(PORT, (socket) => {
    if (socket) {
      process.send("ready");
      console.log(`server listening on ws://localhost:${PORT}/*`);
    }
  });

function openSend(ws) {
  const [th] = parseChannel(ws.params.channel);
  emitter.emit(
    th,
    app,
    ws,
    new Packet({
      channel: ws.params.channel,
      type: "viewer",
      id: deviceID,
    })
  );
  deviceID++;
}

function handleMessage(ws, message, isBinary) {
  const { params } = ws;
  const { channel } = params;
  const [th] = parseChannel(channel);

  const decoder = new TextDecoder();
  if (isBinary) {
    const decodedData = Protobuf.decode(new Uint8Array(message));

    Object.assign(decodedData, { deviceID: deviceID });
    deviceID++;
    if (decodedData.type === "player") {
      emitter.emit(`${th}:player:insert`, app, ws, decodedData, message);
    } else {
      // ...
    }
  } else {
    const decodeMessage = decoder.decode(new Uint8Array(message));
    if (decodeMessage.trim().startsWith("{")) {
      const decodeMessageObject = JSON.parse(decodeMessage);
      Object.assign(decodeMessageObject, { deviceID: deviceID });
      emitter.emit(`${th}:message`, app, ws, decodeMessageObject, message);
    } else {
      emitter.emit("chat:message", app, ws, decodeMessage);
    }
  }
}

// process dead
process.on("SIGINT", function () {
  isDisableKeepAlive = true;
  app.close(function () {
    process.exit(0);
  });
});

module.exports = { app, declareProtobuf };
