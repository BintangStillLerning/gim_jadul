// Enhanced Paddle Ball Game with Power-ups and Multiple Balls

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth * 0.9;
  canvas.height = window.innerHeight * 0.7;
}
resizeCanvas();

const paddle = {
  width: 120,
  height: 15,
  x: canvas.width / 2 - 60,
  y: canvas.height - 30,
  speed: 15, // increased speed
  dx: 0,
};

// Block settings
const blockWidth = 60;
const blockHeight = 20;
let blockPadding = 8;
const blockOffsetTop = 100;
const blockOffsetLeft = 35;

let blockRowCount;
let blockColumnCount;
const blockDestroyedSound = new Audio("./destroyed.wav")

blockDestroyedSound.volume = 0.7

let blocks = [];

function createBlocks() {
  blocks = [];
  for (let c = 0; c < blockColumnCount; c++) {
    blocks[c] = [];
    for (let r = 0; r < blockRowCount; r++) {
      blocks[c][r] = {
        x: 0,
        y: 0,
        status: 1, // 1 = red block, 2 = green block (goal)
      };
    }
  }
  // Set the top middle block as green goal block
  const greenBlockColumn = Math.floor(blockColumnCount / 2);
  if (blocks[greenBlockColumn] && blocks[greenBlockColumn][0]) {
    blocks[greenBlockColumn][0].status = 2;
  }
}

function updateBlockCounts() {
  const availableWidth = canvas.width - blockOffsetLeft * 2;
  blockColumnCount = Math.floor(availableWidth / (blockWidth + blockPadding));

  const availableHeight = canvas.height - blockOffsetTop - 150; // leave space for paddle and UI
  blockRowCount = Math.floor(availableHeight / (blockHeight + blockPadding));

  // Adjust blockPadding based on screen width (optional)
  if (window.innerWidth < 600) {
    blockPadding = 3;
  } else if (window.innerWidth < 900) {
    blockPadding = 5;
  } else {
    blockPadding = 8;
  }
}

function initializeGame() {
  updateBlockCounts();
  createBlocks();
  paddle.y = canvas.height - 30;
  paddle.x = Math.min(paddle.x, canvas.width - paddle.width);
}

window.addEventListener('resize', () => {
  resizeCanvas();
  initializeGame();
});

class Ball {
  constructor(x, y, dx, dy) {
    this.x = x;
    this.y = y;
    this.radius = 12;
    this.dx = dx;
    this.dy = dy;
    this.trail = [];
    this.maxTrailLength = 15;
    this.multiHit = false; // power-up effect: destroy 5 blocks at once
    this.multiHitCount = 0;
  }

  draw() {
    // Draw trail
    ctx.fillStyle = 'rgba(0, 255, 204, 0.3)';
    for (let i = 0; i < this.trail.length; i++) {
      const pos = this.trail[i];
      const alpha = (i + 1) / this.trail.length / 2;
      ctx.beginPath();
      ctx.shadowColor = '#00ffcc';
      ctx.shadowBlur = 10;
      ctx.fillStyle = `rgba(0, 255, 204, ${alpha})`;
      ctx.arc(pos.x, pos.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    // Draw main ball
    ctx.beginPath();
    ctx.shadowColor = '#00ffcc';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#00ffcc';
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  update() {
    this.x += this.dx;
    this.y += this.dy;

    // Add current position to trail
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > this.maxTrailLength) {
      this.trail.shift();
    }

    // Wall collisions (left/right)
    if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
      this.dx = -this.dx;
    }
    // Ceiling collision
    if (this.y - this.radius < 0) {
      this.dy = -this.dy;
    }
  }
}

class PowerUp {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.width = 20;
    this.height = 20;
    this.type = type; // 'multiBall' or 'multiHit'
    this.speed = 3;
    this.active = true;
  }

  draw() {
    ctx.beginPath();
    if (this.type === 'multiBall') {
      ctx.fillStyle = '#00ff00'; // green power-up
    } else if (this.type === 'multiHit') {
      ctx.fillStyle = '#ff00ff'; // magenta power-up
    }
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 15;
    ctx.rect(this.x, this.y, this.width, this.height);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.closePath();
  }

