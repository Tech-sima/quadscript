import Head from 'next/head';
import { useEffect, useState } from 'react';

export default function Home() {
  const [botList, setBotList] = useState('');
  const [bots, setBots] = useState([]);
  const [view, setView] = useState('all');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    let uid = localStorage.getItem('userId');
    if (!uid) {
      uid = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('userId', uid);
    }
    setUserId(uid);
    fetchBots();
  }, []);

  const fetchBots = async () => {
    const res = await fetch('/api/bots');
    const data = await res.json();
    setBots(data);
  };

  const saveBots = async () => {
    const botNames = botList.split('\n').map(b => b.trim()).filter(b => b);
    if (botNames.length === 0) return;
    await fetch('/api/bots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bots: botNames })
    });
    fetchBots();
  };

  const checkBots = async () => {
    const botNames = botList.split('\n').map(b => b.trim()).filter(b => b);
    if (botNames.length === 0) return;
    const res = await fetch('/api/bots');
    const allBots = await res.json();
    setBots(allBots.filter(b => botNames.includes(b.name)));
  };

  const showMyBots = async () => {
    const res = await fetch('/api/bots');
    const allBots = await res.json();
    setBots(allBots.filter(b => b.loaded_by === userId));
    setView('my');
  };

  const setBusy = async (name, loaded_by) => {
    if (!loaded_by || loaded_by === userId) {
      await fetch('/api/bots', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, status: 'busy', loaded_by: userId })
      });
      fetchBots();
    }
  };

  return (
    <>
      <Head>
        <title>Статус юзер-ботов</title>
        <link rel="stylesheet" href="/style.css" />
      </Head>
      <div className="container">
        <div className="column left">
          <h2>Список юзер-ботов</h2>
          <textarea value={botList} onChange={e => setBotList(e.target.value)} placeholder="Вставьте список ботов, по одному на строку..." />
          <button onClick={saveBots}>Сохранить список</button>
          <button onClick={checkBots}>Проверить</button>
          <button onClick={showMyBots}>Мои боты</button>
        </div>
        <div className="column right">
          <h2>Статус ботов</h2>
          <ul id="botStatusList">
            {bots.map(bot => (
              <li key={bot.name} onClick={() => setBusy(bot.name, bot.loaded_by)}>
                {bot.name}
                <span className={bot.loaded_by && bot.loaded_by !== userId ? 'status-busy' : 'status-free'}>
                  {bot.loaded_by && bot.loaded_by !== userId ? 'занят' : 'свободен'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
