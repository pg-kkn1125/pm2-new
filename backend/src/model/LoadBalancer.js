/**
 * @property {property} #
 */
class LoadBalancer {
  #limit = 50;
  #sockets = new Map();
  #viewers = new Map();
  #players = new Map();
  #usableChannel = "a";

  #USER_LIMIT_AMOUNT = 25;

  #deviceID = {
    a: 0,
    b: 0,
    c: 0,
    d: 0,
    e: 0,
  };

  initialize() {}

  add(user, locate) {
    const allocator = `#${locate}`;
    if (Boolean(this[allocator].get(this.#usableChannel))) {
      this[allocator].set(this.#usableChannel, []);
    }
    this[allocator].get(this.#usableChannel).push(viewer);
  }

  checkNext() {}
}
