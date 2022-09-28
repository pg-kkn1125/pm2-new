// import Socket from "./model/Socket.js";
/* 
 * @property {property} #protobuf protobuf library
 * @property {property} #Type Type in protobuf library
 * @property {property} #Field Field in protobuf library
 * @property {property} #socket 웹소켓 구조체
 * @property {property} #URL 내부망 websocket서버 접근 주소
 * @property {property} #externalURL 외부망 websocket서버 접근 주소
 * @property {property} #port websocket서버 포트
 * @property {property} #userID userID
 * @property {property} #isLogin isLogin / boolean / default = false
 * @property {property} #dispatcher 받은 패킷 활용 메소드 할당 구조체
 * @property {property} #build 패킷 전송 시마다 만들어지는 protobuf 개별 구조체
 * @property {property} #validator 유효성 검사 기준 오브젝트 보유 구조체
 * @property {property} #packet 패킷 전송 전 작성용
 * @property {property} #receivePacket 받은 패킷 저장용
 * @property {property} #roy location 패킷 작성 전 uint32로 재설정된 user avatar rotation.y 값
 *  */
window.webkitLibraries = {
  static: {
    a4: protobuf,
  },
  MetaEngine: {
    CustomMap: new Map([["socket", {}]]),
    port: 5000,
  },
  State: {},
};

let self;
function ProtoBuf(properties) {
  // protobuf.Message.call(this, properties);
  window.webkitLibraries.static.a4.Message.call(this, properties);
}

const HOST = "localhost";
const PORT = 5000;
const params = `lo1B`;
let socket = new WebSocket(`ws://${HOST}:${PORT}/server?channel=${params}`);
let count = 0;
let connect = false;
const encoder = new TextEncoder();

const encodeData = (data) => {
  const jsonData = JSON.stringify(data);
  const binaryData = jsonData
    .split("")
    .map((json) => json.charCodeAt(0).toString(2));
  return encoder.encode(binaryData);
};

const stringToBinary = (str) =>
  str.split("").map((str) => str.charCodeAt(0).toString(32));

const toBinary = (data) =>
  stringToBinary(typeof data === "string" ? data : JSON.stringify(data));

const handleOpen = (e) => {
  connect = true;
  el_result.innerHTML = "소켓이 연결되었습니다.";
  el_result.classList.add("active");

  const data = {
    channel: params,
    type: "player",
  };

  const binary = toBinary(data);
  const encodeData = encoder.encode(binary);
  // e.target.send(encodeData);
};

const handleClose = () => {
  connect = false;
  retry();
};

const handleMessage = (message) => {
  // console.log(el_result);
  console.log(message);
  el_result.innerHTML = message.data;
};

const handleError = () => {
  connect = false;
  retry();
};

function setup() {
  console.log(new Socket());
  socket.onopen = handleOpen;
  socket.onclose = handleClose;
  socket.onmessage = handleMessage;
  socket.onerror = handleError;
}

function sendMessage() {
  // const packet = {
  //   type: "player",
  //   channel: "lo1A",
  //   id: 1,
  //   pox: 123,
  //   poy: 123,
  //   poz: 123,
  //   roy: 123,
  // };
  const result = new ProtoBuf({
    id: 5,
    pox: 123,
    poy: 123,
    poz: 123,
    roy: 123,
  });

  const packet = ProtoBuf.encode(result).finish();
  socket.send(packet);
  // const encodeData = encoder.encode(makepacket());
  // socket.send(encodeData);
}

setTimeout(() => {
  sendMessage();
}, 1000);

setup();

function retry(e) {
  console.log("다시 연결을 시도합니다.");
  const data = {
    from: "server",
    signal: true,
  };

  el_result.classList.remove("active");

  if (count < 10) {
    count++;
    try {
      socket = new WebSocket(`ws://${HOST}:${PORT}/server`);
    } catch (e) {
      connect = false;
    } finally {
      if (!connect) {
        // setTimeout(() => {
        //   console.log(`재 연결 시도 : ${count}`);
        //   retry();
        // }, 1000);
      }
    }
  }
}
