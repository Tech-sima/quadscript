// Supabase config (замените на свои ключи)
const SUPABASE_URL = 'https://vdjmswyditqsnbohoqqi.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3Cp1fc32fKnTDuNN5vGcXnSSehgS2qhkbFqbURhC8V5fBKmoxvduX91Bak9dUS2qhkbFqbURhC8V5fBjpxQzc26CxTtPFuQMNfm2RfEHfKHfKXWTADCpgQUxX0.mvzAhZ7lJCdVFpBijaTEz-KKEBSnOLY9EtknSMaB15I';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const botListInput = document.getElementById('botListInput');
const saveBotsBtn = document.getElementById('saveBots');
const botStatusList = document.getElementById('botStatusList');

// Получить уникальный идентификатор пользователя
let userId = localStorage.getItem('userId');
if (!userId) {
  userId = 'user_' + Math.random().toString(36).substr(2, 9);
  localStorage.setItem('userId', userId);
}

// Сохранить список ботов
saveBotsBtn.onclick = async function() {
  const bots = botListInput.value.split('\n').map(b => b.trim()).filter(b => b);
  for (const bot of bots) {
    await supabase.from('bots').upsert({ name: bot, status: 'free', loaded_by: null });
  }
};

// Слушать изменения статусов ботов через Supabase Realtime
async function listenBots() {
  const { data, error } = await supabase.from('bots').select('*');
  renderBots(data || []);

  supabase.channel('bots-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'bots' }, payload => {
      fetchAndRenderBots();
    })
    .subscribe();
}

async function fetchAndRenderBots() {
  const { data, error } = await supabase.from('bots').select('*');
  renderBots(data || []);
}

function renderBots(bots) {
  botStatusList.innerHTML = '';
  bots.forEach(info => {
    const li = document.createElement('li');
    li.textContent = info.name;
    const statusSpan = document.createElement('span');
    if (info.loaded_by && info.loaded_by !== userId) {
      statusSpan.textContent = 'занят';
      statusSpan.className = 'status-busy';
    } else {
      statusSpan.textContent = 'свободен';
      statusSpan.className = 'status-free';
    }
    li.appendChild(statusSpan);
    li.onclick = async () => {
      if (!info.loaded_by || info.loaded_by === userId) {
        await supabase.from('bots').update({ status: 'busy', loaded_by: userId }).eq('name', info.name);
      }
    };
    botStatusList.appendChild(li);
  });
}

listenBots();
