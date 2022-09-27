const pm2 = require("pm2");
const { parseChannel } = require("../util/tools");

class MessageManager {
  openSend(app, ws) {
    const [thread] = parseChannel(ws.params.channel);
    const packet = {
      th: ws.params.channel,
    };
    this.send(thread, packet);
  }
  send(th, data) {
    // data 규격
    // {
    //   app: app,
    //   ws: ws,
    // }
    console.log(data);
    console.log(`${th} 채널로 패킷을 보냅니다.`);
    pm2.list((err, list) => {
      if (err) {
        console.log(err);
      }
      const foundThread = list.find((item) => item.name === th);
      if (foundThread) {
        pm2.sendDataToProcessId(
          foundThread.pm_id,
          {
            topic: true,
            data: data,
          },
          (err, result) => {
            console.log("완료");
          }
        );
      }
    });
  }
  toClient(packet) {
    const { data } = packet;
    data.app.publish("server", data);
  }
}

module.exports = MessageManager;
