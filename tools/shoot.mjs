import puppeteer from '/home/ubuntu/.hermes/skills/bang-motion/node_modules/puppeteer/lib/puppeteer/puppeteer.js';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import process from 'node:process';

const root = process.cwd();
const port = 4173;
const poses = ['start', 'drive', 'chase', 'cruise'];
const server = spawn('python3', ['-m', 'http.server', String(port)], { cwd: `${root}/game`, stdio: ['ignore', 'pipe', 'pipe'] });
server.stderr.on('data', data => process.stderr.write(`[server] ${data}`));
await new Promise(resolve => setTimeout(resolve, 400));
await mkdir(`${root}/screenshots`, { recursive: true });

const browser = await puppeteer.launch({ headless: true, executablePath: '/opt/omb-chrome/chrome-linux-arm64/chrome', args: ['--no-sandbox'] });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  page.on('pageerror', error => console.error(`[pageerror] ${error.stack || error}`));
  page.on('console', message => { if (message.type() === 'error') console.error(`[console] ${message.text()}`); });
  for (const [index, pose] of poses.entries()) {
    await page.goto(`http://127.0.0.1:${port}/index.html?shot=${pose}&seed=1`, { waitUntil: 'networkidle0' });
    await page.waitForFunction(() => window.__shotReady === true, { timeout: 5000 });
    await new Promise(resolve => setTimeout(resolve, 2500));
    await page.screenshot({ path: `${root}/screenshots/${index + 1}-${pose}.png` });
    console.log(`ready ${pose}`);
    console.log(`captured ${pose}`);
  }
} finally {
  await browser.close();
  server.kill();
}
