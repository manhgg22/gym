module.exports = {
    apps: [
        {
            name: "workout-backend",
            script: "./server.js",
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: "300M",
            env: {
                NODE_ENV: "production",
            },
        },
        {
            name: "workout-bot",
            script: "./bot.js",
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: "200M",
        },
        {
            name: "workout-notify",
            script: "./notify.js",
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: "200M",
        },
    ],
};
