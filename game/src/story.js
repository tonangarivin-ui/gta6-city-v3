// Original San Telmo story beats, exposed as data for dialogue UI.
export const STORY = [
  { id: 'arrival', speaker: 'Mara', text: 'Welcome to San Telmo. The tide brings opportunity, and trouble.' },
  { id: 'harbor', speaker: 'Mara', text: 'A package is waiting by the old harbor. Keep your head down.' },
  { id: 'centro', speaker: 'Ivo', text: 'Centro never sleeps. Find me by the market when you are ready.' },
  { id: 'mesa', speaker: 'Mara', text: 'The hill road is steep, but the view is worth the climb.' },
];
export function createStory() { return { seen: [], current: null }; }
export function showBeat(state, id) { const beat = STORY.find(item => item.id === id); if (!beat) return null; state.current = beat; if (!state.seen.includes(id)) state.seen.push(id); return beat; }
export function dismissBeat(state) { state.current = null; }
