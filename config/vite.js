const Path = require('path');
const vuePlugin = require('@vitejs/plugin-vue')

const { defineConfig } = require('vite');

/**
 * https://vitejs.dev/config
 */
const config = defineConfig({
    root: Path.join(__dirname, '..', '..', 'client'),
    publicDir: 'public',
    server: {
        port: 8080,
    },
    open: false,
    build: {
        minify: "esbuild",
        target: "esnext",
        outDir: Path.join(__dirname, '..', '..', '..', 'dist', 'renderer'),
        emptyOutDir: true,
    },
    plugins: [vuePlugin()],
});

module.exports = config;