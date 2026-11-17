// Camera-space projection for a flat city and upright objects.
export function project(point, camera, width, height, focal = 620) {
  const dx = point.x - camera.x, dy = point.y - camera.y;
  const c = Math.cos(camera.heading), s = Math.sin(camera.heading);
  const lateral = dx * c - dy * s;
  const forward = dx * s + dy * c;
  const depth = Math.max(12, forward + (camera.back ?? 90));
  const scale = focal / depth;
  const horizon = height * 0.37;
  return { x: width / 2 + lateral * scale, y: horizon + (camera.height ?? 118) * scale - forward * scale * 0.18 - (point.z ?? 0) * scale, scale, depth };
}

export function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
