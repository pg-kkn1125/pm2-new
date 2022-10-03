const channelNames = ["a", "b", "c", "d", "e"];
const LIMIT = 50;

class Channel {
  #channels = new Map();
  #app = null;
  #ws = null;
  #channel = null;
  #deviceID = 0;

  constructor() {
    for (let name of channelNames) {
      this.#channels.set(name, []);
    }
  }

  initialize(app, ws, channel, deviceID) {
    this.#app = app;
    this.#ws = ws;
    this.#channel = channel.toLowerCase();
    this.#deviceID = deviceID;

    this.#ws.subscribe(String(deviceID));
    this.#ws.subscribe(channel);
    this.#ws.subscribe("server");
  }

  deleteOrigin(ws, deviceID) {
    // console.log(`삭제`, deviceID);
    try {
      this.#ws.unsubscribe(String(deviceID));
      this.findAndDelete(deviceID);
    } catch (e) {}
  }

  findAndDelete(deviceID) {
    const found = this.findChannel(deviceID);
    if (found) {
      found.delete(deviceID);
    }
  }

  select() {
    return this.#channels.get(this.#channel);
  }

  isFirst() {
    return this.select().length === 0;
  }

  isFull() {
    return this.select().every((ch) => ch.size === LIMIT);
  }

  getOrCreate() {
    if (this.isFirst() || this.isFull()) {
      this.select().push(new Map());
    }
  }

  updateChannel() {
    this.getOrCreate();
  }

  getLastChannel() {
    this.updateChannel();
    const target = this.select();
    return target[target.length - 1];
  }

  getHoleChannel() {
    this.updateChannel();
    const target = this.select();
    return target.find((ch) => ch.size < LIMIT);
  }

  getEmptyChannel() {
    return this.getHoleChannel() || this.getLastChannel();
  }

  findChannel(deviceID) {
    return this.select().find((ch) => ch.has(String(deviceID)));
  }

  getFindChannelByDeviceID(deviceID) {
    return this.findChannel(deviceID);
  }

  addUser(data) {
    const last = this.getEmptyChannel();
    last.set(String(this.#deviceID), data);
    this.channelLog();
  }

  changeUser(deviceID, data) {
    const found = this.getFindChannelByDeviceID(deviceID);

    found.set(String(deviceID), data);
    this.channelLog();
  }

  convertObj(map) {
    return Object.fromEntries(map);
  }

  convertEntries(map) {
    return Object.entries(this.convertObj(map));
  }

  getUserCountByType(type) {
    const convertedEntries = (data) => this.convertEntries(data);

    return this.select().reduce(
      (acc, cur) =>
        (acc += convertedEntries(cur).reduce(
          (a, [key, value]) => (a += Number(value.type === type)),
          0
        )),
      0
    );
  }

  closeOrigin(deviceID) {
    this.deleteOrigin(deviceID);
    // if (viewers.has(sockets.get(ws))) viewers.delete(sockets.get(ws));
    this.#app.publish(
      "server",
      JSON.stringify(Object.fromEntries(this.findChannel(deviceID)))
    );

    // if (players.has(sockets.get(ws))) {
    //   players.delete(sockets.get(ws));
    //   app.publish("server", JSON.stringify(Object.fromEntries(players)));
    // }

    console.log(this.#deviceID + " exited!");

    this.channelLog();
  }

  channelLog() {
    console.log(
      `channels`,
      this.select().map((ch) => ch.size)
    );
    console.log(
      `viewer: `,
      this.getUserCountByType("viewer"),
      ` / player:`,
      this.getUserCountByType("player")
    );
  }
}

module.exports = Channel;
