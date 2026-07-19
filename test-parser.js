const fs = require('fs');
const code = fs.readFileSync('apps/frontend/src/app/utils/smartParser.ts', 'utf8');
const ts = require('typescript');
const js = ts.transpileModule(code, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
fs.writeFileSync('temp_parser.js', js);
const { parseSmartTask } = require('./temp_parser.js');
console.log(parseSmartTask("Reunião 15:00"));
console.log(parseSmartTask("Dentista 14h"));
