"use strict";

let users = [];

// on event handlers
function handleOpen(e) {
  el_result.innerHTML = "소켓이 연결되었습니다.";
  el_result.classList.add("active");
}
// function handleMessage(message) {
//   if (typeof message.data === "string") {
//     el_result.innerHTML = message.data;
//   } else {
//     const reader = new FileReader();
//     // console.log(message);
//     try {
//       reader.readAsArrayBuffer(message.data.arrayBuffer);
//       reader.onload = (result) => {
//         const decoder = new TextDecoder();
//         const decodedData = decoder.decode(result.result);
//         // console.log(result);
//         // console.log(decodedData);
//         el_result.innerHTML = decodedData;
//       };
//     } catch (e) {}
//   }
// }
function handleMessage(message) {
  if (typeof message.data === "string") {
    try {
      const json = JSON.parse(message.data);
      console.log("login data /", json);

      const userList = Object.entries(json).map(([k, v]) => v);
      if (userList[0] instanceof Array) {
        users.push(...userList[0]);
      } else {
        // const found = userList.find((list) => list.nickname === user.nickname);
        // if (found) {
        //   user = found;
        // }

        if (json.length < users.length) {
          users = users.filter((us) =>
            Boolean(json.find((js) => js.nickname === us.nickname))
          );
        } else {
          users.push(...userList);
        }
      }
      el_result.innerHTML = message.data;
    } catch (e) {
      console.log(e);
    }
  } else {
    const reader = new FileReader();
    try {
      const decoder = new TextDecoder();
      const result = decoder.decode(message.data);
      const jsonparsed = JSON.parse(result);

      users = users.map((user) => {
        if (user.nickname === jsonparsed.nickname) {
          user = jsonparsed;
        }
        return user;
      });

      el_result.innerHTML = result;
      // reader.onload = (result) => {
      //   const decodedData = decoder.decode(result.result);
      //   // console.log(result);
      //   // console.log(decodedData);
      //   el_result.innerHTML = decodedData;
      //   console.log("binary", JSON.parse(decodedData));
      // };
    } catch (e) {}
  }
}
function handleError() {}
function handleClose() {}

class Socket {
  #name;
  #server;
  #channel;
  ws;
  #connect = false;
  #uri;
  #count = 0;
  constructor(name, server, channel, host, port) {
    this.#name = name;
    this.#server = server;
    this.#channel = channel;
    this.ws = this.connect(host, port);
  }

  connect(host, port) {
    this.#uri = `ws://${host}:${port}/${this.#name}?channel=${this.#server}${
      this.#channel
    }`;

    // console.log(this.#uri);

    this.ws = new WebSocket(this.#uri);

    this.ws.onopen = handleOpen;
    this.ws.onclose = handleClose;
    this.ws.onerror = handleError;
    this.ws.onmessage = handleMessage;

    return this.ws;
  }

  getConnectedUri() {
    return this.#uri;
  }
  // getSocket() {
  //   return this.ws;
  // }

  #retry(e) {
    console.log("다시 연결을 시도합니다.");
    const data = {
      from: "server",
      signal: true,
    };

    el_result.classList.remove("active");

    if (this.#count < 10) {
      this.#count++;
      try {
        this.ws = new WebSocket(this.#uri);
      } catch (e) {
        this.#connect = false;
      }
    }
  }
}

Socket.createViewer = function (idx) {
  return {
    type: "viewer",
    device: `android${idx}`,
    host: "https://location.com",
    timestamp: "20220921",
  };
};

Socket.createPlayer = function (idx, nickname) {
  return {
    type: "player",
    id: idx,
    device: "ios",
    authority: "host",
    avatar: "avatar1",
    pox: idx === 0 ? innerWidth / 2 : Math.random() * innerWidth,
    poy: idx === 0 ? innerHeight / 2 : Math.random() * innerHeight,
    poz: 0,
    roy: 5,
    state: "login",
    host: "https://localhost:3000",
    timestamp: "20220922",
    ...(nickname && { nickname: nickname }),
  };
};

Socket.emit = function (ws, message) {
  // if (typeof message === "object") {
  //   ws.send(JSON.parse(message));
  // } else if (typeof message === "string") {
  ws.send(JSON.stringify(message));
  // }
};

export default Socket;