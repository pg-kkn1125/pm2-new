const HOST = "localhost";
const PORT = 5000;
const params = `lo1A`;
let socket = new WebSocket(`ws://${HOST}:${PORT}/server?channel=${params}`);
let count = 0;
let connect = false;

const encodeData = (data) => {
  const jsonData = JSON.stringify(data);
  const binaryData = jsonData
    .split("")
    .map((json) => json.charCodeAt(0).toString(2));
  const encoder = new TextEncoder();
  return encoder.encode(binaryData);
};

const handleOpen = (e) => {
  connect = true;
  el_result.innerHTML = "소켓이 연결되었습니다.";
  el_result.classList.add("active");
  setTimeout(() => {
    e.target.send(
      encodeData({
        channel: "lo1A",
        type: "viewer",
      })
    );
  }, 1000);
};
const handleClose = () => {
  connect = false;
  retry();
};
const handleMessage = (message) => {
  // console.log(el_result);
  el_result.innerHTML = message.data;
};
const handleError = () => {
  connect = false;
  retry();
};

function setup() {
  socket.onopen = handleOpen;
  socket.onclose = handleClose;
  socket.onmessage = handleMessage;
  socket.onerror = handleError;
}

setup();

function retry(e) {
  console.log("다시 연결을 시도합니다.");
  const data = {
    from: "server",
    signal: true,
  };

  el_result.classList.remove("active");

  if (count < 10) {
    count++;
    try {
      socket = new WebSocket(`ws://${HOST}:${PORT}/server`);
    } catch (e) {
      connect = false;
    } finally {
      if (!connect) {
        // setTimeout(() => {
        //   console.log(`재 연결 시도 : ${count}`);
        //   retry();
        // }, 1000);
      }
    }
  }
}
