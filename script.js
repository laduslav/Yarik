const gameWrap = document.getElementById('gameWrap');
const road = document.getElementById('road');
const player = document.getElementById('player');
const scoreText = document.getElementById('score');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOver');
const finalScore = document.getElementById('finalScore');

const lanes = [16.67, 50, 83.33];
let lane = 1;
let score = 0;
let running = false;
let items = [];
let lastSpawn = 0;
let spawnDelay = 850;
let animationId;
let gameSpeed = 2.5;

function movePlayer(direction) {
  lane = Math.max(0, Math.min(2, lane + direction));
  player.style.left = `${lanes[lane]}%`;
}

function createItem() {
  const item = document.createElement('div');
  const isStar = Math.random() < 0.4;
  item.className = `item ${isStar ? 'star' : 'book'}`;
  item.textContent = isStar ? '★' : '▤';
  const laneIndex = Math.floor(Math.random() * 3);
  item.dataset.lane = laneIndex;
  item.style.left = `${lanes[laneIndex]}%`;
  item.style.top = '-40px';
  road.appendChild(item);
  items.push({ element: item, y: -40, isStar, lane: laneIndex });
}

function update(timestamp) {
  if (!running) return;

  if (timestamp - lastSpawn > spawnDelay) {
    createItem();
    lastSpawn = timestamp;
    spawnDelay = Math.max(420, spawnDelay * 0.985);
    gameSpeed += 0.025;
  }

  const roadHeight = road.clientHeight;
  const playerRect = player.getBoundingClientRect();

  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i];
    item.y += gameSpeed;
    item.element.style.top = `${item.y}px`;

    const itemRect = item.element.getBoundingClientRect();
    const hit = !(itemRect.right < playerRect.left || itemRect.left > playerRect.right ||
                  itemRect.bottom < playerRect.top || itemRect.top > playerRect.bottom);

    if (hit && item.lane === lane) {
      if (item.isStar) {
        score += 10;
        scoreText.textContent = score;
      } else {
        endGame();
        return;
      }
      item.element.remove();
      items.splice(i, 1);
    } else if (item.y > roadHeight + 60) {
      if (!item.isStar && item.lane === lane) score += 1;
      scoreText.textContent = score;
      item.element.remove();
      items.splice(i, 1);
    }
  }

  animationId = requestAnimationFrame(update);
}

function startGame() {
  items.forEach(item => item.element.remove());
  items = [];
  lane = 1;
  score = 0;
  gameSpeed = 2.5;
  spawnDelay = 850;
  lastSpawn = 0;
  scoreText.textContent = '0';
  player.style.left = `${lanes[lane]}%`;
  startScreen.classList.add('hidden');
  gameOverScreen.classList.add('hidden');
  running = true;
  cancelAnimationFrame(animationId);
  animationId = requestAnimationFrame(update);
}

function endGame() {
  running = false;
  cancelAnimationFrame(animationId);
  finalScore.textContent = score;
  gameOverScreen.classList.remove('hidden');
}

document.getElementById('startButton').addEventListener('click', startGame);
document.getElementById('restartButton').addEventListener('click', startGame);

window.addEventListener('keydown', event => {
  if (!running) return;
  if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') movePlayer(-1);
  if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') movePlayer(1);
});

let touchX = null;
gameWrap.addEventListener('touchstart', event => {
  touchX = event.changedTouches[0].clientX;
}, { passive: true });
gameWrap.addEventListener('touchend', event => {
  if (touchX === null || !running) return;
  const difference = event.changedTouches[0].clientX - touchX;
  if (Math.abs(difference) > 30) movePlayer(difference > 0 ? 1 : -1);
  touchX = null;
}, { passive: true });
