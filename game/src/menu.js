// Screen state and menu options, renderer-independent.
export const SCREENS = Object.freeze({ TITLE: 'title', PLAY: 'play', PAUSE: 'pause', GARAGE: 'garage', GAME_OVER: 'game-over' });
export const MENU_ITEMS = Object.freeze([{ id: 'continue', label: 'Continue' }, { id: 'missions', label: 'Missions' }, { id: 'garage', label: 'Garage' }, { id: 'resume', label: 'Resume' }]);
export function createMenu() { return { screen: SCREENS.TITLE, selection: 0, open: false }; }
export function setScreen(menu, screen) { if (!Object.values(SCREENS).includes(screen)) return false; menu.screen = screen; menu.open = screen !== SCREENS.PLAY; return true; }
export function moveSelection(menu, direction, items = MENU_ITEMS) { if (items.length) menu.selection = (menu.selection + Math.sign(direction) + items.length) % items.length; return menu.selection; }
