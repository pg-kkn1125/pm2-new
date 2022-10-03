const { parseChannel } = require("../util/tools");

class Packet {
  constructor(data) {
    const { channel, type, id } = data;
    const [th, ch] = parseChannel(channel);
    this.thread = th;
    this.channel = ch;
    this.type = type;
    this.id = id;
  }
}

module.exports = Packet;
