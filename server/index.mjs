import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 4000;
const ORIGIN = process.env.ORIGIN || 'http://localhost:3000';

app.use(cors({ origin: ORIGIN, credentials: true }));
app.use(express.json());

const db = {
  cheques: [],
  follow_ups: [],
};

app.get('/cheques', (req, res) => {
  const userId = req.query.user_id;
  if (!userId) return res.status(400).json({ error: 'user_id required' });
  const list = db.cheques.filter(c => c.user_id === userId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  res.json(list);
});

app.post('/cheques', (req, res) => {
  const body = req.body || {};
  if (!body.user_id) return res.status(400).json({ error: 'user_id required' });
  const now = new Date().toISOString();
  const item = {
    id: uuidv4(),
    created_at: now,
    updated_at: now,
    bounce_reason: null,
    bounce_date: null,
    bounce_remarks: null,
    recovery_status: null,
    ...body,
  };
  db.cheques.push(item);
  res.status(201).json(item);
});

app.patch('/cheques/:id', (req, res) => {
  const id = req.params.id;
  const idx = db.cheques.findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).json({ error: 'not found' });
  const updated = { ...db.cheques[idx], ...req.body, updated_at: new Date().toISOString() };
  db.cheques[idx] = updated;
  res.json(updated);
});

app.delete('/cheques/:id', (req, res) => {
  const id = req.params.id;
  const before = db.cheques.length;
  db.cheques = db.cheques.filter(c => c.id !== id);
  if (db.cheques.length === before) return res.status(404).json({ error: 'not found' });
  db.follow_ups = db.follow_ups.filter(f => f.cheque_id !== id);
  res.status(204).send();
});

app.get('/follow-ups', (req, res) => {
  const chequeId = req.query.cheque_id;
  if (!chequeId) return res.status(400).json({ error: 'cheque_id required' });
  const list = db.follow_ups
    .filter(f => f.cheque_id === chequeId)
    .sort((a, b) => new Date(b.contact_date) - new Date(a.contact_date));
  res.json(list);
});

app.post('/follow-ups', (req, res) => {
  const body = req.body || {};
  if (!body.cheque_id || !body.user_id || !body.contact_date) return res.status(400).json({ error: 'missing fields' });
  const item = {
    id: uuidv4(),
    created_at: new Date().toISOString(),
    notes: null,
    action_taken: null,
    next_follow_up_date: null,
    ...body,
  };
  db.follow_ups.push(item);
  res.status(201).json(item);
});

app.delete('/follow-ups/:id', (req, res) => {
  const id = req.params.id;
  const before = db.follow_ups.length;
  db.follow_ups = db.follow_ups.filter(f => f.id !== id);
  if (db.follow_ups.length === before) return res.status(404).json({ error: 'not found' });
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});
