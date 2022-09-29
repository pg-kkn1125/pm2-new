/**
 * @class Socket
 * @property {method} #initialize - protobuf 할당, url 및 port 설정
 * @property {method} connect - websocket서버에 연결, connect 패킷 작성 및 #dispatcher 기능 할당
 * @property {method} #makeRotationPacketData - user avatar rotation.y 값을 uint32로 재설정
 * @property {method} location - websocket서버에 location 패킷 전송, location 패킷 작성
 * @property {method} chat - websocket서버에 chat message 패킷 전송, chat 패킷 작성
 * @property {method} #setReceivers websocket서버에서 받은 패킷 분배
 * @property {method} #validate 패킷 전송 전 유효성 검사(현재 미사용)
 * @property {method} #logError 유효성 검사 중 에러메세지 출력(현재 미사용)
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
 */
export default class Socket {
  #core = window.webkitLibraries.MetaEngine;
  #CustomMap = this.#core.CustomMap;
  #promiseArray = [];
  #State = this.#core.State;

  #protobuf = window.webkitLibraries.static.a4;
  #Type = window.webkitLibraries.static.a4.Type;
  #Field = window.webkitLibraries.static.a4.Field;

  #socket;
  #config;
  #devURL;
  #serviceURL;
  #port;

  #userID;
  #deviceID;
  #isLogin = false;
  #dispatcher = {};

  #build;
  #validator;
  #packet;
  #receivePacket;
  #roy;

  get dispatcher() {
    return this.#dispatcher;
  }

  constructor() {
    self = this;
    this.#initialize();

    return this;
  }

