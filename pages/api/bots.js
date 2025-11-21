

// Новый простой backend на Next.js с хранением в памяти (для теста, без базы)
let bots = [];

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json(bots);
  }
  if (req.method === 'POST') {
    const newBots = req.body.bots || [];
    newBots.forEach(bot => {
      if (!bots.find(b => b.name === bot)) {
        bots.push({ name: bot, status: 'free', loaded_by: null });
      }
    });
    return res.status(200).json(bots);
  }
  if (req.method === 'PUT') {
    const { name, status, loaded_by } = req.body;
    bots = bots.map(b => b.name === name ? { ...b, status, loaded_by } : b);
    return res.status(200).json(bots);
  }
  res.status(405).json({ error: 'Method not allowed' });
}