  update() {
    this.y += this.speed;
    if (this.y > canvas.height) {
      this.active = false;
    }
  }
}

let balls = [new Ball(canvas.width / 2, canvas.height / 2, 4, -4)];
let powerUps = [];

let score = 0;
let isGameOver = false;
let isGameWon = false;

// Draw paddle
function drawPaddle() {
  ctx.fillStyle = '#00ffcc';
  ctx.shadowColor = '#00ffcc';
  ctx.shadowBlur = 15;
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
  ctx.shadowBlur = 0;
}

// Draw blocks
function drawBlocks() {
  for (let c = 0; c < blockColumnCount; c++) {
    for (let r = 0; r < blockRowCount; r++) {
      const b = blocks[c][r];
      if (b.status > 0) {
        b.x = c * (blockWidth + blockPadding) + blockOffsetLeft;
        b.y = r * (blockHeight + blockPadding) + blockOffsetTop;
        ctx.beginPath();
        if (b.status === 1) {
          ctx.fillStyle = '#ff0000'; // red block
          ctx.shadowColor = '#ff0000';
        } else if (b.status === 2) {
          ctx.fillStyle = '#00ff00'; // green block (goal)
          ctx.shadowColor = '#00ff00';
        }
        ctx.shadowBlur = 15;
        ctx.rect(b.x, b.y, blockWidth, blockHeight);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.closePath();
      }
    }
  }
}

// Draw score
function drawScore() {
  ctx.font = '20px Orbitron, sans-serif';
  ctx.fillStyle = '#00ffcc';
  ctx.textAlign = 'left';
  ctx.fillText(`Score: ${score}`, 20, 30);
}

// Draw game over text
function drawGameOver() {
  ctx.font = '48px Orbitron, sans-serif';
  ctx.fillStyle = '#ff0040';
  ctx.textAlign = 'center';
  ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 20);
  ctx.font = '24px Roboto, sans-serif';
  ctx.fillText('Press Space to Restart', canvas.width / 2, canvas.height / 2 + 20);
}

// Draw game won text
function drawGameWon() {
  ctx.font = '48px Orbitron, sans-serif';
  ctx.fillStyle = '#00ff00';
  ctx.textAlign = 'center';
  ctx.fillText('You Win!', canvas.width / 2, canvas.height / 2 - 20);
  ctx.font = '24px Roboto, sans-serif';
  ctx.fillText('Press Space to Restart', canvas.width / 2, canvas.height / 2 + 20);
}

//nigga
// Update paddle position
function updatePaddle() {
  paddle.x += paddle.dx;
  if (paddle.x < 0) paddle.x = 0;
  if (paddle.x + paddle.width > canvas.width) paddle.x = canvas.width - paddle.width;
}

let audioContext;
function unlockAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const buffer = audioContext.createBuffer(1, 1, 22050);
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start(0);
  }
}

window.addEventListener('click', unlockAudioContext, { once: true });
window.addEventListener('keydown', unlockAudioContext, { once: true });

const blockHitSound = new Audio('sound efek game jadul/sfx pas ancurin maze2.wav');