  #initialize() {
    this.#promiseArray.push(
      new Promise((resolve, reject) => {
        (ProtoBuf.prototype = Object.create(
          this.#protobuf.Message
        )).constructor = ProtoBuf;
        this.#Field.d(1, "fixed32", "required")(ProtoBuf.prototype, "id");
        this.#Field.d(2, "float", "required")(ProtoBuf.prototype, "pox");
        this.#Field.d(3, "float", "required")(ProtoBuf.prototype, "poy");
        this.#Field.d(4, "float", "required")(ProtoBuf.prototype, "poz");
        this.#Field.d(5, "sfixed32", "required")(ProtoBuf.prototype, "roy");

        this.#config = this.#CustomMap.get("socket");
        // this.#setConfig();

        resolve();
      })
    );
  }

  // #setConfig() {
  //   this.#port = this.#config.port;
  //   this.#core.State.setStateOverWrite({
  //     category: "connection",
  //     switch: "port",
  //     value: this.#config.port,
  //   });

  //   this.#devURL = this.#config.devURL;
  //   this.#core.State.setStateOverWrite({
  //     category: "connection",
  //     switch: "devURL",
  //     value: (this.#devURL += String(this.#port) + "/"),
  //   });

  //   this.#serviceURL = this.#config.serviceURL;
  //   this.#core.State.setStateOverWrite({
  //     category: "connection",
  //     switch: "serviceURL",
  //     value: (this.#serviceURL += String(this.#port) + "/"),
  //   });
  // }

  async loadComplete() {
    await Promise.all(this.#promiseArray).then(() => {
      this.#core.devConsole("Create Socket Class Completed!!");
    });

    return this;
  }

  setClientViewer() {
    this.#core.State.setStateOverWrite({
      category: "user",
      switch: "currentState",
      value: "viewer",
    });

    this.#packet = {
      type: "viewer",
      device: this.#State.getState("device", "deviceType"),
      host: window.location.host,
      timestamp: new Date().getTime(),
    };

    window.location.href.substring(7, 8) === "1"
      ? (this.#socket = new WebSocket(
          this.#core.State.getState("connection", "devURL")
        ))
      : (this.#socket = new WebSocket(
          this.#core.State.getState("connection", "serviceURL")
        ));
    this.#socket.binaryType = "arraybuffer";

    this.#socket.onopen = function () {
      self.#socket.send(JSON.stringify(self.#packet));
      self.#isLogin = true;
      self.#dispatcher.viewer = self.completeSetClientViewer;
      self.#dispatcher.player = self.completeSetClientPlayer;
      //self.#dispatcher.state = self.setSocketServerState
      //self.#dispatcher.connect = self.#core.Mesh.manageAvatar
      //self.#dispatcher.chat = self.#core.UI.receiveChatData
    };

    this.#setReceivers();
  }

  completeSetClientViewer(r) {
    self.#deviceID = r[0].deviceID;

    self.#State.setStateOverWrite({
      category: "user",
      switch: "deviceID",
      value: r[0].deviceID,
    });
  }

  setClientPlayer() {
    this.#userID = this.#State.getState("user", "id");

    this.#core.State.setStateOverWrite({
      category: "user",
      switch: "currentState",
      value: "player",
    });

    this.#packet = {
      type: "player",
      id: this.#State.getState("user", "id"),
      device: this.#State.getState("device", "deviceType"),
      authority: this.#State.getState("user", "authority"),
      avatar: this.#State.getState("user", "avatar"),
      pox: this.#core.user.position.x,
      poy: this.#core.user.position.y,
      poz: this.#core.user.position.z,
      roy: this.#makeRotationPacketData(this.#core.user.rotation),
      state: this.#State.getState("user", "state"),
      host: window.location.host,
      //area: area,
      //collisionGroup: collisionGroup,
      //activationState: activationState,
      timestamp: new Date().getTime(),
    };

    this.#socket.send(JSON.stringify(this.#packet));
  }

  completeSetClientPlayer(r) {
    self.#core.Mesh.manageAvatar(r);
  }

  #makeRotationPacketData(rotation) {
    this.#roy = Math.round(rotation.y * 1000);
    if (rotation.x < 0) {
      Math.sign(this.#roy) < 0 ? (this.#roy -= 10000) : (this.#roy += 10000);
    }

    return this.#roy;
  }

  location() {
    if (this.#isLogin) {
      this.#build = new ProtoBuf({
        id: this.#deviceID,
        pox: this.#core.user.position.x,
        poy: this.#core.user.position.y,
        poz: this.#core.user.position.z,
        roy: this.#makeRotationPacketData(this.#core.user.rotation),
      });

      this.#packet = ProtoBuf.encode(this.#build).finish();
      this.#socket.send(this.#packet);
    }
  }

  chat(scope = "all", target = "all", data) {
    if (this.#isLogin) {
      this.#packet = {
        type: "chat",
        id: this.#userID,
        scope: scope,
        target: target,
        data: data,
        timestamp: new Date().getTime(),
      };

      this.#socket.send(JSON.stringify(this.#packet));
    }
  }

  #setReceivers() {
    this.#socket.onmessage = function (e) {
      if (e.data !== "") {
        if (typeof e.data === "string") {
          self.#receivePacket = Object.values(JSON.parse(e.data));
          self.#dispatcher[self.#receivePacket[0].type](self.#receivePacket);
        } else {
          for (let i = 0; i < Math.round(e.data.byteLength / 25); i++) {
            try {
              self.#core.Control.movePlayer(
                ProtoBuf.decode(
                  new Uint8Array(e.data.slice(i * 25, i * 25 + 25))
                )
              );
            } catch (e) {
              console.error(e);
            }
          }
        }
      }
    };
  }

  #validate(obj) {
    obj = Object.values(obj);

    this.#validator = Object.values(this[obj[0]]);

    for (let i = 0; i < this.#validator.length; i++) {
      if (typeof obj[i] !== this.#validator[i] && this.#validator[i] !== "") {
        return false;
        this.#core.devConsole(obj[i]);
      }
    }

    return true;
  }

  #logError(type) {
    this.#core.devConsole(`invalid ${type} data. please check.`);
  }

  connect = {
    type: "string",
    id: "number",
    device: "string",
    authority: "string",
    avatar: "string",
    pox: "number",
    poy: "number",
    poz: "number",
    //rox: 'number',
    roy: "number",
    //roz: 'number',
    //row: 'number',
    state: "string",
    host: "string",
    //state2: 'string',
    //state3: 'string',
    //value1: '',
    //value2: '',
    //value3: '',
    //collisionGroup: 'number',
    //activationState: 'number',
    timestamp: "number",
  };

  chat = {
    id: "string",
    scope: "string",
    target: "string",
    data: "string",
    timestamp: "number",
    type: "number",
  };

  state = {
    id: "string",
    state1: "string",
    state2: "string",
    state2: "string",
    value1: "",
    value2: "",
    value3: "",
    collisionGroup: "number",
    activationState: "number",
    timestamp: "number",
    type: "number",
  };

  get deviceID() {
    return this.#deviceID;
  }
}
