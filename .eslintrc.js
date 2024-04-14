module.exports = {
  "env": {
    "es6": false,
    "browser": true,
    "es2021": true,
    "node": true,
    "jest": true,
    "jquery": false
  },
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 8,
    ecmaFeatures: {
      jsx: true,
    },  
  },
  "overrides": [
    {
      "files": ["js/*.js"],
      "rules": {
        "@typescript-eslint/no-floating-promises": "warn"
      },
      "parserOptions": {
        "project": ["./tsconfig.json"]
      },
      "rules": {
        "require-await": "warn"
      }
    }
  ]

}