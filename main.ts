import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const poses = ['start', 'drive', 'chase', 'cruise'];
const screenshotNames = poses.map((pose, index) => `${index + 1}-${pose}.png`);
const caps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

function readShotManifest() {
  const path = join(here, 'shots.json');
  if (!existsSync(path)) throw new Error('shots.json is missing');
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    throw new Error(`shots.json is not valid JSON: ${error.message}`);
  }
  if (!manifest || Array.isArray(manifest) || typeof manifest !== 'object' || !Array.isArray(manifest.shots)) {
    throw new Error('shots.json must be an object with a shots array');
  }
  const listed = manifest.shots.map((shot) => {
    if (!shot || typeof shot !== 'object' || typeof shot.name !== 'string' || typeof shot.query !== 'string') return '';
    const pose = new URLSearchParams(shot.query.replace(/^\?/, '')).get('shot') ?? '';
    return shot.name === `${poses.indexOf(pose) + 1}-${pose}.png` ? pose : '';
  });
  if (listed.length !== poses.length || [...listed].sort().join(',') !== [...poses].sort().join(',')) {
    throw new Error(`shots.json must list exactly the poses: ${poses.join(', ')}`);
  }
  return manifest;
}

function copyEntry() {
  mkdirSync(out, { recursive: true });
  cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
  rmSync(join(out, 'screenshots'), { recursive: true, force: true });
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
  const screenshots = checkScreenshots();
  writeFileSync(join(out, 'dossier.json'), buildDossier(out, caps));
  return screenshots;
}

function checkScreenshots() {
  const hashes = new Map();
  let totalBytes = 0;
  for (const name of screenshotNames) {
    const path = join(out, 'screenshots', name);
    if (!existsSync(path)) throw new Error(`missing screenshot ${name}`);
    const bytes = statSync(path).size;
    totalBytes += bytes;
    if (bytes < 40 * 1024 || bytes > 256 * 1024) {
      throw new Error(`screenshot ${name} is ${bytes} bytes; expected 40960-262144`);
    }
    const hash = createHash('sha256').update(readFileSync(path)).digest('hex');
    if (hashes.has(hash)) throw new Error(`screenshot ${name} duplicates ${hashes.get(hash)} (sha256 ${hash})`);
    hashes.set(hash, name);
  }
  return { count: screenshotNames.length, totalBytes };
}

function summarise(screenshots) {
  console.log(`output directory: ${out}`);
  console.log(`screenshots: ${screenshots.count} files, ${screenshots.totalBytes} bytes`);
  console.log(`dossier: ${statSync(join(out, 'dossier.json')).size} bytes`);
}

try {
  readShotManifest();
  summarise(copyEntry());
} catch (error) {
  console.error(`Build failed: ${error.message}`);
  process.exitCode = 1;
}
