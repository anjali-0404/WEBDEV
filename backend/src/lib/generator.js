// Simple templated generator with a naive safety filter.
// Replace with a proper LLM + policy layer for production.

const BANNED = ['scam', 'illegal', 'hate', 'violence'];

export function generatePersonalizedCopy(product, user = {}) {
  const { name, price, category, description } = product;
  const persona = user.persona || 'smart shopper';
  const style = user.style || 'friendly';
  const interest = user.interest || category || 'trending';

  // Safety: if product text contains banned tokens, redact/alter.
  const safeDesc = (description || 'Great product')
    .split(' ')
    .map(w => (BANNED.includes(w.toLowerCase()) ? '[redacted]' : w))
    .join(' ');

  const short = `${name}: tailored for ${persona}. Ideal if you love ${interest}.`;
  const long = `${style.capitalize?.() || style} note: ${safeDesc} Now at ₹${price}.`;

  const banner = `Don't miss ${name}! Perfect for ${persona}. Shop now.`;
  const email = `Hi ${user.first_name || 'there'},

We picked ${name} just for you. ${safeDesc}

Grab it today for ₹${price}.
`;

  return { short, long, banner, email };
}
