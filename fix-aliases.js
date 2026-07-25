// یک‌بار مصرف: تبدیل import های '@/...' به مسیر نسبی
// اجرا: node fix-aliases.js
// این فایل رو توی ریشه‌ی پروژه (کنار package.json) بذار و اجرا کن

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.resolve(__dirname, 'src');

function walk(dir, filelist = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, filelist);
    } else if (
      entry.isFile() &&
      /\.ts$/.test(entry.name) &&
      !entry.name.endsWith('.d.ts')
    ) {
      filelist.push(full);
    }
  }
  return filelist;
}

function toRelative(fromFile, aliasPath) {
  const target = path.join(SRC_DIR, aliasPath.replace(/^@\//, ''));
  let rel = path.relative(path.dirname(fromFile), target);
  if (!rel.startsWith('.')) rel = './' + rel;
  return rel.split(path.sep).join('/');
}

if (!fs.existsSync(SRC_DIR)) {
  console.error('پوشه src پیدا نشد. مطمئن شو این اسکریپت رو کنار package.json اجرا می‌کنی.');
  process.exit(1);
}

const files = walk(SRC_DIR);
// هم import ... from '@/...' و هم require('@/...') رو پوشش می‌ده
const importRegex = /(from\s+|require\(\s*)['"](@\/[^'"]+)['"]/g;

let changedFiles = 0;
let changedImports = 0;

for (const file of files) {
  const original = fs.readFileSync(file, 'utf8');
  let fileChanged = false;

  const updated = original.replace(importRegex, (match, prefix, aliasPath) => {
    fileChanged = true;
    changedImports++;
    const rel = toRelative(file, aliasPath);
    return `${prefix}'${rel}'`;
  });

  if (fileChanged) {
    fs.writeFileSync(file, updated, 'utf8');
    changedFiles++;
    console.log('✔ updated:', path.relative(process.cwd(), file));
  }
}

console.log(`\nتمام شد. ${changedImports} مورد import در ${changedFiles} فایل تغییر کرد.`);
console.log('حتماً دیف رو با git diff چک کن قبل از commit.');