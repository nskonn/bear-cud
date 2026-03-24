import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');

  const apiHost = env.VITE_API_HOST || 'http://localhost:4000';

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, ''),
      },
    },
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: apiHost,
          changeOrigin: true,
        },
      },
    },
  };
});
