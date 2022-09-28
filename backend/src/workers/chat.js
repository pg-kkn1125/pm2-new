const Queue2 = require("../queue/queue2.js");
const chatQueue = new Queue2();

const sendChat = setInterval(() => {
  if (chatQueue.count !== 0) {
    app.publish("server", chatQueue.get());
  }
}, 100);
