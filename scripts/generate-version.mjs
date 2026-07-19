import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let hash = '';
try {
  hash = execSync('git rev-parse --short HEAD').toString().trim();
} catch (e) {
  console.log('No git hash found');
}

const adjectives = [
  'Brave', 'Calm', 'Daring', 'Eager', 'Fierce', 'Gentle', 'Happy', 'Jolly', 'Kind', 'Lively',
  'Mighty', 'Noble', 'Proud', 'Quick', 'Rustic', 'Smart', 'Tough', 'Unique', 'Vibrant', 'Wild',
  'Zesty', 'Cosmic', 'Electric', 'Lunar', 'Solar', 'Stellar', 'Atomic', 'Neon', 'Velvet', 'Crystal'
];

const nouns = [
  'Eagle', 'Tiger', 'Panda', 'Dolphin', 'Falcon', 'Lion', 'Wolf', 'Bear', 'Fox', 'Hawk',
  'Koala', 'Leopard', 'Panther', 'Rhino', 'Shark', 'Whale', 'Badger', 'Cobra', 'Dragon', 'Griffin',
  'Phoenix', 'Unicorn', 'Kraken', 'Sphinx', 'Yeti', 'Pegasus', 'Cyborg', 'Ninja', 'Robot', 'Wizard'
];

function generateCodeName(hashStr) {
  if (!hashStr) return 'Unknown Origin';
  let num = parseInt(hashStr, 16);
  if (isNaN(num)) num = Math.floor(Math.random() * 1000000);
  const adj = adjectives[num % adjectives.length];
  const noun = nouns[(Math.floor(num / adjectives.length)) % nouns.length];
  return `${adj} ${noun}`;
}

const timestamp = new Date().toLocaleString('pt-BR');
const codeName = generateCodeName(hash);
const versionString = hash ? `${codeName} (${hash})` : `Unknown (${timestamp})`;

const versionInfo = `export const environment = {
  version: '${versionString}'
};
`;

const dir = path.resolve(__dirname, '../src/environments');
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

fs.writeFileSync(path.resolve(dir, 'version.ts'), versionInfo.trim() + '\n');
console.log(`Version generated: ${versionString}`);
