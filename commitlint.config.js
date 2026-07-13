module.exports = {
  extends: ['@commitlint/config-conventional'],

  rules: {
    'header-pattern': [
      2,
      'always',
      /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([A-Z]+-\d+\))?!?: .+$/
    ],

    'header-pattern-error': [
      2,
      'always',
      'Commit must follow: feat(PROJ-123): description'
    ]
  }
};