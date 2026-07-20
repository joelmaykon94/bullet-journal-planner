import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '../.env');
const targetPath = path.resolve(__dirname, '../public/env.js');

let envVars = {};

// 1. Lê as variáveis de ambiente do sistema (Netlify / CI)
Object.keys(process.env).forEach(key => {
  if (key.startsWith('VITE_') || key.startsWith('SUPABASE_') || key.startsWith('SMTP_')) {
    envVars[key] = process.env[key];
  }
});

// 2. Lê do arquivo .env local, se existir (sobrepõe variáveis)
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      envVars[key] = value;
    }
  });
}

const fileContent = `window.env = ${JSON.stringify(envVars, null, 2)};`;

fs.writeFileSync(targetPath, fileContent, 'utf8');
console.log('Environment variables injected into public/env.js');
