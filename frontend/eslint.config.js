import { defineConfig, globalIgnores } from 'eslint/config'
import { tanstackConfig } from '@tanstack/eslint-config'
import pluginReact from 'eslint-plugin-react'

export default defineConfig([
  globalIgnores(['src/generated/', 'dist/', '*.config.js']),
  ...tanstackConfig,
  {
    plugins: {
      react: pluginReact,
    },
    rules: {
      'react/jsx-no-literals': 'error',
      '@typescript-eslint/array-type': ['error', { default: 'array' }],
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-deprecated': 'error',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    files: ['**/*.test.@(ts|tsx)'],
    rules: {
      'react/jsx-no-literals': 'off',
    },
  },
])
