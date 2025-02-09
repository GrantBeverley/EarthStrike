const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game Variables
const defaultWidth = 600;
const defaultHeight = 600;
canvas.width = defaultWidth;
canvas.height = defaultHeight;

const earthImage = new Image();
earthImage.src = "earth2.png";

const meteorImage = new Image();
meteorImage.src = "meteor2.png";

const spaceBackground = new Image();
spaceBackground.src = "space.png";

let meteors = [];
let collisionCount = 0;
let gameRunning = false;
let timer = 20;
let explosions = [];
let userGuess = 0;

// Function to create meteors
function createMeteors() {
    meteors = [];
    for (let i = 0; i < 10; i++) {
        let angle = Math.random() * 2 * Math.PI;
        let distance = Math.random() * 50 + 200;
        meteors.push({
            x: 300 + Math.cos(angle) * distance,
            y: 300 + Math.sin(angle) * distance,
            dx: Math.random() * 2 - 1,
            dy: Math.random() * 2 - 1,
            collided: false
        });
    }
}

// Draw background
function drawBackground() {
    ctx.drawImage(spaceBackground, 0, 0, canvas.width, canvas.height);
}

// Draw Earth
function drawEarth() {
    const earthSize = 150 * 1.5;
    ctx.drawImage(earthImage, 300 - earthSize / 2, 300 - earthSize / 2, earthSize, earthSize);
}

// Draw meteors
function drawMeteors() {
    meteors.forEach((meteor) => {
        if (!meteor.collided) {
            ctx.drawImage(meteorImage, meteor.x - 28.5, meteor.y - 26, 57, 52);
        }
    });
}

// Draw explosions
function drawExplosions() {
    explosions.forEach((explosion) => {
        ctx.fillStyle = "red";
        ctx.font = "30px Arial";
        ctx.fillText("💥", explosion.x - 15, explosion.y + 10);
    });
}

// Cleanup explosions
function cleanupExplosions() {
    const now = Date.now();
    explosions = explosions.filter((explosion) => now - explosion.timestamp < 1000);
}

// Update guess display
function updateGuessDisplay() {
    document.getElementById("guess").textContent = userGuess;
}

// Handle guess button clicks
document.getElementById("decreaseGuess").addEventListener("click", () => {
    if (userGuess > 0) {
        userGuess--;
        updateGuessDisplay();
    }
});

document.getElementById("increaseGuess").addEventListener("click", () => {
    if (userGuess < 10) {
        userGuess++;
        updateGuessDisplay();
    }
});

// Reset game display
function resetGameDisplay() {
    createMeteors();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawEarth();
    drawMeteors();
    document.getElementById("collision-count").textContent = "0";
    document.getElementById("time-left").textContent = "20";
    userGuess = 0;
    updateGuessDisplay();
}

// Update game
function update() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawEarth();
    drawMeteors();
    drawExplosions();

    const earthRadius = (150 * 1.5) / 2;

    meteors.forEach((meteor) => {
        if (!meteor.collided) {
            meteor.x += meteor.dx;
            meteor.y += meteor.dy;

            const meteorCollisionRadius = 26 / 2;
            const dist = Math.hypot(meteor.x - 300, meteor.y - 300);

            if (dist < earthRadius + meteorCollisionRadius) {
                meteor.collided = true;
                collisionCount++;
                document.getElementById("collision-count").textContent = collisionCount;
                explosions.push({ x: meteor.x, y: meteor.y, timestamp: Date.now() });
            }
        }
    });

    cleanupExplosions();
    requestAnimationFrame(update);
}

// Start game logic
function startGame() {
    if (userGuess < 0 || userGuess > 10) {
        alert("Please enter a valid guess between 0 and 10.");
        return;
    }

    gameRunning = true;
    collisionCount = 0;
    timer = 20;
    document.getElementById("collision-count").textContent = "0";
    document.getElementById("time-left").textContent = timer;
    document.getElementById("startButton").style.display = "none";
    document.getElementById("playAgainButton").style.display = "none";

    createMeteors();
    update();

    const countdown = setInterval(() => {
        timer--;
        document.getElementById("time-left").textContent = timer;

        if (timer <= 0) {
            clearInterval(countdown);
            endGame();
        }
    }, 1000);
}

// End game logic
function endGame() {
    gameRunning = false;

    const message =
        userGuess === collisionCount
            ? `Well done! Your guess of ${userGuess} was correct!`
            : `Sorry, you guessed ${userGuess}, but ${collisionCount} actually happened.`;

    alert(message);
    document.getElementById("playAgainButton").style.display = "inline-block";
}

// Play again logic
function playAgain() {
    gameRunning = false;
    resetGameDisplay();
    document.getElementById("startButton").style.display = "inline-block";
    document.getElementById("playAgainButton").style.display = "none";
}

// Event listeners
document.getElementById("startButton").addEventListener("click", startGame);
document.getElementById("playAgainButton").addEventListener("click", playAgain);

// Initialize the display
spaceBackground.onload = resetGameDisplay;
