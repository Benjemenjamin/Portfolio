import { Player } from "../CommonClasses/player.js";
import { Platform } from "../CommonClasses/platform.js";
import { Enemy } from "../CommonClasses/enemy.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Einstellungen
const MIN_DRAG_DISTANCE = 15;
const PROJECTILE_RADIUS = 7;
const SPEED_PER_PIXEL = 0.18;
const MAX_PROJECTILE_SPEED = 18;
let flashlightOn = false;

let mouseX = 0;
let mouseY = 0;

const flashlightRange = 350;
const flashlightAngle = Math.PI / 5; // 36 Grad
const maxEnemies = 5;
let currentEnemies = 0;

let points = 0;

// Mausbewegung
let dragging = false;
let startX = 0;
let startY = 0;

const helperPlatforms = document.querySelectorAll(".helper-platform");
const infoPlatforms = document.querySelectorAll(".info-platform");
function positionHelperPlatforms() {
    helperPlatforms.forEach((helper, index) => {
        const info = infoPlatforms[index];

        if (!info) return;

        const infoRect = info.getBoundingClientRect();
        const areaRect = helper.offsetParent.getBoundingClientRect();

        // Unterkante der Info-Box relativ zum Positionierungselement
        const middle = infoRect.top + infoRect.height / 2 - areaRect.top;
        helper.style.top = `${middle - helper.offsetHeight / 2}px`;

        // Horizontaler Abstand zur Info-Box
        const gap = 39;

        if (index % 2 === 0) {
            // Zweite, vierte, sechste ... Plattform: rechts
            const left =
                infoRect.right - areaRect.left + gap;

            helper.style.left = `${left}px`;
        } else {

            // Erste, dritte, fünfte ... Plattform: links
            const left =
                infoRect.left - areaRect.left
                - helper.offsetWidth - gap;
            helper.style.left = `${left}px`;
        }
    });
}

positionHelperPlatforms();


const keys = {};

document.addEventListener("keydown", (event) => {
    keys[event.key.toLowerCase()] = true;

    if (event.code === "Space") {
        event.preventDefault();

        if (!keys["spacePressed"]) {
            player.jump();
            keys["spacePressed"] = true;
        }
    }
    if (event.code === "KeyS") {
        console.log("s");


        if (!keys["sPressed"]) {
            keys["sPressed"] = true;
        }
    }

});

document.addEventListener("keyup", (event) => {
    keys[event.key.toLowerCase()] = false;

    if (event.code === "Space") {
        keys["spacePressed"] = false;
    }
    if (event.code === "KeyS") {
        keys["sPressed"] = false;
    }
});


const platforms = [];
const player = new Player(300, 200, keys, platforms);


function getPlatforms() {
    document.querySelectorAll(".info-platform, .helper-platform, .screenshot-gallery").forEach((element) => {
        platforms.push(new Platform(element));
    });
    platforms.forEach((platform) => {
        console.log(platform.getBounds());
    });
}

getPlatforms();

class Animation {
    constructor(imagePaths, frameDuration = 80) {
        this.frames = [];
        this.currentFrame = 0;
        this.frameTimer = 0;
        this.frameDuration = frameDuration;
        this.loaded = false;

        let loadedImages = 0;

        imagePaths.forEach((path, index) => {
            const image = new Image();

            image.src = path;

            image.onload = () => {
                loadedImages++;

                if (loadedImages === imagePaths.length) {
                    this.loaded = true;
                }
            };

            this.frames[index] = image;
        });
    }

    update(deltaTime) {
        if (!this.loaded) return;

        this.frameTimer += deltaTime;

        if (this.frameTimer >= this.frameDuration) {
            this.currentFrame =
                (this.currentFrame + 1) % this.frames.length;

            this.frameTimer = 0;
        }
    }

    draw(ctx, x, y, width, height) {
        if (!this.loaded) return;

        const image = this.frames[this.currentFrame];

        ctx.drawImage(image, x, y, width, height);
    }
}

const quinnWalkPaths = [];

for (let i = 0; i < 45; i++) {
    const filename = `QuinnRunSequence.${String(i).padStart(4, "0")}.png`;

    quinnWalkPaths.push(`../Images/Animation/${filename}`);
}

const quinnWalk = new Animation(quinnWalkPaths, 80);

// Aktive Projektile
const projectiles = [];








const enemies = [];

function spawnEnemy() {
    if (currentEnemies >= maxEnemies) return;

    // Zufällige Plattform auswählen
    const platform = platforms[
        Math.floor(Math.random() * platforms.length)
    ];

    // Position und Größe der Plattform ermitteln
    const bounds = platform.getBounds();

    // Zufällige horizontale Position auf der Plattform
    const x = bounds.x + Math.random() * (bounds.width - 30);

    // Gegner direkt auf die Oberkante setzen
    const y = bounds.y - 40;

    const enemy = new Enemy(x, y, player, platforms);

    enemies.push(enemy);
    currentEnemies++;
}

