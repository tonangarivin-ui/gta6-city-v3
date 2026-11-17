import { SCREEN_PLAY, SCREEN_TITLE } from './render.js';

const staged = {
  start: {
    player: { x: 2048, y: 1500, heading: 0, inVehicle: true },
    hud: { cash: 2500, speed: 0, district: 'OLD PORT', wanted: 0, objective: 'Choose your route through the last light.', missionStep: '1/5' },
    camera: { distance: 112, height: 86 },
    cars: [{ x: -80, y: 150, color: '#e76f51' }, { x: 58, y: 250, color: '#f1ca72' }, { x: -38, y: 430, color: '#78a6a0' }],
    pedestrians: [{ x: -190, y: 130 }, { x: 180, y: 260 }, { x: -80, y: 420 }, { x: 110, y: 570 }],
    patrols: [],
  },
  drive: {
    player: { x: 2048, y: 1720, heading: 0, inVehicle: true },
    hud: { cash: 3400, speed: 42, district: 'CENTRO', wanted: 0, objective: 'Steal the coupe and reach the Mariner Diner.', missionStep: '2/5' },
    camera: { distance: 58, height: 78 },
    cars: [{ x: -58, y: 105, color: '#e76f51' }, { x: 52, y: 180, color: '#f1ca72' }, { x: -72, y: 340, color: '#78a6a0' }, { x: 85, y: 560, color: '#e76f51' }, { x: -25, y: 820, color: '#f1ca72' }, { x: 112, y: 1030, color: '#5d9dac' }],
    pedestrians: [{ x: -180, y: 120 }, { x: 160, y: 210 }, { x: -100, y: 390 }, { x: 210, y: 520 }, { x: -220, y: 690 }, { x: 80, y: 870 }],
    patrols: [],
  },
  chase: {
    player: { x: 2048, y: 1840, heading: 0.025, inVehicle: true },
    hud: { cash: 7200, speed: 68, district: 'CENTRO', wanted: 3, objective: 'Lose the patrol before the Marina Alta bridge.', missionStep: '4/5' },
    camera: { distance: 104, height: 138 },
    cars: [{ x: -72, y: 130, color: '#e76f51' }, { x: 64, y: 245, color: '#f1ca72' }, { x: -42, y: 410, color: '#78a6a0' }, { x: 94, y: 610, color: '#e76f51' }],
    pedestrians: [{ x: -210, y: 150 }, { x: 190, y: 300 }, { x: -120, y: 480 }, { x: 130, y: 650 }, { x: -210, y: 820 }],
    patrols: [{ x: -46, y: 72, color: '#e7ecea' }, { x: 44, y: 155, color: '#e7ecea' }, { x: 18, y: 330, color: '#e7ecea' }],
  },
  cruise: {
    player: { x: 2048, y: 1330, heading: -0.015, inVehicle: true },
    hud: { cash: 12800, speed: 28, district: 'WATERFRONT', wanted: 0, objective: 'Follow the shoreline to the lighthouse.', missionStep: '5/5' },
    camera: { distance: 154, height: 184 },
    cars: [{ x: -90, y: 210, color: '#e76f51' }, { x: 62, y: 330, color: '#f1ca72' }, { x: -35, y: 520, color: '#78a6a0' }, { x: 105, y: 760, color: '#e76f51' }, { x: -110, y: 1010, color: '#f1ca72' }],
    pedestrians: [{ x: -190, y: 180 }, { x: 170, y: 360 }, { x: -90, y: 570 }, { x: 220, y: 780 }],
    patrols: [],
  },
};

export function stageShot(name, state) {
  const shot = staged[name] ?? staged.start;
  Object.assign(state.player, shot.player);
  Object.assign(state, shot.hud, shot.camera, {
    cars: shot.cars,
    pedestrians: shot.pedestrians,
    patrols: shot.patrols,
    policeFlash: shot.patrols.length > 0,
    shots: shot.hud.wanted ? 0.7 : 0,
    time: 2.2,
    mapOpen: false,
  });
  return { screen: name === 'start' ? SCREEN_TITLE : SCREEN_PLAY, best: 0 };
}
