// const cloudWs = new Map();
// const cloudApp = new Map();
// let cloudWs = {};
// let cloudApp = {};
// https://medium.com/@wdjty326/javascript-es6-map-vs-object-performance-%EB%B9%84%EA%B5%90-7f98e30bf6c8 - Map vs Object 성능 비교
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map - Map vs Object 성능 비교

// proxy
// cloudWs = new Proxy(cloudWs, {
//   get(target, prop, receiver) {
//     return Reflect.get(target, prop, receiver); // (1)
//   },
//   set(target, prop, val, receiver) {
//     console.log("ws 클라우드 등록 시점");
//     // event emitter
//     return Reflect.set(target, prop, val, receiver); // (2)
//   },
// });

// cloudApp = new Proxy(cloudApp, {
//   get(target, prop, receiver) {
//     return Reflect.get(target, prop, receiver); // (1)
//   },
//   set(target, prop, val, receiver) {
//     console.log("app 클라우드 등록 시점");
//     // event emitter
//     return Reflect.set(target, prop, val, receiver); // (2)
//   },
// });
