// Map viewport and marker data, with no canvas calls.
import { CITY } from './config.js';
export function getMinimap(player, entities = [], size = 180) {
  const scale = size / 900, half = size / (2 * scale);
  const markers = entities.filter(e => e.active !== false).map(e => ({ id: e.id, type: e.type || (e.wanted !== undefined ? 'police' : 'vehicle'), x: (e.x - player.x + half) * scale, y: (e.y - player.y + half) * scale }));
  return { size, scale, bounds: { x: Math.max(0, player.x - half), y: Math.max(0, player.y - half), width: Math.min(CITY.width, half * 2), height: Math.min(CITY.height, half * 2) }, player: { x: size / 2, y: size / 2, heading: player.heading }, markers };
}
