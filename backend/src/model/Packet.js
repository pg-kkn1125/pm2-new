const { parseChannel } = require("../util/tools");

class Packet {
  constructor(data) {
    const { channel, type } = data;
    const [th, ch] = parseChannel(channel);
    this.thread = th;
    this.channel = ch;
    this.type = type;
  }
}

module.exports = Packet;
