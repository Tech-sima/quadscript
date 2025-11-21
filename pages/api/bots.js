
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;

  // Проверка переменных окружения
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: { message: 'SUPABASE_URL или SUPABASE_KEY не заданы', hint: 'Проверьте переменные окружения на Vercel и в .env.local' } });
  }

  // Проверка формата ключа
  if (typeof SUPABASE_KEY !== 'string' || SUPABASE_KEY.length < 60) {
    return res.status(500).json({ error: { message: 'Неверный формат ключа Supabase', hint: 'Скопируйте anon public key из консоли Supabase' } });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  try {
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
  } catch (e) {
    return res.status(500).json({ error: { message: 'Ошибка сервера', details: e?.message || e } });
  }
}
