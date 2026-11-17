// Deterministic value noise for lightweight procedural city variation.
export function hash(x, y, seed = 1) {
  let n = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(seed | 0, 1442695041);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
}
export function noise(x, y, seed = 1) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
  const smooth = t => t * t * (3 - 2 * t), a = smooth(fx), b = smooth(fy);
  const mix = (p, q, t) => p + (q - p) * t;
  return mix(mix(hash(ix, iy, seed), hash(ix + 1, iy, seed), a), mix(hash(ix, iy + 1, seed), hash(ix + 1, iy + 1, seed), a), b);
}
