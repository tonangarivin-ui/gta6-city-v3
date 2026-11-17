// Wanted level and response units; no DOM or rendering dependencies.
import { POPULATION, PLAYER } from './config.js';
export function createPolice(random = Math.random, count = POPULATION.police) {
  return Array.from({ length: count }, (_, id) => ({ id, x: random() * 4096, y: random() * 4096, heading: 0, speed: 0, active: false, siren: true }));
}
export function addWanted(state, amount = 1) { state.wanted = Math.max(0, Math.min(PLAYER.maxWanted, (state.wanted || 0) + amount)); return state.wanted; }
export function coolWanted(state, dt) { state.wanted = Math.max(0, (state.wanted || 0) - dt / 35); return state.wanted; }
export function updatePolice(units, player, dt) {
  const active = Math.ceil(units.length * (player.wanted || 0) / PLAYER.maxWanted);
  units.forEach((unit, i) => {
    unit.active = i < active;
    if (!unit.active) return;
    const target = Math.atan2(player.y - unit.y, player.x - unit.x), turn = Math.atan2(Math.sin(target - unit.heading), Math.cos(target - unit.heading));
    unit.heading += Math.max(-2 * dt, Math.min(2 * dt, turn)); unit.speed = 3 + player.wanted * 1.5;
    unit.x += Math.cos(unit.heading) * unit.speed * dt; unit.y += Math.sin(unit.heading) * unit.speed * dt;
  });
  return units;
}
