module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [2, "always", ["feat", "fix", "refactor", "perf", "test", "docs", "chore", "ci", "build"]],
    "scope-enum": [2, "always", ["blog", "admin", "content", "seo", "analytics", "ui", "db", "repo"]],
    "scope-empty": [2, "never"],
    "subject-case": [0],
  },
};
