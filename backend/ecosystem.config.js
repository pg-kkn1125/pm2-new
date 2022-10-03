const envOptions = {
  env: {
    // 실행 시 환경 변수 설정
    HOST: "localhost",
    PORT: 3000,
  },
  env_production: {
    // 개발 환경별 환경 변수 설정
    NODE_ENV: "production",
  },
  env_development: {
    // 개발 환경별 환경 변수 설정
    NODE_ENV: "development",
  },
};

const watchOptions = {
  watch: true, // watch 여부
  // watch: ["server", "client"], // 감시할 폴더 설정
  // watch_delay: 1000, watch 딜레이 인터벌
  ignore_watch: ["node_modules"], // watch 제외 대상
};

const statusOptions = {
  max_memory_restart: "300M", // process memory가 300mb에 도달하면 reload 실행
  // wait_ready: true, // 마스터 프로세스에게 ready 이벤트를 기다리라는 의미
  // listen_timeout: 50000, // ready 이벤트를 기다릴 시간값(ms)을 의미
  // kill_timeout: 5000, // 새로운 요청을 더 이상 받지 않고 연결되어 있는 요청이 완료된 후 해당 프로세스를 강제로 종료하도록 처리
};

// location 서버 생성
const SERVER_NAME = "server";
const locationCount = 1;
const locations = new Array(locationCount).fill(0).map((e, i) => ({
  name: `${SERVER_NAME}${i + 1}`, // 앱 이름
  script: `src/workers/${SERVER_NAME}1.js`, // 스크립트 파일 위치
  instances: 1, // 0 | "max" = CPU 코어 수 만큼 프로세스를 생성
  // watch: ["./"],
  // wait_ready: true,
  ...statusOptions,
  ...watchOptions,
  ...envOptions,
}));

module.exports = {
  apps: [
    {
      name: "chat", // 앱 이름
      script: "src/workers/chat.js", // 스크립트 파일 위치
      instances: 1, // 0 | "max" = CPU 코어 수 만큼 프로세스를 생성
      // watch: ["./"],
      ...statusOptions,
      ...watchOptions,
      ...envOptions,
    },
    ...locations,
    {
      name: "app", // 앱 이름
      script: "src/app.js", // 스크립트 파일 위치
      instances: 1, // 0 | "max" = CPU 코어 수 만큼 프로세스를 생성
      // exec_mode: "cluster", // 애플리케이션을 클러스터 모드로 실행
      // watch: ["./"],
      wait_ready: true,
      restart_delay: 1000,
      // args: ["receive"],
      // instnace_var: ,
      ...statusOptions,
      ...watchOptions,
      ...envOptions,
    },

    // {
    //   name: "lo2", // 앱 이름
    //   script: "src/workers/lo2.js", // 스크립트 파일 위치
    //   instances: 1, // 0 | "max" = CPU 코어 수 만큼 프로세스를 생성
    //   watch: ["./"],
    //   ...statusOptions,
    //   ...watchOptions,
    //   ...envOptions,
    // },
    // {
    //   name: "lo3", // 앱 이름
    //   script: "src/workers/lo3.js", // 스크립트 파일 위치
    //   instances: 1, // 0 | "max" = CPU 코어 수 만큼 프로세스를 생성
    //   watch: ["./"],
    //   ...statusOptions,
    //   ...watchOptions,
    //   ...envOptions,
    // },
    // {
    //   name: "lo4", // 앱 이름
    //   script: "src/workers/lo4.js", // 스크립트 파일 위치
    //   instances: 1, // 0 | "max" = CPU 코어 수 만큼 프로세스를 생성
    //   watch: ["./"],
    //   ...statusOptions,
    //   ...watchOptions,
    //   ...envOptions,
    // },
    // {
    //   name: "lo5", // 앱 이름
    //   script: "src/workers/lo5.js", // 스크립트 파일 위치
    //   instances: 1, // 0 | "max" = CPU 코어 수 만큼 프로세스를 생성
    //   watch: ["./"],
    //   ...statusOptions,
    //   ...watchOptions,
    //   ...envOptions,
    // },
    // {
    //   name: "lo6", // 앱 이름
    //   script: "src/workers/lo6.js", // 스크립트 파일 위치
    //   instances: 1, // 0 | "max" = CPU 코어 수 만큼 프로세스를 생성
    //   watch: ["./"],
    //   ...statusOptions,
    //   ...watchOptions,
    //   ...envOptions,
    // },
    // {
    //   name: "lo7", // 앱 이름
    //   script: "src/workers/lo7.js", // 스크립트 파일 위치
    //   instances: 1, // 0 | "max" = CPU 코어 수 만큼 프로세스를 생성
    //   watch: ["./"],
    //   ...statusOptions,
    //   ...watchOptions,
    //   ...envOptions,
    // },
    // {
    //   name: "lo8", // 앱 이름
    //   script: "src/workers/lo8.js", // 스크립트 파일 위치
    //   instances: 1, // 0 | "max" = CPU 코어 수 만큼 프로세스를 생성
    //   watch: ["./"],
    //   ...statusOptions,
    //   ...watchOptions,
    //   ...envOptions,
    // },
    // {
    //   name: "lo9", // 앱 이름
    //   script: "src/workers/lo9.js", // 스크립트 파일 위치
    //   instances: 1, // 0 | "max" = CPU 코어 수 만큼 프로세스를 생성
    //   watch: ["./"],
    //   ...statusOptions,
    //   ...watchOptions,
    //   ...envOptions,
    // },
    // {
    //   name: "db", // 앱 이름
    //   script: "src/workers/db.js", // 스크립트 파일 위치
    //   instances: 1, // 0 | "max" = CPU 코어 수 만큼 프로세스를 생성
    //   watch: ["./"],
    //   ...statusOptions,
    //   ...watchOptions,
    //   ...envOptions,
    // },
    // {
    //   name: "yegan_chat", // 앱 이름
    //   script, // 스크립트 파일 위치
    //   instances: 1, // 0 | "max" = CPU 코어 수 만큼 프로세스를 생성
    //   exec_mode: "cluster", // 애플리케이션을 클러스터 모드로 실행
    //   args: ["chat"],
    //   ...statusOptions,
    //   ...watchOptions,
    //   ...envOptions,
    // },
  ],
};
