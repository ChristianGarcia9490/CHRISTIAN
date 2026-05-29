// Canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game objects
const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 8;
const ballSpeed = 5;

let gameRunning = true;

// Player paddle (left side)
const playerPaddle = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 6
};

// Computer paddle (right side)
const computerPaddle = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 4
};

// Ball object
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: ballSpeed,
    dy: ballSpeed,
    radius: ballSize
};

// Score
let playerScore = 0;
let computerScore = 0;

// Input handling
const keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    if (e.key === ' ') {
        e.preventDefault();
        gameRunning = !gameRunning;
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// Mouse tracking for player paddle
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    playerPaddle.y = Math.max(0, Math.min(mouseY - playerPaddle.height / 2, canvas.height - playerPaddle.height));
});

// Update player paddle with keyboard input
function updatePlayerPaddle() {
    if (keys['arrowup'] || keys['w']) {
        playerPaddle.y = Math.max(0, playerPaddle.y - playerPaddle.speed);
    }
    if (keys['arrowdown'] || keys['s']) {
        playerPaddle.y = Math.min(canvas.height - playerPaddle.height, playerPaddle.y + playerPaddle.speed);
    }
}

// Update computer paddle (AI)
function updateComputerPaddle() {
    const computerCenter = computerPaddle.y + computerPaddle.height / 2;
    const ballCenter = ball.y;
    const difference = ballCenter - computerCenter;

    if (Math.abs(difference) > 35) {
        if (difference > 0) {
            computerPaddle.y = Math.min(canvas.height - computerPaddle.height, computerPaddle.y + computerPaddle.speed);
        } else {
            computerPaddle.y = Math.max(0, computerPaddle.y - computerPaddle.speed);
        }
    }
}

// Check collision between ball and paddle
function checkPaddleCollision(paddle) {
    if (
        ball.x - ball.radius < paddle.x + paddle.width &&
        ball.x + ball.radius > paddle.x &&
        ball.y - ball.radius < paddle.y + paddle.height &&
        ball.y + ball.radius > paddle.y
    ) {
        return true;
    }
    return false;
}

// Update ball
function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with top and bottom walls
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy;
        ball.y = Math.max(ball.radius, Math.min(canvas.height - ball.radius, ball.y));
    }

    // Ball collision with paddles
    if (checkPaddleCollision(playerPaddle)) {
        ball.dx = Math.abs(ball.dx);
        ball.x = playerPaddle.x + playerPaddle.width + ball.radius;
        // Add spin based on paddle position
        const deltaY = ball.y - (playerPaddle.y + playerPaddle.height / 2);
        ball.dy += deltaY * 0.05;
    }

    if (checkPaddleCollision(computerPaddle)) {
        ball.dx = -Math.abs(ball.dx);
        ball.x = computerPaddle.x - ball.radius;
        // Add spin based on paddle position
        const deltaY = ball.y - (computerPaddle.y + computerPaddle.height / 2);
        ball.dy += deltaY * 0.05;
    }

    // Ball goes out of bounds
    if (ball.x - ball.radius < 0) {
        computerScore++;
        document.getElementById('computerScore').textContent = computerScore;
        resetBall();
    }
    if (ball.x + ball.radius > canvas.width) {
        playerScore++;
        document.getElementById('playerScore').textContent = playerScore;
        resetBall();
    }
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * ballSpeed;
    ball.dy = (Math.random() - 0.5) * ballSpeed;
}

// Draw functions
function drawPaddle(paddle) {
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.shadowColor = '#00ff00';
    ctx.shadowBlur = 10;
}

function drawBall() {
    ctx.fillStyle = '#ff00ff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = '#ff00ff';
    ctx.shadowBlur = 10;
}

function drawCenter() {
    ctx.strokeStyle = '#00ff00';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawMiddleCircle() {
    ctx.strokeStyle = '#00ff00';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 30, 0, Math.PI * 2);
    ctx.stroke();
}

// Main game loop
function gameLoop() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.shadowBlur = 0;

    // Draw game elements
    drawCenter();
    drawMiddleCircle();

    if (gameRunning) {
        updatePlayerPaddle();
        updateComputerPaddle();
        updateBall();
    }

    drawPaddle(playerPaddle);
    drawPaddle(computerPaddle);
    drawBall();

    requestAnimationFrame(gameLoop);
}

// Start game
gameLoop();