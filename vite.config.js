import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  envDir: process.cwd(),
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        hotels: resolve(__dirname, 'hotels.html'),
        destinations: resolve(__dirname, 'destinations.html'),
        adventures: resolve(__dirname, 'adventures.html'),
        bookings: resolve(__dirname, 'bookings.html'),
        user: resolve(__dirname, 'user.html'),
        admin: resolve(__dirname, 'admin.html'),
        login: resolve(__dirname, 'login.html'),
        register: resolve(__dirname, 'register.html')
      }
    }
  }
});
