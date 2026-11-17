// Ambient pedestrian actors, kept as renderer-friendly plain objects.
import { CITY, POPULATION } from './config.js';
export function createPedestrians(random = Math.random, count = POPULATION.pedestrians) {
  return Array.from({ length: count }, (_, id) => ({ id, x: random() * CITY.width, y: random() * CITY.height, heading: random() * Math.PI * 2, speed: 0.4 + random() * 0.8, color: ['#d9a77b', '#90624c', '#e8c9a1'][id % 3], state: 'walking', target: null }));
}
export function updatePedestrian(ped, dt, random = Math.random) {
  if (ped.state !== 'walking') return ped;
  if (random() < dt * 0.2) ped.heading += (random() - 0.5) * 1.2;
  ped.x = (ped.x + Math.cos(ped.heading) * ped.speed * dt * 20 + CITY.width) % CITY.width;
  ped.y = (ped.y + Math.sin(ped.heading) * ped.speed * dt * 20 + CITY.height) % CITY.height;
  return ped;
}
