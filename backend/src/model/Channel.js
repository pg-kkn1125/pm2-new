const channelNames = ["a", "b", "c", "d", "e"];
const LIMIT = 50;

class Channel {
  #channelIndex = {
    a: 0,
    b: 0,
    c: 0,
    d: 0,
    e: 0,
  };
  // #viewers = new Map();
  #userDeviceID = 0; // value 0
  #channels = new Map(); // a,b,c,d,e channels
  #app = null;
  #ws = null;
  #userChannel = null;
  #currentChannel = null;

  #lowerCase(channel) {
    return channel.toLowerCase();
  }

  /**
   * channel 초기 생성
   */
  constructor() {
    channelNames.forEach((channel) => {
      // this.#players.set(channel, []);
      // this.#viewers.set(channel, []);
      this.#channels.set(channel, []);
    });
    // console.log("channel 생성", this.#channels);

    // setInterval(() => {
    //   this.#app?.publish?.("server", "");
    // }, 55000);
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
   * 소켓 저장
   * @param {"a"|"b"|"c"|"d"|"e"} channel 채널명
   */
  setDeviceID(channel, deviceID) {
    this.#userDeviceID = deviceID;
    const lowerChannel = this.#lowerCase(channel);
    this.#userChannel = lowerChannel;
  }

  /**
   * open 시 구독
   * @param {"a"|"b"|"c"|"d"|"e"} channel 채널명
   */
  subscribe(channel) {
    const lowerChannel = this.#lowerCase(channel);
    this.#ws.subscribe(String(this.#userDeviceID));
    this.#ws.subscribe(lowerChannel);
    this.#ws.subscribe("server");
    // // 확인용
    // this.#ws.send(JSON.stringify(data));
    // this.#app.publish(
    //   "server",
    //   JSON.stringify(Object.assign(data, { from: "server" }))
    // );
  }

  isEmpty(channel) {
    return this.#channels.get(channel).length === 0;
  }

  isFull(channel) {
    return this.#channels.get(channel).every((item) => item.size === LIMIT);
  }

  /**
   * 채널의 현황을 체크해서 타겟 채널을 교체하는 메서드
   * @param {"a"|"b"|"c"|"d"|"e"} channel 채널명
   */
  updateChannel(channel) {
    const lowerChannel = this.#lowerCase(channel);
    if (this.isEmpty(lowerChannel) || this.isFull(lowerChannel)) {
      this.#currentChannel = new Map();
      this.#channels.get(lowerChannel).push(this.#currentChannel);
    }

    this.#channelIndex[lowerChannel] =
      this.#channels.get(lowerChannel).length - 1;
  }

  /**
   * 현재 채널에 유저 저장
   * @param {"a"|"b"|"c"|"d"|"e"} channel 채널명
   * @param {User} userData 유저 데이터
   */
  addUser(channel, userData) {
    const lowerChannel = this.#lowerCase(channel || this.#userChannel);
    this.#userDeviceID = userData.id;
    this.updateChannel(lowerChannel);
    this.addUserToCurrentChannel(lowerChannel, userData);
    this.publishOne(lowerChannel);
    this.publishAll(lowerChannel);
  }

  findUserChannel(channel, deviceID) {
    return this.#channels.get(channel).find((ch) => ch.has(deviceID));
  }

  /**
   * player 정보 broadcast 할 때 필요
   * @param {"a"|"b"|"c"|"d"|"e"} channel
   * @returns
   */
  getViewer(channel) {
    const ch = this.#channels.get(channel);
    return ch.map((c) =>
      Object.fromEntries(
        Object.entries(Object.fromEntries(c)).filter(
          ([key, value]) => value.type === "viewer"
        )
      )
    );
  }

  /**
   * player 정보 broadcast 할 때 필요
   * @param {"a"|"b"|"c"|"d"|"e"} channel
   * @returns
   */
  getPlayers(channel) {
    const ch = this.#channels.get(channel);
    return ch.map((c) =>
      Object.fromEntries(
        Object.entries(Object.fromEntries(c)).filter(
          ([key, value]) => value.type === "player"
        )
      )
    );
  }

  addUserToCurrentChannel(channel, userData) {
    console.log("user id", this.#userDeviceID);
    if (userData.type === "viewer") {
      this.#currentChannel.set(this.#userDeviceID, userData);
    } else {
      const foundChannel = this.findUserChannel(channel, this.#userDeviceID);
      console.log(foundChannel);
      if (foundChannel && foundChannel.has(this.#userDeviceID)) {
        this.#currentChannel.delete(this.#userDeviceID);
        this.#userDeviceID = userData.id;
        foundChannel.set(userData.id, userData);
        // this.#userDeviceID = this.#userDeviceID;
        Object.assign(foundChannel.get(this.#userDeviceID), {
          pox: userData.pox,
          poy: userData.poy,
          poz: userData.poz,
          //rox: messageObject.rox,
          roy: userData.roy,
          //roz: messageObject.roz,
          //row: messageObject.row,
        });
      } else {
        this.#currentChannel.delete(this.#userDeviceID);
        this.#userDeviceID = userData.id;
        // this.#userDeviceID = this.#userDeviceID;
        // player 등록
        const insertId = Object.assign(userData, {
          deviceID: this.#userDeviceID,
        });
        // this.#currentChannel.delete(this.#userDeviceID);
        this.#currentChannel.set(this.#userDeviceID, insertId);

        // 전체 서버 사용자에 player 데이터 전송
        this.#app.publish("server", JSON.stringify(this.getPlayers(channel)));
        console.log(
          "deviceID: " +
            insertId.deviceID +
            " has logined! to " +
            insertId.id +
            "!!"
        );
      }
    }
    // this.#currentChannel.set(userData.id, userData);
    this.connectCheck();
    this.channelCountCheck();
  }

  /**
   * 소켓 publish로 사용자 본인에게 메세지 전송
   */
  publishOne(channel) {
    this.#app.publish(
      String(this.#userDeviceID),
      JSON.stringify(this.getViewer(channel))
    );
  }

  /**
   * 소켓 publish로 사용자 전체에게 메세지 전송
   */
  publishAll(channel) {
    // if (this.#players.size > 0)
    // console.log(
    //   "publish channel",
    //   this.#channels.get(channel)[this.#channelIndex[this.#userChannel]]
    // );
    this.#app.publish("server", JSON.stringify(this.getPlayers(channel)));
  }

  // /**
  //  * viewer 저장
  //  * @param {"a"|"b"|"c"|"d"|"e"} channel 채널명
  //  * @param {object} data viewer 데이터
  //  */
  // addViewer(channel, userData) {
  //   this.updateChannel();
  //   this.addSocket(lowerChannel);
  //   this.addUser(userData);
  //   this.publishOne();
  //   this.publishAll();
  // }

  // /**
  //  * player 데이터 저장
  //  * @param {object} data 디코딩된 데이터
  //  */
  // addPlayer(data) {
  //   if (this.#players.has(data.id)) {
  //     Object.assign(this.#players.get(data.id), {
  //       pox: data.pox,
  //       poy: data.poy,
  //       poz: data.poz,
  //       //rox: messageObject.rox,
  //       roy: data.roy,
  //       //roz: messageObject.roz,
  //       //row: messageObject.row,
  //     });
  //   } else {
  //     // player 등록
  //     this.#players.set(
  //       this.#sockets.get(this.#ws),
  //       Object.assign(data, { deviceID: this.#sockets.get(this.#ws) })
  //     );
  //     // viewer 제거
  //     this.#viewers.delete(this.#sockets.get(this.#ws));
  //     // viewer 구독 해제
  //     this.#ws.unsubscribe(String(this.#sockets.get(this.#ws)));
  //     // player 구독
  //     this.#ws.subscribe(String(this.#sockets.get(this.#ws)));
  //     // 전체 서버 사용자에 player 데이터 전송
  //     this.#app.publish(
  //       "server",
  //       JSON.stringify(Object.fromEntries(this.#players))
  //     );
  //     console.log(
  //       "deviceID: " + data.deviceID + " has logined! to " + data.id + "!!"
  //     );
  //     this.connectCheck();
  //   }
  // }

  channelCountCheck() {
    // console.log(this.currentChannel);
    console.log(`CH_1`, this.#channelIndex.a + 1 + "개", "currentChannelIndex");
    console.log(`CH_2`, this.#channelIndex.b + 1 + "개", "currentChannelIndex");
    console.log(`CH_3`, this.#channelIndex.c + 1 + "개", "currentChannelIndex");
    console.log(`CH_4`, this.#channelIndex.d + 1 + "개", "currentChannelIndex");
    console.log(`CH_5`, this.#channelIndex.e + 1 + "개", "currentChannelIndex");
  }

  viewerSize() {
    // console.log(this.#channels.get(this.#userChannel));
    return this.#channels
      .get(this.#userChannel)
      .reduce(
        (acc, cur) =>
          (acc += Object.values(Object.fromEntries(cur)).filter(
            (c) => c.type === "viewer"
          ).length),
        0
      );
  }

  playerSize() {
    // console.log(this.#channels.get(this.#userChannel));
    return this.#channels
      .get(this.#userChannel)
      .reduce(
        (acc, cur) =>
          (acc += Object.values(Object.fromEntries(cur)).filter(
            (c) => c.type === "player"
          ).length),
        0
      );
  }

  /**
   * 접속자 확인용 출력
   */
  connectCheck() {
    // console.log(this.#sockets);
    // console.log(this.#ws);
    console.log("deviceID: " + this.#userDeviceID + " has joined!");
    console.log(
      "current connect players: " +
        this.playerSize() +
        " / current connect viewers: " +
        this.viewerSize()
    );
    // console.log(this.#channels);
  }

  disconnect() {
    const found = this.#channels.get(this.#userChannel)[
      this.#channelIndex[this.#userChannel]
    ];
    // if (found.has(this.#userDeviceID)) found.delete(this.#userDeviceID);

    if (found.has(this.#userDeviceID)) {
      // found.delete(this.#userDeviceID);
      this.#app.publish("server", JSON.stringify(Object.fromEntries(found)));
    }

    console.log(this.#userDeviceID + " exited!");
    // this.#sockets.delete(this.#ws);
    console.log(
      "current connect players: " +
        this.playerSize() +
        " / current connect viewers: " +
        this.viewerSize()
    );
  }
}

module.exports = Channel;
