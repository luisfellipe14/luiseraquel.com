import { cpSync, existsSync, lstatSync, mkdirSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { siteConfig } from '../site.config.ts';

const root = realpathSync(join(dirname(fileURLToPath(import.meta.url)), '..'));
const client = join(root, 'dist', 'client');
const output = join(root, 'dist', 'pages');
const prefix = siteConfig.basePath.replace(/^\//, '');
if (prefix.includes('..') || prefix.includes('\\')) throw new Error('Invalid Pages prefix');
const chunks = join(client, prefix, '_next');
for (const path of [join(client, 'index.html'), chunks]) {
  if (!existsSync(path)) throw new Error(`Incomplete static build: ${path}`);
}
// Delete only this generated directory, with its resolved boundary checked.
if (existsSync(output)) {
  if (lstatSync(output).isSymbolicLink() || realpathSync(output) !== resolve(root, 'dist', 'pages')) {
    throw new Error('Refusing unexpected output directory');
  }
  rmSync(output, { recursive: true });
}
mkdirSync(output, { recursive: true });
cpSync(join(root, 'public'), output, { recursive: true });
cpSync(join(root, '.gitattributes'), join(output, '.gitattributes'));
cpSync(chunks, join(output, '_next'), { recursive: true });
for (const file of ['index.html', 'index.rsc', '404.html']) {
  cpSync(join(client, file), join(output, file));
}
writeFileSync(join(output, '.nojekyll'), '');
console.log('GitHub Pages export prepared in dist/pages');
