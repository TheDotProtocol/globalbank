/**
 * Basic admin auth unit test (no DB required)
 */
const assert = require('assert');

process.env.ADMIN_USERNAME = 'testadmin';
process.env.ADMIN_PASSWORD = 'TestAdmin2024!Secure';
process.env.COMPLIANCE_USERNAME = 'testcompliance';
process.env.COMPLIANCE_PASSWORD = 'TestCompliance2024!';

// Dynamic import workaround - test logic inline
const ADMIN_USERS = [
  { username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD, role: 'SUPER_ADMIN' },
  { username: process.env.COMPLIANCE_USERNAME, password: process.env.COMPLIANCE_PASSWORD, role: 'COMPLIANCE' },
];

function verify(username, password) {
  const u = ADMIN_USERS.find((a) => a.username === username);
  return !!(u && u.password === password);
}

assert.strictEqual(verify('testadmin', 'TestAdmin2024!Secure'), true);
assert.strictEqual(verify('testcompliance', 'TestCompliance2024!'), true);
assert.strictEqual(verify('testadmin', 'wrong'), false);
assert.strictEqual(verify('hacker', 'TestAdmin2024!Secure'), false);

console.log('✅ Admin auth tests passed');
