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
    { x: -58, y: 190, color: '#e76f51' }, { x: 52, y: 270, color: '#f1ca72' },
    { x: -72, y: 430, color: '#78a6a0' }, { x: 85, y: 565, color: '#e76f51' },
    { x: -25, y: 720, color: '#f1ca72' },
  ];
  state.wanted = name === 'chase' ? 3 : 0;
  state.pedestrians = Array.from({length:11},(_,i)=>({x:-235+i*46,y:120+(i%4)*155}));
  state.patrols = name === 'chase' ? [{x:-44,y:65,color:'#e7ecea'},{x:42,y:115,color:'#e7ecea'}] : [];
  state.policeFlash = true;
  state.shots = name === 'chase' ? .7 : 0;
  state.time = 2.2;
  state.mapOpen = false;
  state.objective = name === 'chase' ? 'Lose the patrol before the Marina Alta bridge.' : 'Meet Ivo at the Mariner Diner.';
  state.missionStep = name === 'chase' ? '3/5' : '1/5';
  return { screen: name === 'start' ? SCREEN_TITLE : SCREEN_PLAY, best: 0 };
}
