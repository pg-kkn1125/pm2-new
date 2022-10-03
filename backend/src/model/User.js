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
  id = null;
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
    this.id = data.id;
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
    let object = null;
    if (type === "viewer") object = new Viewer(data);
    else if (type === "player") object = new Player(data);

    this.set(object);
  }

  set(data) {
    this.clear();
    Object.entries(data).forEach(([key, value]) => {
      this[key] = value;
    });
    console.log(this);
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
