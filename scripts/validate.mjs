import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const htmlFiles = ['index.html', '404.html'];
const requiredFiles = ['index.html', 'style.css', 'script.js', 'favicon.svg', '.nojekyll'];
const errors = [];

for (const file of requiredFiles) {
  const absolute = resolve(root, file);
  if (!existsSync(absolute)) errors.push(`Отсутствует обязательный файл: ${file}`);
}

const isLocalReference = (value) =>
  value &&
  !value.startsWith('#') &&
  !value.startsWith('data:') &&
  !value.startsWith('http://') &&
  !value.startsWith('https://') &&
  !value.startsWith('mailto:') &&
  !value.startsWith('tel:');

for (const htmlFile of htmlFiles) {
  const absoluteHtml = resolve(root, htmlFile);
  if (!existsSync(absoluteHtml)) continue;
  const html = readFileSync(absoluteHtml, 'utf8');
  const ids = [...html.matchAll(/\sid=["']([^"']+)["']/g)].map((match) => match[1]);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicateIds.length) errors.push(`${htmlFile}: повторяющиеся id: ${[...new Set(duplicateIds)].join(', ')}`);

  for (const match of html.matchAll(/<(?:img|script|link)\b[^>]*\b(?:src|href)=["']([^"']+)["'][^>]*>/g)) {
    const reference = match[1].split(/[?#]/, 1)[0];
    if (!isLocalReference(reference)) continue;
    const target = resolve(dirname(absoluteHtml), reference);
    if (!existsSync(target)) {
      errors.push(`${htmlFile}: не найден ресурс ${reference}`);
    } else if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'].includes(extname(target).toLowerCase()) && statSync(target).size === 0) {
      errors.push(`${htmlFile}: изображение пустое ${reference}`);
    }
  }

  for (const match of html.matchAll(/<img\b([^>]*)>/g)) {
    if (!/\balt=["'][^"']*["']/.test(match[1])) errors.push(`${htmlFile}: изображение без alt`);
  }
}

const script = readFileSync(resolve(root, 'script.js'), 'utf8');
try {
  new Function(script);
} catch (error) {
  errors.push(`script.js: синтаксическая ошибка: ${error.message}`);
}

if (errors.length) {
  console.error(`Проверка не пройдена (${errors.length}):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}

console.log('Проверка пройдена: структура, ресурсы, id, alt и синтаксис JavaScript корректны.');
