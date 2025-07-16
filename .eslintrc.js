module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    electron: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ],
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 12,
    sourceType: 'module',
    requireConfigFile: false,
    babelOptions: {
      presets: ['@babel/preset-react']
    }
  },
  plugins: [
    'react',
    'react-hooks'
  ],
  rules: {
    // General JavaScript rules
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-undef': 'error',
    'no-redeclare': 'error',
    'no-duplicate-imports': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    
    // React specific rules
    'react/react-in-jsx-scope': 'off', // Not needed with React 17+
    'react/prop-types': 'warn',
    'react/no-unused-prop-types': 'warn',
    'react/no-unknown-property': 'error',
    'react/jsx-uses-react': 'off', // Not needed with React 17+
    'react/jsx-uses-vars': 'error',
    'react/jsx-key': 'error',
    'react/jsx-no-duplicate-props': 'error',
    'react/jsx-no-undef': 'error',
    'react/jsx-pascal-case': 'error',
    
    // React Hooks rules
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // Code style
    'indent': ['error', 2, { SwitchCase: 1 }],
    'quotes': ['error', 'single', { avoidEscape: true }],
    'semi': ['error', 'always'],
    'comma-dangle': ['error', 'never'],
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
    'space-before-function-paren': ['error', {
      anonymous: 'always',
      named: 'never',
      asyncArrow: 'always'
    }],
    
    // Best practices
    'eqeqeq': ['error', 'always'],
    'curly': ['error', 'all'],
    'brace-style': ['error', '1tbs'],
    'no-trailing-spaces': 'error',
    'eol-last': 'error',
    'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],
    
    // Security
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error'
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  overrides: [
    {
      files: ['**/*.test.js', '**/*.spec.js'],
      env: {
        jest: true
      },
      rules: {
        'no-console': 'off'
      }
    },
    {
      files: ['src/main.js', 'src/preload.js'],
      env: {
        node: true,
        browser: false
      },
      rules: {
        'no-console': 'off'
      }
    }
  ]
};