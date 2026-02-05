module.exports = {
  apps: [{
    name: 'user-front',
    script: 'npm',
    args: 'start -- -p 3001',
    cwd: '/var/www/islamic-user-front',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3001,
      NEXT_PUBLIC_API_URL: 'http://localhost:3000',
      NEXTAUTH_URL: 'http://localhost:3001'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001,
      NEXT_PUBLIC_API_URL: 'http://localhost:3000',
      NEXTAUTH_URL: 'http://localhost:3001'
    },
    log_file: '/var/log/pm2/user-front.log',
    out_file: '/var/log/pm2/user-front-out.log',
    error_file: '/var/log/pm2/user-front-error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    max_memory_restart: '1G',
    min_uptime: '10s',
    max_restarts: 10,
    watch: false,
    ignore_watch: ['node_modules', 'logs', '*.log'],
    merge_logs: true,
    time: true
  }]
};
