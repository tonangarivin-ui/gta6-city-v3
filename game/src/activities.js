// Optional side activities and their data-only markers.
export const ACTIVITIES = [
  { id: 'coastline-sprint', name: 'Coastline Sprint', type: 'race', start: { x: 420, y: 520 }, finish: { x: 1340, y: 360 }, reward: 600 },
  { id: 'market-errand', name: 'Market Errand', type: 'pickup', start: { x: 1910, y: 1830 }, finish: { x: 2380, y: 2050 }, reward: 350 },
];
export function createActivities() { return { activeId: null, completed: [] }; }
export function startActivity(state, id) { const activity = ACTIVITIES.find(a => a.id === id); if (!activity || state.completed.includes(id)) return false; state.activeId = id; return true; }
export function updateActivity(state, player) {
  const activity = ACTIVITIES.find(a => a.id === state.activeId); if (!activity || Math.hypot(player.x - activity.finish.x, player.y - activity.finish.y) > 60) return null;
  state.completed.push(activity.id); state.activeId = null; return { type: 'complete', reward: activity.reward, activity };
}
