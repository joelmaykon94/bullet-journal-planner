const fs = require('fs');
const code = fs.readFileSync('apps/frontend/src/app/utils/smartParser.ts', 'utf8');
const ts = require('typescript');
const js = ts.transpileModule(code, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
fs.writeFileSync('temp_parser.cjs', js);
const { parseSmartTask } = require('./temp_parser.cjs');
console.log("TEST 1", parseSmartTask("Reunião 15:00"));
console.log("TEST 2", parseSmartTask("Dentista 14h"));
