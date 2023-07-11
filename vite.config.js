import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from "vite-plugin-dts";
import dsv from '@rollup/plugin-dsv';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), dts(), dsv()],
})
