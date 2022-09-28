const pm2 = require("pm2");
const { app } = require("../server");
const { parseChannel } = require("../util/tools");
// const { cloudWs } = require("../workers/db");

class MessageManager {
  // openSend(ws) {
  //   const [th] = parseChannel(ws.params.channel);
  // }

  send(th, data) {
    // data 규격
    // {
    //   app: app,
    //   ws: ws,
    // }
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

  // promiseGetCloud() {
  //   return new Promise((resolve, reject) => {
  //     // console.log(cloudWs);
  //     if (cloudWs.hasOwnProperty("cloud")) {
  //       setTimeout(() => {
  //         resolve(cloudWs);
  //       }, 1);
  //     }
  //   });
  // }
  // https://joshua1988.github.io/web-development/javascript/promise-for-beginners/ - promise 참조
  // https://ko.javascript.info/promise-basics - promise 참조
}

module.exports = MessageManager;
