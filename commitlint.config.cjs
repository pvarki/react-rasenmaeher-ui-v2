/**
 * Commitlint configuration.
 *
 * Extends the conventional commit preset and customises the allowed commit types
 * and subject length.  This ensures that commit messages remain consistent and
 * descriptive across the repository.
 *
 * Scope format: mod-ui/<shortened-task-name>
 * Example: feat(mod-ui/translations): added translations
 */
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "chore",
        "docs",
        "style",
        "refactor",
        "test",
        "ci",
        "perf",
        "revert",
      ],
    ],
    "subject-case": [0],
    "scope-case": [0], // Disabled to allow mod-ui/task-name format
    "scope-empty": [1, "never"], // Warn if scope is missing
    "scope-enum": [0], // Disabled to allow flexible task names
    "subject-max-length": [2, "always", 72],
    "body-leading-blank": [1, "always"],
    "footer-leading-blank": [1, "always"],
  },
};
