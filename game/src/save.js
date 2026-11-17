// Optional browser-local persistence with validated, exception-safe reads.
import { SAVE_KEY } from './config.js';
const STORAGE_VERSION = 1;
export function encodeSave(data) { return JSON.stringify({ version: STORAGE_VERSION, data }); }
export function decodeSave(value) { try { const save = JSON.parse(value); return save?.version === STORAGE_VERSION && save.data && typeof save.data === 'object' ? save.data : null; } catch { return null; } }
export function saveGame(data, storage = globalThis.localStorage) { try { storage.setItem(SAVE_KEY, encodeSave(data)); return true; } catch { return false; } }
export function loadGame(storage = globalThis.localStorage) { try { const value = storage.getItem(SAVE_KEY); return value === null ? null : decodeSave(value); } catch { return null; } }
export function clearSave(storage = globalThis.localStorage) { try { storage.removeItem(SAVE_KEY); return true; } catch { return false; } }
