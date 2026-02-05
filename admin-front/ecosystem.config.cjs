module.exports = {
  apps: [
    {
      name: 'admin-front',
      script: 'serve',
      args: '-s dist -l 5173',
      cwd: '/var/www/islamic-admin-front',
      instances: 2,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 5173
      },
      error_file: '/var/log/pm2/admin-front-error.log',
      out_file: '/var/log/pm2/admin-front-out.log',
      log_file: '/var/log/pm2/admin-front-combined.log',
      time: true
    }
  ]
};

