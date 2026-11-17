import { createRenderer, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './render.js';
const ACTION_CONFIRM = 1, ACTION_PAUSE = 2;
const held = new Set();
const heldKeys = new Set(['ArrowLeft','ArrowRight','KeyA','KeyD','KeyW','KeyS','Space','Enter','KeyP','Escape','KeyE','ShiftLeft','ShiftRight','KeyM']);
// Solara build marker: fixed-step coastal boulevard demo.
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
  cash: 2500, speed: 0, district: 'MARINA ALTA', cars: [], time: 0, wanted: 0,
  objective: 'Meet Ivo at the Mariner Diner.', missionStep: '1/5', pedestrians: [], shots: 0,
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
  const steering = input.direction(), forwardKey = held.has('KeyW') || held.has('ArrowUp'), brake = held.has('KeyS') || held.has('ArrowDown');
  world.time += dt;
  world.player.heading += steering * dt * 1.15;
  world.speed = clamp(world.speed + (forwardKey ? 48 : brake ? -75 : -10) * dt, 0, 92);
  const velocity = world.speed * 3;
  world.player.x = clamp(world.player.x + Math.sin(world.player.heading) * velocity * dt, 0, 4096);
  world.player.y = clamp(world.player.y + Math.cos(world.player.heading) * velocity * dt, 0, 4096);
  world.district = world.player.y < 780 ? 'OLD PORT' : world.player.y < 2250 ? 'CENTRO' : 'LAS PALMAS';
  if (world.time % 4 < dt) world.cash += 25;
  world.cars.forEach(car => { car.y -= dt * (world.speed * .75 + 18); if (car.y < 30) car.y += 1250; });
  world.pedestrians = Array.from({length:7},(_,i)=>({x:-200+i*60,y:170+i*125}));
  if (held.has('KeyE')) { world.player.inVehicle = !world.player.inVehicle; held.delete('KeyE'); }
  if (held.has('KeyM')) { world.mapOpen = !world.mapOpen; held.delete('KeyM'); }
  if (held.has('ShiftLeft') || held.has('ShiftRight')) world.speed = Math.min(100,world.speed+10*dt);
  if (held.has('Space') || held.has('Mouse0')) world.shots += dt; else world.shots=0;
  if (world.shots > .5) world.wanted = Math.min(5,Math.max(world.wanted,1));
  world.patrols = world.wanted ? [{x:-34,y:80,color:'#e7ecea'},{x:38,y:135,color:'#e7ecea'}] : [];
  world.policeFlash = Boolean(world.wanted && Math.floor(world.time*2)%2);
  if (world.time > 18 && world.wanted) world.objective = 'Lose the patrol before the Marina Alta bridge.';
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
  const paint = () => { try { renderer.draw(world, shotName === 'start' ? SCREEN_TITLE : SCREEN_PLAY); } catch (error) { document.body.innerText = error.stack; } if (++paints < 2) requestAnimationFrame(paint); else window.__shotReady = true; };
  requestAnimationFrame(paint);
} else {
  status.textContent = 'San Telmo. Press Enter to drive.';
  requestAnimationFrame(frame);
}
