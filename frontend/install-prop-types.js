const { execSync } = require('child_process');
const fs = require('fs');
try {
    console.log('Running npm install prop-types react-is...');
    const out = execSync('npm install prop-types react-is --no-save', { encoding: 'utf-8' });
    fs.writeFileSync('install.log', out);
} catch (e) {
    fs.writeFileSync('install.log', e.stdout + '\n' + e.stderr + '\n' + e.message);
}
console.log('Done.');
