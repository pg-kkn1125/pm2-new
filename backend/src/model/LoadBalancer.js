/**
 * @property {property} #
 */
class LoadBalancer {
  // 저장
  //   if 한도 확인
  //     분배
  // 삭제
  //   fi 한도 확인
  #limit = 50;
  #sockets = new Map();
  #viewers = new Map();
  #players = new Map();
  #usableChannel = "a";
  save(user, locate) {
    const allocator = `#${locate}`;
    if (Boolean(this[allocator].get(this.#usableChannel))) {
      this[allocator].set(this.#usableChannel, []);
    }
    this[allocator].get(this.#usableChannel).push(viewer);
  }
}
