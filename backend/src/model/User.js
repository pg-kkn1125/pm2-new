class Viewer {
  type = null;
  id = null;
  device = null;
  host = null;
  timestamp = null;
  constructor(data) {
    this.type = data.type;
    this.id = data.id;
    this.device = data.device;
    this.host = data.host;
    this.timestamp = data.timestamp;
  }
}

class Player {
  type = null;
  nickname = null;
  id = null;
  deviceID = null;
  device = null;
  authority = null;
  avatar = null;
  pox = null;
  poy = null;
  poz = null;
  roy = null;
  state = null;
  host = null;
  timestamp = null;
  constructor(data) {
    this.type = data.type;
    this.nickname = data.nickname;
    this.id = data.id;
    this.deviceID = data.deviceID;
    this.device = data.device;
    this.authority = data.authority;
    this.avatar = data.avatar;
    this.pox = data.pox;
    this.poy = data.poy;
    this.poz = data.poz;
    this.roy = data.roy;
    this.state = data.state;
    this.host = data.host;
    this.timestamp = data.timestamp;
  }
}

class User {
  app = null;
  ws = null;

  constructor(type, data) {
    // console.log("data", data);
    let object = null;
    if (type === "viewer") object = new Viewer(data);
    else if (type === "player") object = new Player(data);

    this.setData(object);
  }

  setData(data) {
    this.clear();
    Object.entries(data).forEach(([key, value]) => {
      this[key] = value;
    });
    // console.log(this);
  }

  setLocationData(data) {
    this.pox = data.pox;
    this.poy = data.poy;
    this.poz = data.poz;
    this.roy = data.roy;
    this.rox = data.rox;
    this.roz = data.roz;
    this.row = data.row;
  }

  setDeviceID(deviceID) {
    this.deviceID = deviceID;
  }

  setApp(app) {
    this.app = app;
  }

  setWs(ws) {
    this.ws = ws;
  }

  clear() {
    Object.keys(this).forEach((key) => {
      if (!Boolean(key.match(/app|ws/))) {
      }
      delete this[key];
    });
  }
}

module.exports = { User, Viewer, Player };
