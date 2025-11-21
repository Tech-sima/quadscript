
import Head from 'next/head';
import { useEffect, useState } from 'react';

export default function Home() {
  const [botList, setBotList] = useState('');
  const [bots, setBots] = useState([]);
  const [view, setView] = useState('all');
  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');

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
    setError('');
    try {
      const res = await fetch('/api/bots');
      const data = await res.json();
      if (data.error || data.ошибка) {
        setError(data.error?.message || data.ошибка?.message || 'Ошибка API');
        setBots([]);
      } else if (Array.isArray(data)) {
        setBots(data);
      } else {
        setError('Некорректный ответ API');
        setBots([]);
      }
    } catch (e) {
      setError('Ошибка загрузки данных');
      setBots([]);
    }
  };

  const saveBots = async () => {
    setError('');
    const botNames = botList.split('\n').map(b => b.trim()).filter(b => b);
    if (botNames.length === 0) return;
    try {
      await fetch('/api/bots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bots: botNames })
      });
      fetchBots();
    } catch (e) {
      setError('Ошибка сохранения');
    }
  };

  const checkBots = async () => {
    setError('');
    const botNames = botList.split('\n').map(b => b.trim()).filter(b => b);
    if (botNames.length === 0) return;
    try {
      const res = await fetch('/api/bots');
      const allBots = await res.json();
      if (allBots.error || allBots.ошибка) {
        setError(allBots.error?.message || allBots.ошибка?.message || 'Ошибка API');
        setBots([]);
      } else if (Array.isArray(allBots)) {
        setBots(allBots.filter(b => botNames.includes(b.name)));
      } else {
        setError('Некорректный ответ API');
        setBots([]);
      }
    } catch (e) {
      setError('Ошибка загрузки данных');
      setBots([]);
    }
  };

  const showMyBots = async () => {
    setError('');
    try {
      const res = await fetch('/api/bots');
      const allBots = await res.json();
      if (allBots.error || allBots.ошибка) {
        setError(allBots.error?.message || allBots.ошибка?.message || 'Ошибка API');
        setBots([]);
      } else if (Array.isArray(allBots)) {
        setBots(allBots.filter(b => b.loaded_by === userId));
        setView('my');
      } else {
        setError('Некорректный ответ API');
        setBots([]);
      }
    } catch (e) {
      setError('Ошибка загрузки данных');
      setBots([]);
    }
  };

  const setBusy = async (name, loaded_by) => {
    setError('');
    if (!loaded_by || loaded_by === userId) {
      try {
        await fetch('/api/bots', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, status: 'busy', loaded_by: userId })
        });
        fetchBots();
      } catch (e) {
        setError('Ошибка обновления статуса');
      }
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
          {error && <div style={{color:'#ff3366',marginBottom:'16px'}}>{error}</div>}
          <ul id="botStatusList">
            {Array.isArray(bots) && bots.map(bot => (
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
