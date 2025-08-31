import { embedText, cosine } from './embedding.js';

// Rank products by cosine similarity to a "session" description vector.
export function rankProducts(sessionText, products, limit = 10) {
  const sVec = embedText(sessionText);
  const scored = products.map(p => {
    const text = [p.name, p.category, p.description].filter(Boolean).join(' ');
    const pVec = embedText(text);
    return { product: p, score: cosine(sVec, pVec) };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map(x => x.product);
}
