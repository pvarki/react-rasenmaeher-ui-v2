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
