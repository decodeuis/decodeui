import { defineConfig } from "@solidjs/start/config";
// import devtools from 'solid-devtools/vite';

export default defineConfig({
  middleware: "./src/middleware.ts",
  // server: {
  //   preset: "deno",
  // },
  vite: {
    server: {
      //  If set to true, the server is allowed to respond to requests for any hosts.
      allowedHosts: true,
    },
    build: {
      rollupOptions: {
        external: ["node:async_hooks"], // Mark node:async_hooks as external to prevent browser compatibility issues
      },
    },
    optimizeDeps: {
      exclude: ["node:async_hooks"], // Exclude node:async_hooks from optimization to fix build error
    },
    // dev: {
    //   force: false,
    //   https: false,
    //   port: 3001,
    //   devtools: true,
    //   ws: {
    //     port: 1100
    //   }
    // },
    // },
    // server: {
    // https: {
    // cert: "/etc/letsencrypt/live/decodeui.io/fullchain.pem",
    // key: "/etc/letsencrypt/live/decodeui.io/privkey.pem",
    // },
    // port: 36075, // Change this to the desired port number for the server
    // hmr: {
    //   protocol: "wss",
    //   port: 2900, // Change this to the desired port number for HMR
    // },
    // },
    plugins: [
      // monaco-editor gives error in devtools
      // devtools({
      //   /* features options - all disabled by default */
      //   autoname: true,
      // }),
    ],
  },
});
