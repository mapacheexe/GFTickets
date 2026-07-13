module.exports = {
  extends: ['@commitlint/config-conventional'],

  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'feature', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert']
    ],
    'scope-empty': [2, 'always']
  }
};
