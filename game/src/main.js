import { createRenderer, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './render.js';
const ACTION_CONFIRM = 1, ACTION_PAUSE = 2;
const held = new Set();
const heldKeys = new Set(['ArrowLeft','ArrowRight','KeyA','KeyD','Space','Enter','KeyP','Escape']);
let actions = 0;
window.addEventListener('keydown', event => {
  if (heldKeys.has(event.code)) event.preventDefault();
  if (['Space','Enter'].includes(event.code) && !event.repeat) actions |= ACTION_CONFIRM;
  if (['KeyP','Escape'].includes(event.code) && !event.repeat) actions |= ACTION_PAUSE;
  held.add(event.code);
});
window.addEventListener('keyup', event => held.delete(event.code));
window.addEventListener('blur', () => held.clear());
const input = { takeActions(){const value=actions;actions=0;return value;}, direction(){return (held.has('ArrowRight')||held.has('KeyD')?1:0)-(held.has('ArrowLeft')||held.has('KeyA')?1:0);} };
import { stageShot } from './shots.js';
import { clamp } from './math3d.js';

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const renderer = createRenderer(canvas);
const query = new URLSearchParams(location.search);
if (!canvas || !status) throw new Error('Game canvas or status region is missing.');
const shotName = query.get('shot');
const world = {
  player: { x: 2048, y: 1500, heading: 0, inVehicle: true },
  cash: 2500, speed: 0, district: 'OLD PORT', cars: [], time: 0,
};
let screen = SCREEN_TITLE, last = performance.now(), accumulator = 0;
const STEP = 1 / 60;

function action() {
  const actions = input.takeActions();
  if (actions & ACTION_CONFIRM) {
    if (screen === SCREEN_TITLE || screen === SCREEN_OVER) { screen = SCREEN_PLAY; status.textContent = 'Driving through San Telmo.'; }
    else if (screen === SCREEN_PAUSED) screen = SCREEN_PLAY;
  }
  if (actions & ACTION_PAUSE && screen === SCREEN_PLAY) screen = SCREEN_PAUSED;
  if (actions & ACTION_PAUSE && screen === SCREEN_PAUSED) screen = SCREEN_PLAY;
}
function update(dt) {
  const steering = input.direction();
  world.time += dt;
  world.player.heading += steering * dt * 1.15;
  const forward = 85;
  world.player.x += Math.sin(world.player.heading) * forward * dt;
  world.player.y += Math.cos(world.player.heading) * forward * dt;
  world.player.x = clamp(world.player.x, 0, 4096);
  world.player.y = clamp(world.player.y, 0, 4096);
  world.speed = Math.round(28 + Math.abs(steering) * 8 + Math.sin(world.time * 1.5) * 3);
  if (world.player.y < 780) world.district = 'OLD PORT';
  else if (world.player.y < 2250) world.district = 'CENTRO';
  else world.district = 'LAS PALMAS';
  if (world.time % 4 < dt) world.cash += 25;
}
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(.25, (now - last) / 1000); last = now;
  action();
  if (screen === SCREEN_PLAY) { accumulator += dt; while (accumulator >= STEP) { update(STEP); accumulator -= STEP; } }
  else accumulator = 0;
  renderer.draw(world, screen);
}

if (shotName) {
  stageShot(shotName, world);
  let paints = 0;
  const paint = () => { renderer.draw(world, shotName === 'start' ? SCREEN_TITLE : SCREEN_PLAY); if (++paints < 2) requestAnimationFrame(paint); else window.__shotReady = true; };
  requestAnimationFrame(paint);
} else {
  status.textContent = 'San Telmo. Press Enter to drive.';
  requestAnimationFrame(frame);
}
