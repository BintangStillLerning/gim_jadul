// Pong game with two players and vertical paddles

window.onload = function() {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  // Ball properties
  const ballRadius = 10;
  let x = canvas.width / 2;
  let y = canvas.height / 2;
  let dx = 5 * (Math.random() > 0.5 ? 1 : -1);
  let dy = 3 * (Math.random() > 0.5 ? 1 : -1);

  // Paddle properties
  const paddleWidth = 10;
  const paddleHeight = 100;
  const paddleSpeed = 7;

  // Left paddle position
  let leftPaddleY = (canvas.height - paddleHeight) / 2;
  // Right paddle position
  let rightPaddleY = (canvas.height - paddleHeight) / 2;

  // Key press states
  let wPressed = false;
  let sPressed = false;
  let upPressed = false;
  let downPressed = false;

  // Event listeners for key presses
  document.addEventListener('keydown', function(e) {
    if (e.key === 'w') wPressed = true;
    if (e.key === 's') sPressed = true;
    if (e.key === 'ArrowUp') upPressed = true;
    if (e.key === 'ArrowDown') downPressed = true;
  });

  document.addEventListener('keyup', function(e) {
    if (e.key === 'w') wPressed = false;
    if (e.key === 's') sPressed = false;
    if (e.key === 'ArrowUp') upPressed = false;
    if (e.key === 'ArrowDown') downPressed = false;
  });

  function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.shadowColor = 'white';
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.closePath();
  }

  function drawPaddle(x, y) {
    ctx.beginPath();
    ctx.rect(x, y, paddleWidth, paddleHeight);
    ctx.fillStyle = '#66aaff';
    ctx.shadowColor = '#66aaff';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.closePath();
  }

  function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBall();
    drawPaddle(10, leftPaddleY);
    drawPaddle(canvas.width - paddleWidth - 10, rightPaddleY);

    // Move ball
    x += dx;
    y += dy;

    // Bounce off top and bottom walls
    if (y + ballRadius > canvas.height || y - ballRadius < 0) {
      dy = -dy;
    }

    // Bounce off left paddle
    if (
      x - ballRadius < 10 + paddleWidth &&
      y > leftPaddleY &&
      y < leftPaddleY + paddleHeight
    ) {
      dx = -dx;
      // Add some randomness to dy
      dy = 3 * (Math.random() > 0.5 ? 1 : -1);
    }

    // Bounce off right paddle
    if (
      x + ballRadius > canvas.width - paddleWidth - 10 &&
      y > rightPaddleY &&
      y < rightPaddleY + paddleHeight
    ) {
      dx = -dx;
      // Add some randomness to dy
      dy = 3 * (Math.random() > 0.5 ? 1 : -1);
    }

    // Reset ball if it goes beyond left or right edge
    if (x + ballRadius < 0 || x - ballRadius > canvas.width) {
      x = canvas.width / 2;
      y = canvas.height / 2;
      dx = 3 * (Math.random() > 0.5 ? 1 : -1);
      dy = 2 * (Math.random() > 0.5 ? 1 : -1);
    }

    // Move left paddle
    if (wPressed && leftPaddleY > 0) {
      leftPaddleY -= paddleSpeed;
    }
    if (sPressed && leftPaddleY < canvas.height - paddleHeight) {
      leftPaddleY += paddleSpeed;
    }

    // Move right paddle
    if (upPressed && rightPaddleY > 0) {
      rightPaddleY -= paddleSpeed;
    }
    if (downPressed && rightPaddleY < canvas.height - paddleHeight) {
      rightPaddleY += paddleSpeed;
    }

    requestAnimationFrame(update);
  }

  update();
};
