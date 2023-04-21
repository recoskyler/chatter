module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 2019,
    sourceType: "module",
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
    extraFileExtensions: ['.svelte'],
  },
  plugins: [
    "svelte3",
    "@typescript-eslint"
  ],
  settings: {
    "svelte3/typescript": true
  },
  overrides: [
    {
      files: [
        "*.svelte"
      ],
      processor: "svelte3/svelte3"
    }
  ],
  rules: {
    indent: [
      "error",
      2,
      {
        SwitchCase: 1
      }
    ],
    "linebreak-style": [
      "error",
      "unix"
    ],
    "quotes": [
      "error",
      "double"
    ],
    "semi": [
      "error",
      "always"
    ],
    "array-bracket-spacing": [
      "error",
      "always"
    ],
    "object-curly-spacing": [
      "error",
      "always"
    ],
    'comma-dangle': [
      "error",
      "always-multiline"
    ],
    "spaced-comment": [
      "error",
      "always",
      {
        markers: [
          "!",
          "/",
          "*",
          "?"
        ]
      }
    ],
    "curly": [
      "error",
      "multi-line"
    ],
    "brace-style": [
      "error",
      "1tbs",
      {
        allowSingleLine: true
      }
    ],
    "arrow-parens": [
      "error",
      "as-needed"
    ],
    "new-parens": [
      "error",
      "never"
    ],
    "space-in-parens": [
      "error",
      "never"
    ],
    "nonblock-statement-body-position": [
      "error",
      "any"
    ],
    "no-unused-vars": [
      "error",
      {
        vars: "all",
        args: "after-used",
        ignoreRestSiblings: false,
        argsIgnorePattern: "^_"
      }
    ],
    "max-len": [
      "error",
      {
        code: 100,
        tabWidth: 2,
        comments: 65,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreRegExpLiterals: true,
        ignoreComments: true
      }
    ],
    "space-infix-ops": "error",
    "space-before-function-paren": [
      "error",
      {
        anonymous: "always",
        named: "never",
        asyncArrow: "never"
      }
    ],
    "template-curly-spacing": [
      "error",
      "always"
    ],
    "object-curly-newline": [
      "error",
      {
        ObjectExpression: {
          multiline: true
        },
        ObjectPattern: {
          multiline: true
        },
        ImportDeclaration: {
          multiline: true,
          minProperties: 3
        },
        ExportDeclaration: {
          multiline: true,
          minProperties: 3
        }
      }
    ],
    "react/jsx-indent": [
      2,
      2,
      {
        checkAttributes: true,
        indentLogicalExpressions: true
      }
    ],
    "react/jsx-tag-spacing": [
      "error",
      {
        beforeSelfClosing: "always"
      }
    ],
    "no-use-before-define": "error",
    "comma-spacing": "error",
    "keyword-spacing": "error",
    "key-spacing": "error",
    "@typescript-eslint/no-non-null-assertion": "warn",
    "padding-line-between-statements": [
      "error",
      {
        blankLine: "always",
        prev: "*",
        next: "block"
      },
      {
        blankLine: "always",
        prev: "block",
        next: "*"
      },
      {
        blankLine: "always",
        prev: "*",
        next: "block-like"
      },
      {
        blankLine: "always",
        prev: "block-like",
        next: "*"
      }
    ],
    "@typescript-eslint/no-unused-vars": "off",
    "prefer-destructuring": [
      "error",
      {
        array: true,
        object: true
      },
      {
        enforceForRenamedProperties: false
      }
    ],
    "@typescript-eslint/type-annotation-spacing": "error",
    "space-before-blocks": "error",
    "block-spacing": "error",
    "prefer-const": "error"
  }
};
