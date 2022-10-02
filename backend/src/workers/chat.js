const Queue2 = require("../queue/queue2.js");
const { emitter } = require("./db.js");
const chatQueue = new Queue2();
const { app } = require("../app.js");

emitter.on("chat:message", (app, ws, messageString) => {
  console.log(messageString);
  chatQueue.enter(messageString);
});

setTimeout(() => {
  const sendChat = setInterval(() => {
    app.publish("server", chatQueue.get());
  }, 16);
}, 10);
