// pm2 process definition — for self-hosting on your own PC/VPS without Docker.
// Usage: npx pm2 start ecosystem.config.js
'use strict';

module.exports = {
  apps: [
    {
      name: 'peachy-quest-bot',
      script: 'src/index.js',
      cwd: __dirname,
      env: { NODE_ENV: 'production' },
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,
      // Restart if it somehow balloons in memory (shouldn't happen for this bot).
      max_memory_restart: '200M',
    },
  ],
};
