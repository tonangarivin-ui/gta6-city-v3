import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';

const staged = {
  start: { x: 2048, y: 1500, heading: 0, inVehicle: true, cash: 2500, speed: 0, district: 'OLD PORT' },
  drive: { x: 2048, y: 1720, heading: 0, inVehicle: true, cash: 3400, speed: 42, district: 'CENTRO' },
  chase: { x: 2048, y: 1840, heading: .025, inVehicle: true, cash: 7200, speed: 68, district: 'CENTRO' },
  cruise: { x: 2048, y: 1330, heading: -.015, inVehicle: true, cash: 12800, speed: 28, district: 'WATERFRONT' },
};

export function stageShot(name, state) {
  const shot = staged[name] ?? staged.start;
  Object.assign(state.player, shot);
  state.cars = [
    { x: 1985, y: shot.y + 340, color: '#e76f51' },
    { x: 2100, y: shot.y + 565, color: '#f1ca72' },
    { x: 2220, y: shot.y + 800, color: '#78a6a0' },
  ];
  return { screen: name === 'start' ? SCREEN_TITLE : SCREEN_PLAY, best: 0 };
}
