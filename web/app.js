// Теперь все действия идут через backend /api/bots

const botListInput = document.getElementById('botListInput');
const saveBotsBtn = document.getElementById('saveBots');
const botStatusList = document.getElementById('botStatusList');

// Получить уникальный идентификатор пользователя
let userId = localStorage.getItem('userId');
if (!userId) {
  userId = 'user_' + Math.random().toString(36).substr(2, 9);
  localStorage.setItem('userId', userId);
}

// Сохранить список ботов через backend
saveBotsBtn.onclick = async function() {
  const bots = botListInput.value.split('\n').map(b => b.trim()).filter(b => b);
  if (bots.length === 0) return;
  await fetch('/api/bots', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bots })
  });
  alert('Список сохранён!');
};
// Проверить статусы введённых ботов через backend
const checkBotsBtn = document.getElementById('checkBots');
checkBotsBtn.onclick = async function() {
  const bots = botListInput.value.split('\n').map(b => b.trim()).filter(b => b);
  if (bots.length === 0) return;
  const res = await fetch('/api/bots');
  const allBots = await res.json();
  const filtered = allBots.filter(b => bots.includes(b.name));
  renderBots(filtered);
};
// Показать только "мои боты" (занятые текущим пользователем)
const myBotsBtn = document.getElementById('myBots');
myBotsBtn.onclick = async function() {
  const res = await fetch('/api/bots');
  const allBots = await res.json();
  const mine = allBots.filter(b => b.loaded_by === userId);
  renderBots(mine);
};

// Получить и отобразить всех ботов
async function fetchAndRenderBots() {
  const res = await fetch('/api/bots');
  const bots = await res.json();
  renderBots(bots);
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
        await fetch('/api/bots', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: info.name, status: 'busy', loaded_by: userId })
        });
        fetchAndRenderBots();
      }
    };
    botStatusList.appendChild(li);
  });
}

fetchAndRenderBots();
