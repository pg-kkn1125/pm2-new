const channelNames = ["a", "b", "c", "d", "e"];

class Channel {
  #deviceID = {
    a: 0,
    b: 0,
    c: 0,
    d: 0,
    e: 0,
  };
  #viewers = new Map();
  #players = new Map();
  #sockets = new Map();
  #channels = new Map();
  #app = null;
  #ws = null;

  /**
   * open 시 viewer일 때 channel 정보를 받아 저장
   *
   */
  constructor() {
    channelNames.forEach((channel) => {
      this.#channels.set(channel, []);
    });
    // console.log("channel 생성", this.#channels);
  }

  /**
   * open 시 사용자의 app과 소켓 이니셜라이즈 (viewer일 때 적용)
   * @param {object} app 웹 소켓 애플리케이션
   * @param {object} ws 웹 소켓
   */
  initialize(app, ws) {
    this.#app = app;
    this.#ws = ws;
    // console.log('앱, 소켓 저장', app ,ws)
  }

  /**
   * open 시 구독
   * @param {"a"|"b"|"c"|"d"|"e"} channel 채널명
   */
  subscribe(channel) {
    this.#ws.subscribe(String(this.#deviceID[channel]));
    this.#ws.subscribe("server");
    // // 확인용
    // this.#ws.send(JSON.stringify(data));
    // this.#app.publish(
    //   "server",
    //   JSON.stringify(Object.assign(data, { from: "server" }))
    // );
  }

  /**
   * 소켓 저장
   * @param {"a"|"b"|"c"|"d"|"e"} channel 채널명
   */
  addSocket(channel) {
    this.#sockets.set(this.#ws, this.#deviceID[channel]);
  }

  /**
   * viewer 저장
   * @param {"a"|"b"|"c"|"d"|"e"} channel 채널명
   * @param {object} data viewer 데이터
   */
  addViewer(channel, data) {
    deviceID[channel]++;
    this.subscribe(channel);
    this.addSocket(channel);
    this.#viewers.set(
      this.#sockets.get(this.#ws),
      Object.assign(data, { deviceID: this.#sockets.get(this.#ws) })
    );
    this.publishOne();
    this.publishAll();
  }

  /**
   * 소켓 publish로 사용자 본인에게 메세지 전송
   */
  publishOne() {
    this.#app.publish(
      String(this.#sockets.get(this.#ws)),
      JSON.stringify(new Array(this.#viewers.get(this.#sockets.get(this.#ws))))
    );
  }

  /**
   * 소켓 publish로 사용자 전체에게 메세지 전송
   */
  publishAll() {
    // if (this.#players.size > 0)
    this.#app.publish(
      "server",
      JSON.stringify(Object.fromEntries(this.#players))
    );
  }

  /**
   * player 데이터 저장
   * @param {object} data 디코딩된 데이터
   */
  addPlayer(data) {
    this.#players.set(
      this.#sockets.get(this.#ws),
      Object.assign(data, { deviceID: this.#sockets.get(this.#ws) })
    );
  }

  /**
   * 접속자 확인용 출력
   */
  connectCheck() {
    console.log("deviceID: " + this.#sockets.get(this.#ws) + " has joined!");
    console.log(
      "current connect players: " +
        this.#players.size +
        " / current connect viewers: " +
        this.#viewers.size
    );
  }
}

export default Channel;
