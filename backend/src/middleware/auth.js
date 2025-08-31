export function requireApiKey(req, res, next) {
  const key = req.headers['x-api-key'];
  if (!process.env.API_KEY) return next();
  if (key !== process.env.API_KEY) return res.status(401).json({ error: 'Unauthorized' });
  next();
}