setInterval(() => {
    spawnEnemy();
}, 1500);





// Canvas an die Fenstergröße anpassen
function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;

    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;

    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas, positionHelperPlatforms);



// Interaktive Elemente der Website erkennen
function isInteractiveElement(element) {
    return Boolean(
        element.closest(
            "a, button, input, textarea, select, label, " +
            "[contenteditable='true'], summary"
        )
    );
}

window.addEventListener("click", () => {
    flashlightOn = !flashlightOn;
});

document.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
});

// Maustaste drücken: Abschusspunkt festlegen
document.addEventListener("mousedown", (event) => {
    if (event.button !== 0) return;
    if (isInteractiveElement(event.target)) return;

    dragging = true;

    startX = event.clientX;
    startY = event.clientY;
});

// Maustaste loslassen: Projektil abschießen
document.addEventListener("mouseup", (event) => {
    if (!dragging || event.button !== 0) return;

    dragging = false;

    const endX = event.clientX;
    const endY = event.clientY;

    const dx = startX - endX;
    const dy = startY - endY;

    const distance = Math.hypot(dx, dy);

    // Kleine Bewegungen gelten als normale Klicks
    if (distance < MIN_DRAG_DISTANCE) return;

    // Flugrichtung entgegen der Zugrichtung
    const directionX = dx / distance;
    const directionY = dy / distance;

    // Zugdistanz bestimmt die Geschwindigkeit
    const speed = Math.min(
        distance * SPEED_PER_PIXEL,
        MAX_PROJECTILE_SPEED
    );

    // Neues Projektil erzeugen
    projectiles.push(new Projectile(
        startX + window.scrollX,
        startY + window.scrollY,
        directionX * speed,
        directionY * speed
    ));

});


function drawFlashlight(ctx) {
    if (!flashlightOn) return;

    // Spielerposition auf dem Bildschirm
    const playerX = player.x + player.width / 2 - window.scrollX;
    const playerY = player.y + player.height / 2 - window.scrollY;

    // Richtung zur Maus
    const angle = Math.atan2(
        mouseY - playerY,
        mouseX - playerX
    );

    ctx.save();

    ctx.fillStyle = "rgba(255, 245, 180, 0.25)";
    ctx.beginPath();
    ctx.moveTo(playerX, playerY);

    ctx.arc(
        playerX,
        playerY,
        flashlightRange,
        angle - flashlightAngle / 2,
        angle + flashlightAngle / 2
    );

    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

function isEnemyIlluminated(enemy) {
    if (!flashlightOn) return false;

    const playerX = player.x + player.width / 2;
    const playerY = player.y + player.height / 2;

    const enemyX = enemy.x + enemy.width / 2;
    const enemyY = enemy.y + enemy.height / 2;

    const dx = enemyX - playerX;
    const dy = enemyY - playerY;

    const distance = Math.hypot(dx, dy);

    // Außerhalb der Reichweite?
    if (distance > flashlightRange) return false;

    // Winkel zwischen Spieler und Maus
    const mouseWorldX = mouseX + window.scrollX;
    const mouseWorldY = mouseY + window.scrollY;

    const flashlightDirection = Math.atan2(
        mouseWorldY - playerY,
        mouseWorldX - playerX
    );

    // Winkel zwischen Spieler und Gegner
    const enemyDirection = Math.atan2(dy, dx);

    let angleDifference = enemyDirection - flashlightDirection;

    // Winkel auf -PI bis PI normalisieren
    angleDifference = Math.atan2(
        Math.sin(angleDifference),
        Math.cos(angleDifference)
    );

    return Math.abs(angleDifference) <= flashlightAngle / 2;
}

// Ziehvorgang abbrechen, wenn das Fenster den Fokus verliert
window.addEventListener("blur", () => {
    dragging = false;
});

// Projektile bewegen und zeichnen
function animate() {
    ctx.clearRect(
        0,
        0,
        window.innerWidth,
        window.innerHeight
    );
    player.update();
    player.draw(ctx);

    quinnWalk.update(16);
    quinnWalk.draw(
        ctx,
        300 - window.scrollX,
        200 - window.scrollY,
        120,
        120
    );

    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.isLit = isEnemyIlluminated(enemy);
        enemy.update();
        enemy.draw(ctx);
    }

    drawFlashlight(ctx);

    // handleEnemyCollisions();
    // Nächsten Animationsframe starten
    requestAnimationFrame(animate);
}

// Animation starten
animate();