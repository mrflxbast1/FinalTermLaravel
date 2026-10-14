import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.resolve(process.argv[2]);
const lock = JSON.parse(readFileSync(path.join(project, 'package-lock.json'), 'utf8'));
const packages = [];

for (const [relativePath, entry] of Object.entries(lock.packages)) {
    if (!relativePath) continue;
    const name = relativePath.replace(/^node_modules\//, '');
    const directory = path.join(project, relativePath);
    if (!existsSync(directory)) continue;
    const destination = path.join(output, 'frontend', name.replace(/[\\/:@]/g, '_'));
    mkdirSync(destination, { recursive: true });

    for (const file of readdirSync(directory, { withFileTypes: true })) {
        if (file.isFile() && /^(LICENSE|LICENCE|COPYING|NOTICE|OFL)/i.test(file.name)) {
            copyFileSync(path.join(directory, file.name), path.join(destination, file.name));
        }
    }
    packages.push({ name, version: entry.version, license: entry.license });
}

writeFileSync(path.join(output, 'frontend-packages.json'), JSON.stringify(packages, null, 2) + '\n');
console.log(`Included license notices for ${packages.length} frontend packages.`);
