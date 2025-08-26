import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/metaverso/', // Asegúrate de que esta ruta sea correcta
});
