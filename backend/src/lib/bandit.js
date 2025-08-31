import { query } from './db/postgres.js';
import { v4 as uuidv4 } from 'uuid';

// Epsilon-greedy selection for an experiment.
export async function chooseVariant({ experimentName, userId, epsilon = 0.1 }) {
  // Find experiment
  const expRes = await query(
    `SELECT id, name FROM experiments WHERE name = $1 LIMIT 1`,
    [experimentName]
  );
  if (expRes.rows.length === 0) return { variant: 'control', experiment_id: null };

  const expId = expRes.rows[0].id;
  const variantsRes = await query(
    `SELECT id, key, traffic_fraction FROM experiment_variants WHERE experiment_id = $1`,
    [expId]
  );
  const variants = variantsRes.rows;

  // epsilon exploration
  if (Math.random() < epsilon) {
    const v = variants[Math.floor(Math.random() * variants.length)];
    await logDecision(expId, v.id, userId, 'explore');
    return { variant: v.key, experiment_id: expId };
  }

  // exploitation: pick variant with highest past CTR (basic example)
  const ctrs = [];
  for (const v of variants) {
    const logs = await query(
      `SELECT 
         SUM((details->>'clicks')::int) AS clicks, 
         SUM((details->>'impressions')::int) AS imps
       FROM decision_logs
       WHERE experiment_id = $1 AND variant_id = $2`,
      [expId, v.id]
    );
    const clicks = parseInt(logs.rows[0].clicks || 0, 10);
    const imps = parseInt(logs.rows[0].imps || 0, 10);
    const ctr = imps ? clicks / imps : 0;
    ctrs.push({ v, ctr });
  }
  ctrs.sort((a, b) => b.ctr - a.ctr);
  const best = (ctrs[0] && ctrs[0].v) || variants[0];
  await logDecision(expId, best.id, userId, 'exploit');
  return { variant: best.key, experiment_id: expId };
}

export async function logDecision(experiment_id, variant_id, user_id, mode) {
  await query(
    `INSERT INTO decision_logs (experiment_id, variant_id, user_id, mode, details) 
     VALUES ($1, $2, $3, $4, $5)`,
    [experiment_id, variant_id, user_id, mode, { clicks: 0, impressions: 1 }]
  );
}
