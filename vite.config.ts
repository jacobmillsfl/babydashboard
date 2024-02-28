import react from '@vitejs/plugin-react';
import { UserConfig, ConfigEnv } from 'vite';
import { join } from 'path';

const srcRoot = join(__dirname, 'src');

export default ({ command }: ConfigEnv): UserConfig => {
  // DEV
  if (command === 'serve') {
    return {
      root: srcRoot,
      base: '/',
      plugins: [react()],
      resolve: {
        alias: {
          '/@': srcRoot
        }
      },
      build: {
        outDir: join(srcRoot, '/out'),
        emptyOutDir: true,
        rollupOptions: {}
      },
      server: {
        port: process.env.PORT === undefined ? 3000 : +process.env.PORT
      },
      optimizeDeps: {
        exclude: ['path'],
      },
      define: {
        // Define environment variables for use in client-side code
        'process.env': {
          API_KEY: process.env.API_KEY,
          FIREBASE_KEY: process.env.FIREBASE_KEY,
        }
      },
    };
  }
  // PROD
  return {
    root: srcRoot,
    base: './',
    plugins: [react()],
    resolve: {
      alias: {
        '/@': srcRoot
      }
    },
    build: {
      outDir: join(srcRoot, '/out'),
      emptyOutDir: true,
      rollupOptions: {}
    },
    server: {
      port: process.env.PORT === undefined ? 3000 : +process.env.PORT
    },
    optimizeDeps: {
      exclude: ['path'],
    },
    define: {
      // Define environment variables for use in client-side code
      'process.env': {
        API_KEY: process.env.API_KEY,
        FIREBASE_KEY: process.env.FIREBASE_KEY,
      }
    },
  };
};
