const MassageManager = require("../model/MessageManager");
const app = require("../server");
const messanger = new MassageManager();
const { cloudApp, cloudWs } = require("../workers/db");

process.on("message", (packet) => {
  console.log("lo1에서 패킷 수신");
  function repeat() {
    if (cloudWs.get("cloud")) {
			// ws 받아오는 부분 문제 
      setTimeout(() => {
        cloudWs.get("cloud").send(JSON.stringify(packet));
      }, 10);
    } else {
      repeat();
    }
  }

  repeat();
});

process.send("ready");
