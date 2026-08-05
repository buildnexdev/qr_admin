import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  const facitEnv: Record<string, string> = {
    REACT_APP_MODERN_DESGIN: env.VITE_MODERN_DESIGN ?? 'true',
    REACT_APP_ASIDE_TOUCH_STATUS: env.VITE_ASIDE_TOUCH_STATUS ?? 'true',
    REACT_APP_DARK_MODE: env.VITE_DARK_MODE ?? 'false',
    REACT_APP_MOBILE_BREAKPOINT_SIZE: env.VITE_MOBILE_BREAKPOINT_SIZE ?? '768',
    REACT_APP_ASIDE_MINIMIZE_BREAKPOINT_SIZE: env.VITE_ASIDE_MINIMIZE_BREAKPOINT_SIZE ?? '1024',
    REACT_APP_ASIDE_WIDTH_PX: env.VITE_ASIDE_WIDTH_PX ?? '240',
    REACT_APP_SPACER_PX: env.VITE_SPACER_PX ?? '16',
    REACT_APP_META_DESC: env.VITE_META_DESC ?? 'NammaQr',
    REACT_APP_PRIMARY_COLOR: env.VITE_PRIMARY_COLOR ?? '#2d5cfe',
    REACT_APP_SECONDARY_COLOR: env.VITE_SECONDARY_COLOR ?? '#ffa2c0',
    REACT_APP_SUCCESS_COLOR: env.VITE_SUCCESS_COLOR ?? '#46bcaa',
    REACT_APP_INFO_COLOR: env.VITE_INFO_COLOR ?? '#4d69fa',
    REACT_APP_WARNING_COLOR: env.VITE_WARNING_COLOR ?? '#ffcf52',
    REACT_APP_DANGER_COLOR: env.VITE_DANGER_COLOR ?? '#f35421',
    REACT_APP_LIGHT_COLOR: env.VITE_LIGHT_COLOR ?? '#e7eef8',
    REACT_APP_DARK_COLOR: env.VITE_DARK_COLOR ?? '#1f2128',
  }

  const define = Object.fromEntries(
    Object.entries(facitEnv).map(([key, value]) => [
      `process.env.${key}`,
      JSON.stringify(value),
    ]),
  )

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define,
    optimizeDeps: {
      include: [
        'react-number-format',
        'react-input-mask',
        'pascalcase',
        'classnames',
        'framer-motion',
        'react-use',
        'react-jss',
        'formik',
        'react-popper',
        '@popperjs/core',
      ],
    },
    css: {
      preprocessorOptions: {
        scss: {
          quietDeps: true,
          silenceDeprecations: ['import', 'color-functions', 'global-builtin'],
        },
      },
    },
  }
})
