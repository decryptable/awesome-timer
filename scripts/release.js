const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get version from command line arguments
const args = process.argv.slice(2);
let version = args[0];

if (!version) {
  console.error('Please provide a version number (e.g. npm run release 1.0.1)');
  process.exit(1);
}

// Add 'v' prefix if not present
if (!version.startsWith('v')) {
  version = `v${version}`;
}

// Update version in package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
packageJson.version = version.substring(1); // Remove 'v' prefix for package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

// Update version in Cargo.toml
const cargoTomlPath = path.join(__dirname, '..', 'src-tauri', 'Cargo.toml');
let cargoToml = fs.readFileSync(cargoTomlPath, 'utf8');
cargoToml = cargoToml.replace(/version = "([^"]+)"/, `version = "${version.substring(1)}"`);
fs.writeFileSync(cargoTomlPath, cargoToml);

// Update version in tauri.conf.json
const tauriConfPath = path.join(__dirname, '..', 'src-tauri', 'tauri.conf.json');
const tauriConf = JSON.parse(fs.readFileSync(tauriConfPath, 'utf8'));
tauriConf.package.version = version.substring(1);
fs.writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2) + '\n');

// Commit changes
try {
  execSync('git add package.json src-tauri/Cargo.toml src-tauri/tauri.conf.json');
  execSync(`git commit -m "chore: bump version to ${version}"`);
  execSync(`git tag ${version}`);
  console.log(`Version bumped to ${version} and changes committed.`);
  console.log('To push changes and trigger a release build, run:');
  console.log('  git push && git push --tags');
} catch (error) {
  console.error('Error committing changes:', error.message);
  process.exit(1);
}
