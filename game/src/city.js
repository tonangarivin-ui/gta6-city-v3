// Data-only street grid and neighborhood descriptors for renderer/collision consumers.
import { CITY, COLORS } from './config.js';
import { noise } from './noise.js';
export const DISTRICTS = [
  { id: 'old-port', name: 'Old Port', center: [650, 730], radius: 620, type: 'waterfront' },
  { id: 'centro', name: 'Centro', center: [2048, 1950], radius: 850, type: 'downtown' },
  { id: 'las-palmas', name: 'Las Palmas', center: [3330, 1080], radius: 650, type: 'residential' },
  { id: 'mesa-verde', name: 'Mesa Verde', center: [3200, 3300], radius: 820, type: 'hills' },
];
export function createCity(seed = 1) {
  const roads = [];
  for (let x = 256; x < CITY.width; x += 512) roads.push({ x1: x, y1: 0, x2: x, y2: CITY.height, width: 36, avenue: x % 1024 === 256 });
  for (let y = 256; y < CITY.height; y += 512) roads.push({ x1: 0, y1: y, x2: CITY.width, y2: y, width: 36, avenue: y % 1024 === 256 });
  const blocks = [];
  for (let y = 128; y < CITY.height; y += CITY.blockSize) for (let x = 128; x < CITY.width; x += CITY.blockSize) {
    const variation = noise(x / 256, y / 256, seed);
    blocks.push({ x, y, width: 184 + variation * 42, height: 184 + noise(y / 256, x / 256, seed + 7) * 42, floors: 1 + Math.floor(variation * 12), color: COLORS.building });
  }
  return { name: CITY.name, width: CITY.width, height: CITY.height, ocean: COLORS.ocean, roads, blocks, districts: DISTRICTS };
}
export function districtAt(x, y) { return DISTRICTS.find(d => Math.hypot(x - d.center[0], y - d.center[1]) <= d.radius) ?? DISTRICTS[1]; }
