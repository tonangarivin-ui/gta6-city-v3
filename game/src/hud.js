// HUD view model only; a renderer may format these fields however it wants.
import { currentMission } from './missions.js';
export function getHud(player, missions, economy = null) {
  const mission = currentMission(missions);
  return { health: player.health, maxHealth: 100, cash: economy?.cash ?? player.cash ?? 0, wanted: player.wanted || 0, maxWanted: 5, district: player.district ?? 'Centro', mission: mission ? { title: mission.title, target: mission.target, active: missions.active } : null, weapon: player.weapon ?? 'unarmed' };
}
