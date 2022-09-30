/**
 * @property {property} #
 */
class LoadBalancer {
  // 저장
  // 삭제
  // 사이즈 확인
  #limit = 50;
  #sockets = new Map();
  #viewers = new Map();
  #players = new Map();
  #spaces = ["a", "b", "c", "d", "e"];
  #usableChannel = [0, 0, 0, 0, 0];

  constructor() {
    for (let space of this.#spaces) {
      this.#players.set(space, []);
    }
  }

  enterViewer(ws, messageObject) {
    // if (Boolean(this.#viewers.get(this.#usableChannel))) {
    //   this.#viewers.set(this.#usableChannel, []);
    // }
    this.#viewers.set(
      sockets.get(ws),
      Object.assign(messageObject, { deviceID: sockets.get(ws) })
    );
    console.log("viewer : ", this.#viewers.size);
  }
  /**
   *
   * @param {player} user
   * @param {*} locate
   */
  enterPlayer(user, locate) {
    this.#players.get(locate).push(user);
  }
  delete(deviceID) {}
  socketSize() {
    return this.#sockets.size;
  }
  viewerSize() {
    this.#viewers.size;
  }
  playerSize() {
    this.#players.size;
  }
}
