module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'chore', 'docs', 'test', 'refactor', 'perf', 'ci', 'revert'],
    ],
    'scope-enum': [
      2,
      'always',
      [
        'api', 'web', 'mobile',
        'conductor', 'gatekeeper', 'school-admin',
        'shared-types', 'ui-kit',
        'auth', 'tenants', 'schools', 'students',
        'fleet', 'telemetry', 'tracking', 'attendance',
        'notifications', 'reports', 'billing',
        'database', 'infra', 'ci', 'docs',
      ],
    ],
    'subject-max-length': [2, 'always', 100],
  },
};
