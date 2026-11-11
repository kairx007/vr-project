import { defineConfig } from 'vite';

function shotLatencyApi() {
  const handler = (request, response, next) => {
    if (request.method !== 'POST') return next();

    let bodySize = 0;
    let tooLarge = false;
    request.on('data', chunk => {
      bodySize += chunk.length;
      if (bodySize > 1024) tooLarge = true;
    });
    request.on('end', () => {
      if (tooLarge) {
        response.statusCode = 413;
        response.end();
        return;
      }
      response.statusCode = 200;
      response.setHeader('Content-Type', 'application/json');
      response.setHeader('Cache-Control', 'no-store');
      response.end(JSON.stringify({ acknowledgedAt: Date.now() }));
    });
  };

  return {
    name: 'shot-latency-api',
    configureServer(server) {
      server.middlewares.use('/api/shot', handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/shot', handler);
    },
  };
}

export default defineConfig({
  plugins: [shotLatencyApi()],
  server: {
    allowedHosts: ['.trycloudflare.com'],
  },
});
