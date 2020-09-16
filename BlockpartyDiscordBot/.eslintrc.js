module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: ['airbnb-base'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint'],
  rules: {
    semi: [2, 'never'],
    'max-len': [2, 160],
    'no-console': 'off',
    'import/prefer-default-export': 'off',
    'comma-dangle': ['error', 'never']
  },
  settings: {
    'import/resolver': {
      alias: [
        ['@aws-helper', './build/aws-helper'],
        ['@config-helper', './build/config-helper'],
        ['@constants', './build/constants'],
        ['@discord-helper', './build/discord-helper'],
        ['@rcon-helper', './build/rcon-helper']
      ]
    }
  }
}
