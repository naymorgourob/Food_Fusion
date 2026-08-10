import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import globals from 'globals'

export default [
  { ignores: ['src/generated'] },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.node },
    },
    rules: {
      'no-console': 'off', // server-side logging is expected (see morgan + errorHandler)
      // Allows the `const { password: _password, ...rest } = user` pattern
      // used to strip a field from an object without a separate library.
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  prettier, // must stay last — turns off any ESLint rule that fights Prettier's formatting
]
