import protobuf from "protobufjs";

// Field.d(1, "fixed32", "required")(ProtoBuf.prototype, "id")
// Field.d(2, "bytes", "required")(ProtoBuf.prototype, "pos")
// Field.d(3, "sfixed32", "required")(ProtoBuf.prototype, "angle")
// Field.d(1, "fixed32", "required")(ProtoBuf.prototype, "id");
// Field.d(2, "float", "required")(ProtoBuf.prototype, "pox");
// Field.d(3, "float", "required")(ProtoBuf.prototype, "poy");
// Field.d(4, "float", "required")(ProtoBuf.prototype, "poz");
// Field.d(5, "sfixed32", "required")(ProtoBuf.prototype, "roy");

class Protobuf {
  #message = null;
  constructor(properties) {
    this.initializeFields(properties);
  }

  static encode(result) {
    if (result) return protobuf.Message.encode(result);
    return protobuf.Message.encode(this);
  }

  static decode(data) {
    return protobuf.Message.decode(data);
  }

  initializeFields(fieldsProperties) {
    const entries = Object.entries(fieldsProperties);
    for (let idx in entries) {
      const [key, type] = entries[idx];
      const declare = protobuf.Field.d(Number(idx), type, "required");
      declare(protobuf.Message.prototype, key);
    }
  }

  setMessage(properties) {
    this.#message = new protobuf.Message(properties);
    return this.#message;
  }
}

export default Protobuf;
