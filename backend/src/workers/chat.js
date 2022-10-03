const Queue2 = require("../queue/queue2");
const { emitter } = require("../util/emitter");
const chatQueue = new Queue2();
const { app } = require("../app");

emitter.on("chat:message", (app, ws, messageString) => {
  console.log(messageString);
  chatQueue.enter(messageString);
});

setTimeout(() => {
  const sendChat = setInterval(() => {
    app.publish("server", chatQueue.get());
  }, 16);
}, 10);
