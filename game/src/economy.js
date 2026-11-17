// Cash, rewards, and purchasable upgrades with explicit affordability checks.
import { ECONOMY } from './config.js';
export const UPGRADES = [{ id: 'engine', name: 'Engine Tune', cost: 900 }, { id: 'armor', name: 'Body Armor', cost: 1200 }, { id: 'health', name: 'First Aid', cost: 250 }];
export function createEconomy(cash = ECONOMY.startingCash) { return { cash: Math.max(0, Math.floor(cash)), purchases: [] }; }
export function reward(state, amount) { const value = Math.max(0, Math.floor(amount)); state.cash += value; return state.cash; }
export function purchase(state, id) { const item = UPGRADES.find(upgrade => upgrade.id === id); if (!item || state.cash < item.cost) return false; state.cash -= item.cost; state.purchases.push(id); return { ...item }; }
