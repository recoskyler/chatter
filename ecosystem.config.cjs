module.exports = {
  apps: [{
    name: "chatter",
    script: "npm",
    args: "start",
    autorestart: true,
    restart_delay: 1000,
    instances: 1,
    combine_logs: true,
    max_restarts: 10,
    env: {
      NODE_ENV: "production",
      HOST: "127.0.0.1",
      PORT: "8224",
      ORIGIN: "https://chatter.recoskyler.com",
      PROTOCOL_HEADER: "x-forwarded-proto",
      HOST_HEADER: "x-forwarded-host",
    }
  }],
};
