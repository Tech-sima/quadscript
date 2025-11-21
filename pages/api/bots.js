import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await supabase.from('bots').select('*');
    if (error) return res.status(500).json({ error });
    return res.status(200).json(data);
  }
  if (req.method === 'POST') {
    const bots = req.body.bots || [];
    const results = [];
    for (const bot of bots) {
      const { data, error } = await supabase.from('bots').upsert({ name: bot, status: 'free', loaded_by: null });
      if (error) return res.status(500).json({ error });
      results.push(data);
    }
    return res.status(200).json(results);
  }
  if (req.method === 'PUT') {
    const { name, status, loaded_by } = req.body;
    const { data, error } = await supabase.from('bots').update({ status, loaded_by }).eq('name', name);
    if (error) return res.status(500).json({ error });
    return res.status(200).json(data);
  }
  res.status(405).json({ error: 'Method not allowed' });
}
