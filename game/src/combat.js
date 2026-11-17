// Lightweight hitscan combat events for the main simulation to resolve.
export function createWeaponState() { return { cooldown: 0, ammo: Infinity, range: 420, damage: 34 }; }
export function fireWeapon(player, weapon, targets, dt = 0) {
  weapon.cooldown = Math.max(0, weapon.cooldown - dt);
  if (weapon.cooldown > 0 || weapon.ammo <= 0) return null;
  weapon.cooldown = 0.28; if (Number.isFinite(weapon.ammo)) weapon.ammo -= 1;
  const candidates = targets.filter(t => t.alive !== false).map(target => ({ target, dx: target.x - player.x, dy: target.y - player.y })).filter(hit => Math.hypot(hit.dx, hit.dy) <= weapon.range && Math.abs(Math.atan2(Math.sin(Math.atan2(hit.dy, hit.dx) - player.heading), Math.cos(Math.atan2(hit.dy, hit.dx) - player.heading))) < 0.12).sort((a, b) => Math.hypot(a.dx, a.dy) - Math.hypot(b.dx, b.dy));
  if (!candidates.length) return { type: 'shot', x: player.x, y: player.y, hit: null };
  const target = candidates[0].target; target.health = Math.max(0, (target.health ?? 100) - weapon.damage); if (!target.health) target.alive = false;
  return { type: 'hit', x: target.x, y: target.y, hit: target.id };
}
