// Small objective catalog and serial mission progression.
export const MISSION_LIST = [
  { id: 'harbor-run', title: 'Harbor Run', description: 'Reach the Old Port warehouse.', target: { x: 650, y: 730 }, reward: 1200 },
  { id: 'hilltop-delivery', title: 'Hilltop Delivery', description: 'Drop the parcel in Mesa Verde.', target: { x: 3200, y: 3300 }, reward: 1600 },
  { id: 'night-market', title: 'Night Market', description: 'Meet your contact in Centro.', target: { x: 2048, y: 1950 }, reward: 2000 },
];
export function createMissions() { return { index: 0, active: false, complete: false, elapsed: 0 }; }
export function currentMission(state) { return MISSION_LIST[state.index] ?? null; }
export function startMission(state) { if (state.complete || state.active || !currentMission(state)) return false; state.active = true; state.elapsed = 0; return true; }
export function updateMission(state, player, dt) {
  if (!state.active) return null;
  state.elapsed += dt;
  const mission = currentMission(state);
  if (Math.hypot(player.x - mission.target.x, player.y - mission.target.y) < 80) { state.active = false; state.index += 1; state.complete = state.index >= MISSION_LIST.length; return { type: 'complete', reward: mission.reward, mission }; }
  return null;
}
