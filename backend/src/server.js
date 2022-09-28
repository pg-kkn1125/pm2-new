//  데이터 규격
//  {
// 	  channel: 'lo1A',
//    lo1 = 스레드, A = 채널 (A | B)
// 	  type: 'viewer',
// 	  device: this.#State.getState('device', 'deviceType'),
// 	  host: window.location.host,
// 	  timestamp: new Date().getTime()
//  }
// const Messanger = require("./model/MessageManager");
const uws = require("uWebSockets.js");
const {
  convertResponseData,
  parseChannel,
  parseBinary,
} = require("./util/tools");
let { emitter } = require("./workers/db");
const Packet = require("./model/Packet");
// const MessageManager = require("./model/MessageManager");
// const messanger = new MessageManager();

// const messanger = new Messanger();
let isDisableKeepAlive = false;
const sockets = new Map(); // 소켓 서버
const players = new Map(); // 유저 정보 (위치 값 등)
const viewers = new Map(); // 로그인 창 정보
let params = "";
let server = "";

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
      // deviceID++;
      // sockets.set(ws, deviceID);
      // ws.subscribe(String(deviceID));
      // console.log(deviceID);
      // ws.send("서버 시작");
      // cloudApp = Object.assign(cloudApp, { cloud: app });
      // cloudWs = Object.assign(cloudWs, { cloud: ws });
      openSend(ws);
      // messanger.openSend(ws);
      // open 시점에서 스레드로 송신
    },
    message: handleMessage,
    drain(ws) {
      console.log("WebSocket backpressure: ", ws.getBufferedAmount());
    },
    close(ws, code, message) {
      emitter.emit(server, ws, code, message);

      if (isDisableKeepAlive) {
        ws.unsubscribe(String(procId));
      }
      params = "";
    },
  })
  .listen(5000, (socket) => {
    if (socket) {
      process.send("ready");
      console.log(`server listening on ws://localhost:${5000}/*`);
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
    })
  );
}

function handleMessage(ws, message, isBinary) {
  const { params } = ws;
  const { channel } = params;
  const [th] = parseChannel(channel);
  // console.log(message, isBinary);
  emitter.emit(`${th}:message`, ws, message, isBinary);
}

// process dead
process.on("SIGINT", function () {
  isDisableKeepAlive = true;
  app.close(function () {
    process.exit(0);
  });
});

module.exports = { app };
