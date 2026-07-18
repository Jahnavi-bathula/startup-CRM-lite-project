const buildAllowedOrigins = () => {
  const origins = [
    'https://startup-crm-lite-project-xi.vercel.app',
    'http://localhost:5173',
    'http://localhost:5174'
  ];

  if (process.env.FRONTEND_URL) {
    process.env.FRONTEND_URL
      .split(',')
      .forEach((o) => origins.push(o.trim()));
  }

  return [...new Set(origins)];
};