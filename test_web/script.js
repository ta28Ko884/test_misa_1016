const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let score = 0;
let gameOver = false;

// Player (Date Masamune)
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 60,
    width: 50,
    height: 50,
    speed: 5,
    dx: 0
};

// Projectiles
const projectiles = [];
const projectileWidth = 5;
const projectileHeight = 15;
const projectileSpeed = 7;

// Enemies
const enemies = [];
const enemyWidth = 40;
const enemyHeight = 40;
const enemyRows = 4;
const enemyCols = 8;
const enemySpeed = 1;
let enemyDirection = 1; // 1 for right, -1 for left

function createEnemies() {
    for (let i = 0; i < enemyRows; i++) {
        for (let j = 0; j < enemyCols; j++) {
            enemies.push({
                x: j * (enemyWidth + 20) + 60,
                y: i * (enemyHeight + 20) + 50,
                width: enemyWidth,
                height: enemyHeight
            });
        }
    }
}

function drawPlayer() {
    // Body
    ctx.fillStyle = '#8B4513'; // Brown
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Wing
    ctx.fillStyle = '#A0522D';
    ctx.fillRect(player.x + 10, player.y + 10, player.width - 20, player.height - 20);

    // Eye
    ctx.fillStyle = 'white';
    ctx.fillRect(player.x + 35, player.y + 10, 5, 5);

    // Beak
    ctx.fillStyle = 'orange';
    ctx.beginPath();
    ctx.moveTo(player.x + player.width, player.y + player.height / 2);
    ctx.lineTo(player.x + player.width + 10, player.y + player.height / 2 - 5);
    ctx.lineTo(player.x + player.width + 10, player.y + player.height / 2 + 5);
    ctx.fill();
}

function drawProjectiles() {
    ctx.fillStyle = '#D2691E'; // Seed brown color
    projectiles.forEach(p => {
        ctx.fillRect(p.x, p.y, projectileWidth + 2, projectileHeight - 5);
    });
}

function drawEnemies() {
    ctx.fillStyle = 'red'; // Enemy color
    enemies.forEach(enemy => {
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });
}

function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 20, 30);
}

function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '50px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '20px Arial';
    ctx.fillText('Press Enter to Restart', canvas.width / 2, canvas.height / 2 + 20);
}

function updatePlayer() {
    player.x += player.dx;
    // Wall detection
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
}

function updateProjectiles() {
    projectiles.forEach((p, index) => {
        p.y -= projectileSpeed;
        if (p.y < 0) {
            projectiles.splice(index, 1);
        }
    });
}

function updateEnemies() {
    let moveDown = false;
    enemies.forEach(enemy => {
        enemy.x += enemySpeed * enemyDirection;
        if (enemy.x + enemy.width > canvas.width || enemy.x < 0) {
            moveDown = true;
        }
    });

    if (moveDown) {
        enemyDirection *= -1;
        enemies.forEach(enemy => {
            enemy.y += enemyHeight / 2;
        });
    }
}

function collisionDetection() {
    // Projectile vs Enemy
    projectiles.forEach((p, pIndex) => {
        enemies.forEach((enemy, eIndex) => {
            if (
                p.x < enemy.x + enemy.width &&
                p.x + projectileWidth > enemy.x &&
                p.y < enemy.y + enemy.height &&
                p.y + projectileHeight > enemy.y
            ) {
                // Collision detected
                projectiles.splice(pIndex, 1);
                enemies.splice(eIndex, 1);
                score += 10;
            }
        });
    });

    // Enemy vs Player
    enemies.forEach(enemy => {
        if (
            player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y
        ) {
            gameOver = true;
        }
        // Enemy reaches bottom
        if (enemy.y + enemy.height > canvas.height) {
            gameOver = true;
        }
    });
}

function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function gameLoop() {
    if (gameOver) {
        drawGameOver();
        return;
    }

    clear();
    updatePlayer();
    updateProjectiles();
    updateEnemies();
    collisionDetection();

    drawPlayer();
    drawProjectiles();
    drawEnemies();
    drawScore();

    if (enemies.length === 0) {
        // You win or next level
        createEnemies();
    }

    requestAnimationFrame(gameLoop);
}

function movePlayer(e) {
    if (e.key === 'ArrowRight' || e.key === 'Right') {
        player.dx = player.speed;
    } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
        player.dx = -player.speed;
    }
}

function stopPlayer(e) {
    if (e.key === 'ArrowRight' || e.key === 'Right' || e.key === 'ArrowLeft' || e.key === 'Left') {
        player.dx = 0;
    }
}

function shoot(e) {
    if (e.code === 'Space' && !gameOver) {
        projectiles.push({
            x: player.x + player.width / 2 - projectileWidth / 2,
            y: player.y
        });
    }
}

function restartGame(e) {
    if (e.key === 'Enter' && gameOver) {
        score = 0;
        gameOver = false;
        player.x = canvas.width / 2 - 25;
        projectiles.length = 0;
        enemies.length = 0;
        createEnemies();
        gameLoop();
    }
}

document.addEventListener('keydown', movePlayer);
document.addEventListener('keyup', stopPlayer);
document.addEventListener('keydown', shoot);
document.addEventListener('keydown', restartGame);

createEnemies();
gameLoop();
