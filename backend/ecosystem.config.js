module.exports = {
  apps: [
    {
      name: 'taska-backend',
      script: 'dist/server.js',
      instances: process.env.NODE_ENV === 'production' ? 'max' : 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      max_memory_restart: '500M',
      error_file: '/dev/null',
      out_file: '/dev/null',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
