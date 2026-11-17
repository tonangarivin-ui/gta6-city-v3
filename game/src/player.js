// Player state and movement intent, independent of input devices and renderer.
import { CITY, PLAYER } from './config.js';
export function createPlayer(x = CITY.width / 2, y = CITY.height / 2) { return { x, y, heading: 0, health: PLAYER.health, cash: 0, wanted: 0, vehicleId: null, weapon: 'unarmed', alive: true }; }
export function movePlayer(player, dt, input = {}) {
  if (!player.alive || player.vehicleId !== null) return player;
  const forward = Number(input.forward || 0), strafe = Number(input.strafe || 0);
  player.heading = input.heading ?? player.heading;
  player.x = Math.max(0, Math.min(CITY.width, player.x + (Math.cos(player.heading) * forward - Math.sin(player.heading) * strafe) * PLAYER.walkSpeed * dt * 60));
  player.y = Math.max(0, Math.min(CITY.height, player.y + (Math.sin(player.heading) * forward + Math.cos(player.heading) * strafe) * PLAYER.walkSpeed * dt * 60));
  return player;
}
export function damagePlayer(player, damage) { player.health = Math.max(0, player.health - Math.max(0, damage)); if (!player.health) player.alive = false; return player.health; }
