const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Set default canvas dimensions
const defaultWidth = 600;
const defaultHeight = 600;
canvas.width = defaultWidth;
canvas.height = defaultHeight;

// Load images
const earthImage = new Image();
earthImage.src = "earth2.png"; // Custom Earth image

const meteorImage = new Image();
meteorImage.src = "meteor2.png"; // Custom Meteor image

const spaceBackground = new Image();
spaceBackground.src = "space.png"; // Space background image

const meteors = [];
let collisionCount = 0;
let gameRunning = false;
let timer = 20;
let explosions = []; // Store active explosions

// Function to generate random values
function random(min, max) {
    return Math.random() * (max - min) + min;
}

// Create meteors with random starting positions
function createMeteors() {
    meteors.length = 0; // Reset meteors
    for (let i = 0; i < 10; i++) {
        let angle = random(0, 2 * Math.PI);
        let distance = random(200, 250);
        meteors.push({
            x: 300 + Math.cos(angle) * distance,
            y: 300 + Math.sin(angle) * distance,
            dx: random(-1.5, 1.5),
            dy: random(-1.5, 1.5),
            collided: false
        });
    }
}

// Draw the centered space background
function drawBackground() {
    const bgX = (canvas.width - spaceBackground.width) / 2; // Center horizontally
    const bgY = (canvas.height - spaceBackground.height) / 2; // Center vertically
    ctx.drawImage(spaceBackground, bgX, bgY, spaceBackground.width, spaceBackground.height);
}

// Draw Earth using your custom image (increased size by 50%)
function drawEarth() {
    const earthSize = 150 * 1.5; // Increase size by 50%
    ctx.drawImage(earthImage, 300 - earthSize / 2, 300 - earthSize / 2, earthSize, earthSize);
}


// Draw meteors using the custom meteor image (reduced size by 50%)
function drawMeteors() {
    const meteorWidth = 57 / 2; // 50% of the original width
    const meteorHeight = 52 / 2; // 50% of the original height
    meteors.forEach(meteor => {
        if (!meteor.collided) {
            ctx.drawImage(meteorImage, meteor.x - meteorWidth / 2, meteor.y - meteorHeight / 2, meteorWidth, meteorHeight);
        }
    });
}

// Draw explosions (increased size by 50%)
function drawExplosions() {
    const explosionFontSize = 20 * 1.5; // 50% larger than the original font size
    explosions.forEach(explosion => {
        ctx.fillStyle = "red";
        ctx.font = `${explosionFontSize}px Arial`;
        ctx.fillText("💥", explosion.x - explosionFontSize / 3, explosion.y + explosionFontSize / 3);
    });
}

// Remove explosions after 1 second
function cleanupExplosions() {
    const now = Date.now();
    explosions = explosions.filter(explosion => now - explosion.timestamp < 1000);
}

// Reset game display
function resetGameDisplay() {
    createMeteors(); // Ensure meteors are regenerated
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground(); // Draw the space background
    drawEarth(); // Draw the Earth on reset
    drawMeteors(); // Draw the meteors on reset
    document.getElementById("collision-count").textContent = "0";
    document.getElementById("time-left").textContent = "20";
    document.getElementById("guess").value = "";
}

// Dynamically resize the canvas
function resizeCanvas() {
    const container = document.getElementById("game-container");
    const containerWidth = container.offsetWidth;
    const scaleFactor = containerWidth / defaultWidth;

    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${defaultHeight * scaleFactor}px`;
}

// Resize the canvas when the window resizes
window.addEventListener("resize", resizeCanvas);
window.addEventListener("load", resizeCanvas);

// Update game
function update() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawEarth();
    drawMeteors();
    drawExplosions();

    const earthRadius = (150 * 1.5) / 2; // Earth's updated radius

    meteors.forEach(meteor => {
        if (!meteor.collided) {
            meteor.x += meteor.dx;
            meteor.y += meteor.dy;

            // Adjusted collision detection
            const meteorCollisionRadius = 26 / 2; // Half the new meteor height
            let dist = Math.hypot(meteor.x - 300, meteor.y - 300); // Distance between meteor and Earth center
            if (dist < earthRadius + meteorCollisionRadius) { // Earth's radius + Meteor collision radius
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
    const userGuess = parseInt(document.getElementById("guess").value);

    if (isNaN(userGuess) || userGuess < 0 || userGuess > 10) {
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

    // Countdown timer
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

    const userGuess = parseInt(document.getElementById("guess").value) || 0;
    const message = userGuess === collisionCount
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
spaceBackground.onload = resetGameDisplay; // Ensure background is drawn after loading





