import fs from 'fs';
import path from 'path';
import postcss from 'postcss';
import tailwind from '@tailwindcss/postcss';

async function buildCss() {
  const cssPath = path.resolve('src/styles.css');
  const outPath = path.resolve('src/compiled-styles.css');

  const css = fs.readFileSync(cssPath, 'utf8');
  const result = await postcss([tailwind()]).process(css, { from: cssPath });

  fs.writeFileSync(outPath, result.css);
  console.log(`[CSS Builder] Tailwind CSS compiled successfully (${result.css.length} bytes -> ${outPath})`);
}

buildCss().catch(err => {
  console.error('[CSS Builder Error]:', err);
  process.exit(1);
});