// Collision detection between ball and blocks
function collisionDetection(ball) {
  for (let c = 0; c < blockColumnCount; c++) {
    for (let r = 0; r < blockRowCount; r++) {
      const b = blocks[c][r];
      if (b.status > 0) {
        if (
          ball.x > b.x &&
          ball.x < b.x + blockWidth &&
          ball.y - ball.radius < b.y + blockHeight &&
          ball.y + ball.radius > b.y
        ) {
          if (ball.multiHit) {
            // Destroy up to 5 blocks in a row horizontally
            let destroyed = 0;
            for (let i = c; i < blockColumnCount && destroyed < 5; i++) {
              if (blocks[i][r].status > 0) {
                if (blocks[i][r].status === 2) {
                  isGameWon = true;
                }
                blocks[i][r].status = 0;
                score++;
                destroyed++;
              }
            }
            ball.multiHit = false;
            ball.multiHitCount = 0;
          } else {
            if (b.status === 2) {
              isGameWon = true;
              blockDestroyedSound.currentTime = 0;
              blockDestroyedSound.play();
            }
            b.status = 0;
            score++;
            blockDestroyedSound.currentTime = 0;
            blockDestroyedSound.play();
          }
          ball.dy = -ball.dy;

          // Play block hit sound
          blockHitSound.currentTime = 0;
          blockHitSound.play();

          // Spawn power-up randomly (30% chance)
          if (Math.random() < 0.3) {
            const type = Math.random() < 0.5 ? 'multiBall' : 'multiHit';
            powerUps.push(new PowerUp(b.x + blockWidth / 2 - 10, b.y + blockHeight, type));
          }

          return; // only one block per collision
        }
      }
    }
  }
}

// Update ball position and handle collisions
function updateBall(ball, index) {
  ball.update();

  // Paddle collision
  if (
    ball.y + ball.radius > paddle.y &&
    ball.x > paddle.x &&
    ball.x < paddle.x + paddle.width
  ) {
    ball.dy = -ball.dy;
    ball.y = paddle.y - ball.radius; // reposition ball above paddle
  }

  // Bottom collision - remove ball
  if (ball.y - ball.radius > canvas.height) {
    balls.splice(index, 1);
    if (balls.length === 0) {
      isGameOver = true;
    }
  }

  collisionDetection(ball);
}

// Update power-ups
function updatePowerUps() {
  powerUps.forEach((powerUp, index) => {
    powerUp.update();
    if (
      powerUp.y + powerUp.height > paddle.y &&
      powerUp.x + powerUp.width > paddle.x &&
      powerUp.x < paddle.x + paddle.width
    ) {
      // Activate power-up
      if (powerUp.type === 'multiBall') {
        // Add an extra ball with random direction
        const newBall = new Ball(
          paddle.x + paddle.width / 2,
          paddle.y - 20,
          (Math.random() * 4 + 2) * (Math.random() < 0.5 ? -1 : 1),
          - (Math.random() * 4 + 2)
        );
        balls.push(newBall);
      } else if (powerUp.type === 'multiHit') {
        // Activate multi-hit on all balls
        balls.forEach(b => {
          b.multiHit = true;
          b.multiHitCount = 0;
        });
      }
      powerUps.splice(index, 1);
    } else if (!powerUp.active) {
      powerUps.splice(index, 1);
    }
  });
}

// Clear canvas
function clear() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Game loop
function loop() {
  clear();
  drawPaddle();
  drawBlocks();
  drawScore();

  balls.forEach((ball, index) => {
    ball.draw();
    updateBall(ball, index);
  });

  powerUps.forEach(powerUp => {
    powerUp.draw();
  });

  if (isGameOver) {
    drawGameOver();
    return;
  }
  if (isGameWon) {
    drawGameWon();
    return;
  }

  updatePaddle();
  updatePowerUps();

  requestAnimationFrame(loop);
}

// Keyboard event handlers
function keyDown(e) {
  if (e.key === 'ArrowRight') {
    paddle.dx = paddle.speed;
  } else if (e.key === 'ArrowLeft') {
    paddle.dx = -paddle.speed;
  } else if (e.key === ' ' && (isGameOver || isGameWon)) {
    restartGame();
  }
}

function keyUp(e) {
  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
    paddle.dx = 0;
  }
}

function restartGame() {
  score = 0;
  isGameOver = false;
  isGameWon = false;
  balls = [new Ball(canvas.width / 2, canvas.height / 2, 4, -4)];
  powerUps = [];
  paddle.x = canvas.width / 2 - paddle.width / 2;
  paddle.speed = 10;
  initializeGame();
  loop();
}

// Event listeners
document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

// Initialize game for the first time
initializeGame();

// Start the game loop
loop();
