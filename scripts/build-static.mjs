import { cp, mkdir, readdir, rm, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';

const root = process.cwd();
const output = join(root, 'dist');
const rootExtensions = new Set(['.html', '.js', '.css', '.mp4', '.ico', '.txt', '.xml']);
const assetExtensions = new Set(['.jpg', '.jpeg', '.webp', '.svg']);

async function copyFile(relativePath) {
  const source = join(root, relativePath);
  const target = join(output, relativePath);
  await mkdir(join(target, '..'), { recursive: true });
  await cp(source, target);
}

async function copyDirectory(relativePath, extensions = null) {
  const source = join(root, relativePath);
  const entries = await readdir(source, { withFileTypes: true });
  for (const entry of entries) {
    const child = join(relativePath, entry.name);
    if (entry.isDirectory()) {
      await copyDirectory(child, extensions);
    } else if (!extensions || extensions.has(extname(entry.name).toLowerCase())) {
      await copyFile(child);
    }
  }
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const entry of await readdir(root, { withFileTypes: true })) {
  if (!entry.isFile()) continue;
  if (entry.name === 'hero-bg.mp4') continue;
  if (rootExtensions.has(extname(entry.name).toLowerCase())) await copyFile(entry.name);
}

for (const directory of ['account', 'admin', 'auth', 'js']) {
  await copyDirectory(directory);
}
await copyDirectory('img', assetExtensions);

const outputSize = await stat(output);
console.log(`Prepared static site in ${outputSize.isDirectory() ? 'dist/' : output}`);
