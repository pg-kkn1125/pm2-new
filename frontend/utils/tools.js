const encoder = new TextEncoder();

const encodeData = (data) => {
  const jsonData = JSON.stringify(data);
  const binaryData = jsonData
    .split("")
    .map((json) => json.charCodeAt(0).toString(2));
  return encoder.encode(binaryData);
};

const stringToBinary = (str) =>
  str.split("").map((str) => str.charCodeAt(0).toString(32));

const toBinary = (data) =>
  stringToBinary(typeof data === "string" ? data : JSON.stringify(data));

export { encodeData, stringToBinary, toBinary };
