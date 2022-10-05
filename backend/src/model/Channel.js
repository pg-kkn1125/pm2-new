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
    this.#channel = channel;
    this.#deviceID = deviceID;

    this.#ws.subscribe(String(deviceID));
    this.#ws.subscribe(channel);
    this.#ws.subscribe("server");
  }

  deleteOrigin(deviceID) {
    try {
      this.findAndDelete(deviceID);
    } catch (e) {}
  }

  findAndDelete(deviceID) {
    // console.log("삭제하러 들어왔다");
    const found = this.findChannel(deviceID);
    // console.log("close 때 확인", found);
    if (found) {
      found.delete(String(deviceID));
      console.log(String(deviceID) + "번 사용자 삭-제!");
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
    if (found) {
      found.delete(String(found.deviceID));
      found.set(String(deviceID), data);
      this.#deviceID = deviceID;
      // console.log("교체!", this.#deviceID);
      // console.log("교체됨", found);
    }
    // console.log("replaced:", found);
    this.channelLog();
    return deviceID;
  }

  convertObj(map) {
    return Object.fromEntries(map);
  }

  convertEntries(map) {
    return Object.entries(this.convertObj(map));
  }

  getUserCountByType(channel, type) {
    const convertedEntries = (data) => this.convertEntries(data);
    const target = this.#channels.get(channel);

    return (channel ? target : this.select()).reduce(
      (acc, cur) =>
        (acc += convertedEntries(cur).reduce(
          (a, [key, value]) => (a += Number(value.type === type)),
          0
        )),
      0
    );
  }

  closeOrigin(channel, deviceID) {
    console.log(`close :: channel`, channel);
    console.log(`close :: deviceID`, deviceID);
    this.deleteOrigin(deviceID);

    console.log(deviceID + " deleted!");

    this.channelLog();
  }

  channelLog() {
    const channelList = Object.entries(Object.fromEntries(this.#channels));
    const channelSizeList = Object.fromEntries(
      channelList.map(([mainCh, subCh]) => [
        mainCh,
        subCh.reduce((acc, cur) => (acc += cur.size), 0),
      ])
    );
    console.log(`channel sizes:`, channelSizeList);
    console.log(
      `channel ${this.#channel}:`,
      this.select().map((ch) => ch.size)
    );
    console.log(
      `channel ${this.#channel}: viewer:`,
      this.getUserCountByType(null, "viewer"),
      `/ player:`,
      this.getUserCountByType(null, "player")
    );
    console.log(
      `ch a viewer:`,
      this.getUserCountByType("a", "viewer"),
      `/ ch a player:`,
      this.getUserCountByType("a", "player")
    );
    console.log(
      `ch b viewer:`,
      this.getUserCountByType("b", "viewer"),
      `/ ch b player:`,
      this.getUserCountByType("b", "player")
    );
    console.log(
      `ch c viewer:`,
      this.getUserCountByType("c", "viewer"),
      `/ ch c player:`,
      this.getUserCountByType("c", "player")
    );
    console.log(
      `ch d viewer:`,
      this.getUserCountByType("d", "viewer"),
      `/ ch d player:`,
      this.getUserCountByType("d", "player")
    );
    console.log(
      `ch e viewer:`,
      this.getUserCountByType("e", "viewer"),
      `/ ch e player:`,
      this.getUserCountByType("e", "player")
    );
  }

  getUserList() {
    return (
      this.#channels
        .get(this.#channel)
        ?.map((ch) => Object.entries(Object.fromEntries(ch)).map(([k, v]) => v))
        .flat(2)
        .filter((user) => user.type === "player") || []
    );
  }
}

module.exports = Channel;
