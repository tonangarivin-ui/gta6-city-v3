// Transient visual effects are plain records owned by the simulation.
export function createEffects() { return []; }
export function addEffect(effects, type, x, y, duration = 0.5, data = {}) { const effect = { id: `${type}-${Date.now()}-${effects.length}`, type, x, y, age: 0, duration, ...data }; effects.push(effect); return effect; }
export function updateEffects(effects, dt) { for (const effect of effects) effect.age += dt; for (let i = effects.length - 1; i >= 0; i -= 1) if (effects[i].age >= effects[i].duration) effects.splice(i, 1); return effects; }
