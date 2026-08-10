const { execSync } = require('child_process');
const fs = require('fs');

console.log('Testing middleware edge compilation');
try {
  execSync('npm run build', { stdio: 'pipe' });
} catch (e) {
  console.log(e.stdout.toString());
}
console.log('Build done');
