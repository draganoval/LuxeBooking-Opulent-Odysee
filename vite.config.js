import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'src/pages/index.html'),
        hotels: resolve(__dirname, 'src/pages/hotels.html'),
        destinations: resolve(__dirname, 'src/pages/destinations.html'),
        adventures: resolve(__dirname, 'src/pages/adventures.html'),
        bookings: resolve(__dirname, 'src/pages/bookings.html'),
        user: resolve(__dirname, 'src/pages/user.html'),
        admin: resolve(__dirname, 'src/pages/admin.html'),
        login: resolve(__dirname, 'src/pages/login.html'),
        register: resolve(__dirname, 'src/pages/register.html')
      }
    }
  }
});
