const convertResponseData = (data, isBinary) => {
  const decoder = new TextDecoder();
  const decodedText = decoder.decode(data);
  if (isBinary) {
    const parsedData = decodedText
      .split(",")
      .map((bi) => String.fromCharCode(parseInt(Number(bi), 2)))
      .join("");
    return JSON.parse(parsedData);
  } else {
    return decodedText;
  }
};

const parseChannel = (query) =>
  query.match(/(lo[0-9]+|chat|receive)([A-Z])/).slice(1, 3);

module.exports = { convertResponseData, parseChannel };
