const getChunkByNumber = (data, number) => {
  return data.match(new RegExp(`.{1,${number}}`, "g"));
};
const convertResponseData = (data, isBinary) => {
  if (isBinary) {
    // const decoder = new TextDecoder();
    // const decodedText = decoder.decode(data);
    const decoder = new TextDecoder();
    const decodedText = decoder.decode(data);
    const parsedData = decodedText
      .split(",")
      .map((bi) => String.fromCharCode(parseInt(bi, 32)))
      .join("");

    return JSON.parse(parsedData);
  } else {
    return data;
  }
};
// const parseBinary = (data, isBinary) => {
//   const decoder = new TextDecoder();
//   const reader = new FileReader();
//   reader.readAsArrayBuffer(data);
//   reader.onload = (result) => {
//     console.log(result);
//   };
//   // const decodedText = decoder.decode(data);
//   if (isBinary) {
//     const parsedData = decodedText
//       .split(",")
//       .map((bi) => String.fromCharCode(parseInt(Number(bi), 2)))
//       .join("");
//     return JSON.parse(parsedData);
//   } else {
//     return decodedText;
//   }
// };

const parseChannel = (query) =>
  query.match(/(lo[0-9]+|chat|receive)([A-Z])/).slice(1, 3);

// function Emitter() {
//   this.events = {};
// }

// Emitter.prototype.on = function (type, listener) {
//   this.events[type] = this.events[type] || [];
//   this.events[type].push(listener);
// };

// Emitter.prototype.emit = function (type, ...args) {
//   console.log(type);
//   if (this.events[type]) {
//     this.events[type].forEach((listener) => listener(...args));
//   }
// };

module.exports = {
  convertResponseData,
  // parseBinary,
  parseChannel /* Emitter */,
};
