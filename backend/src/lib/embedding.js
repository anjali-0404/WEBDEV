// Simple, deterministic 64-dim 'embedding' by hashing tokens to buckets.
// Replace with a real embedding model in production.

function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return h >>> 0;
}

export function embedText(text) {
  const dim = 64;
  const vec = new Array(dim).fill(0);
  const tokens = (text || '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  for (const t of tokens) {
    const bucket = hashStr(t) % dim;
    vec[bucket] += 1;
  }
  // L2 normalize
  const norm = Math.sqrt(vec.reduce((a, b) => a + b * b, 0)) || 1;
  return vec.map(v => v / norm);
}

export function cosine(a, b) {
  let s = 0;
  for (let i = 0; i < a.length && i < b.length; i++) s += a[i] * b[i];
  return s;
}
