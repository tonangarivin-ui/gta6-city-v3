// Vehicle simulation records; renderer consumes position, heading, model, and color.
import { VEHICLES } from './config.js';
export const MODELS = ['compact', 'sedan', 'pickup', 'van', 'sport'];
export function createVehicles(random = Math.random, count = VEHICLES.spawnCount) {
  return Array.from({ length: count }, (_, id) => ({ id, x: 256 + random() * 3584, y: 256 + random() * 3584, heading: Math.floor(random() * 4) * Math.PI / 2, speed: 2 + random() * 8, maxSpeed: VEHICLES.maxSpeed, model: MODELS[Math.floor(random() * MODELS.length)], color: ['#c64d3c', '#e3bd57', '#426e82', '#eeeeea'][Math.floor(random() * 4)], occupied: false, driver: null }));
}
export function updateVehicle(vehicle, dt, throttle = 0, steering = 0) {
  vehicle.speed = Math.max(-5, Math.min(vehicle.maxSpeed, vehicle.speed + throttle * VEHICLES.acceleration * dt));
  if (!throttle) vehicle.speed *= Math.max(0, 1 - VEHICLES.braking * dt * 0.08);
  vehicle.heading += steering * Math.min(1, Math.abs(vehicle.speed) / 4) * dt * Math.sign(vehicle.speed);
  vehicle.x += Math.cos(vehicle.heading) * vehicle.speed * dt;
  vehicle.y += Math.sin(vehicle.heading) * vehicle.speed * dt;
  return vehicle;
}
