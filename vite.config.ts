import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxy = {
    '/api': {
      target: env.VITE_API_PROXY_TARGET || 'http://localhost:8080',
      changeOrigin: true,
    },
  }

  return {
    // React Compiler improves the production bundle, but running Babel over
    // every source module makes cold route loads unnecessarily slow in dev.
    plugins: [
      react(),
      ...(command === 'build' ? [babel({ presets: [reactCompilerPreset()] })] : []),
    ],
    optimizeDeps: {
      // Lazy roots otherwise make Vite discover packages after the dev server
      // is already serving pages. That invalidates the first dependency hash
      // and leaves open tabs with `504 Outdated Optimize Dep` responses.
      noDiscovery: true,
      include: [
        'react',
        'react-dom',
        'react-dom/client',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'gsap',
        'gsap/DrawSVGPlugin',
        'gsap/Draggable',
        'gsap/InertiaPlugin',
        'gsap/ScrollTrigger',
        'lenis',
        'matter-js',
      ],
    },
    // Bind one dual-stack socket. On Windows, `localhost` requests may use
    // IPv4 or IPv6 on different browser connections.
    server: { host: '::', proxy },
    preview: { host: '::', proxy },
  }
})
