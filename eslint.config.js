import {
  REACT
} from "@mt-kit/eslint-config";

export default [
  ...REACT,
  {
    ignores: [
      ".react-router/**",
      "build/**",
      "node_modules/**"
    ]
  },
  {
    files: [
      "app/root.tsx",
      "app/hooks/**/*.tsx",
      "app/pages/**/*.tsx"
    ],
    rules: {
      "no-duplicate-imports": "off",
      "react-refresh/only-export-components": "off"
    }
  },
  {
    rules: {
      "no-duplicate-imports": "off",
      "unicorn/consistent-compound-words": "off"
    }
  }
];
