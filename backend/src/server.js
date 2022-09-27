//  데이터 규격
//  {
// 	  channel: 'lo1A',
//    lo1 = 스레드, A = 채널 (A | B)
// 	  type: 'viewer',
// 	  device: this.#State.getState('device', 'deviceType'),
// 	  host: window.location.host,
// 	  timestamp: new Date().getTime()
//  }
const Messanger = require("./model/MessageManager");
const uws = require("uWebSockets.js");
const { clusters } = require("./util/variables");
const { convertResponseData, parseChannel } = require("./util/tools");
const { cloudWs, cloudApp } = require("./workers/db");

const messanger = new Messanger();
let isDisableKeepAlive = false;
const sockets = new Map(); // 소켓 서버
const players = new Map(); // 유저 정보 (위치 값 등)
const viewers = new Map(); // 로그인 창 정보
let params = "";

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

      const decoder = new TextDecoder();

      // deviceID++;
      // sockets.set(ws, deviceID);
      // ws.subscribe(String(deviceID));
      ws.subscribe("server");
      // console.log(deviceID);
      ws.send("서버 시작");
      cloudWs.set("cloud", ws);
      receiveOpen(ws); // open 시점에서 스레드로 송신
    },
    message: handleMessage,
    drain(ws) {
      console.log("WebSocket backpressure: ", ws.getBufferedAmount());
    },
    close(ws, code, message) {
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

function handleMessage(ws, message, isBinary) {
  const data = convertResponseData(message, isBinary);

  // const json = JSON.parse(data);
  // dev.log(json);
  // players.delete(sockets.get(data.id));

  // messanger.send(ws, data);
  // messanger.save(data); // 추후 작업

  // messageHandler(message, data, ws, isBinary);
}

function receiveOpen(ws) {
  messanger.openSend(app, ws);
  cloudApp.set("cloud", app);
  cloudWs.set("cloud", ws);
}

// 클라이언트 요청을 socket message로 받아
// sendMessage로 보내면 아래 메세지 이벤트로 받음
process.on("message", (packet) => {
  console.log("[RECEIVE] 받은 패킷: ", packet);

  // app.publish(
  //   players.get("uWS.WebSocket {}") || "main",
  //   JSON.stringify(packet)
  // );
});

// process dead
process.on("SIGINT", function () {
  isDisableKeepAlive = true;
  app.close(function () {
    process.exit(0);
  });
});

module.exports = app;
