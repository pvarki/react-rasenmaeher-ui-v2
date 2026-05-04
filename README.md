# React + TypeScript + Vite

## Git Conventions

### Feature Branches

Use feature branches for all development work. Name them like `modular-ui/<shortened-task-name>-dev`.

**Example:**

```bash
git checkout -b modular-ui/translations-dev
```

### Conventional Commits

This project uses [Conventional Commits](https://cheatography.com/finuex/cheat-sheets/conventional-commits-1-0/) with a specific scope format.

**Scope format:** `(mod-ui/<shortened-task-name>)`

**Examples:**

```bash
feat(mod-ui/translations): added translations
fix(mod-ui/auth): resolved login timeout issue
docs(mod-ui/api): updated API documentation
```

Keep commit descriptions short but descriptive enough for others to understand what was done.

### Code Quality

- Avoid accumulating 300+ `#FIXME` or `#TODO` comments
- If you need to add a temporary fix or TODO, create a GitHub issue and link to it
- Fix issues immediately rather than deferring them

**Recommended reading:** [Git Best Practices](https://github.com/pvarki/markdown-pvarki-best_practises/blob/main/git.md)

### Versioning

Versioning is handled with [bump-my-version](https://github.com/callowayproject/bump-my-version). To increment, use `bump-my-version bump <patch/minor/major>`.

You can use `bump-my-version show-bump` to see how each option would affect the version.

---

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

#### Pre-Commit

Hooks are managed via [prek](https://github.com/j178/prek) using the shared
config from
[pvarki/config-ci-library](https://github.com/pvarki/config-ci-library/tree/typescript-config).
prek is included as a dev dependency, so after `pnpm install` run:

```bash
pnpm exec prek install
```

To run all hooks against every file:

```bash
pnpm exec prek run --all-files
```

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
