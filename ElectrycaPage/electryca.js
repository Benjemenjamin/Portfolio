import { Player } from "../CommonClasses/player.js";
import { Platform } from "../CommonClasses/platform.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Einstellungen
const MIN_DRAG_DISTANCE = 15;
const PROJECTILE_RADIUS = 7;
const SPEED_PER_PIXEL = 0.18;
const MAX_PROJECTILE_SPEED = 18;

const maxEnemies = 20;
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
        const gap = 30;

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

class Projectile {
    x;
    y;
    vx;
    vy;

    constructor(x, y, vx, vy) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
    }

    draw() {
        ctx.beginPath();
        const screenX = this.x - window.scrollX;
        const screenY = this.y - window.scrollY;

        ctx.arc(
            screenX,
            screenY,
            PROJECTILE_RADIUS,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "#e74c3c";
        ctx.fill();
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
    }
}



class Enemy {
    x;
    y;
    speed;
    radius;
    color;
    points;
    constructor(x, y, speed, radius, color, points) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.radius = radius;
        this.color = color;
        this.points = points;
    }

    draw() {
        ctx.beginPath();
        const screenX = this.x - window.scrollX;
        const screenY = this.y - window.scrollY;

        ctx.arc(
            screenX,
            screenY,
            this.radius,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update() {
        // Aktuelle Mausposition im Dokument
        const targetX = mouseX + window.scrollX;
        const targetY = mouseY + window.scrollY;

        // Richtung zur Maus berechnen
        const dx = targetX - this.x;
        const dy = targetY - this.y;

        const distance = Math.hypot(dx, dy);

        // Nur bewegen, wenn der Gegner nicht direkt auf der Maus liegt
        if (distance > 0) {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }
    }
}

class fastEnemy extends Enemy {
    constructor(x, y) {
        super(x, y, 5, 15, "#3498db", 2);
    }
}


let mouseX = 0;
let mouseY = 0;

document.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
});



const enemies = [];

function spawnEnemy() {
    if (currentEnemies >= maxEnemies) return;

    const pageWidth = document.documentElement.scrollWidth;
    const pageHeight = document.documentElement.scrollHeight;

    let x = Math.random() * pageWidth
    let y = Math.random() * pageHeight

    let enemy;

    if (Math.random() < 0.7) {
        enemy = new Enemy(x, y, 3, 20, "#000000", 1);
    } else {
        enemy = new fastEnemy(x, y);
    }
    enemies.push(enemy);
    currentEnemies++;
}
setInterval(() => {
    spawnEnemy();
}, 1500);


function handleEnemyCollisions() {
    for (let i = 0; i < enemies.length; i++) {
        for (let j = i + 1; j < enemies.length; j++) {
            const a = enemies[i];
            const b = enemies[j];

            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const distance = Math.hypot(dx, dy);

            const minDistance = a.radius + b.radius;

            if (distance < minDistance && distance > 0) {
                const overlap = minDistance - distance;

                const nx = dx / distance;
                const ny = dy / distance;

                // Beide Gegner voneinander wegschieben
                a.x -= nx * overlap / 2;
                a.y -= ny * overlap / 2;

                b.x += nx * overlap / 2;
                b.y += ny * overlap / 2;
            }
        }
        const enemy = enemies[i];
        for (let j = projectiles.length - 1; j >= 0; j--) {
            const projectile = projectiles[j];
            const dx = projectile.x - enemy.x;
            const dy = projectile.y - enemy.y;
            const distance = Math.hypot(dx, dy);

            if (distance < enemy.radius + PROJECTILE_RADIUS) {
                // Projektil und Gegner entfernen
                projectiles.splice(j, 1);
                enemies.splice(i, 1);
                currentEnemies--;
                points += enemy.points;
                console.log(points);
                break;
            }
        }
    }
}


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
    // for (let i = projectiles.length - 1; i >= 0; i--) {
    //     const projectile = projectiles[i];

    //     // Position aktualisieren
    //     projectile.update();

    //     const margin = 200;
    //     if (
    //         projectile.x < -margin ||
    //         projectile.x > document.documentElement.scrollWidth + margin ||
    //         projectile.y < -margin ||
    //         projectile.y > document.documentElement.scrollHeight + margin
    //     ) {
    //         projectiles.splice(i, 1);
    //         continue;
    //     }

    //     // Projektil als Kreis zeichnen
    //     projectile.draw();
    // }

    // for (let i = enemies.length - 1; i >= 0; i--) {
    //     const enemy = enemies[i];
    //     enemy.update();
    //     enemy.draw();
    // }

    // handleEnemyCollisions();
    // Nächsten Animationsframe starten
    requestAnimationFrame(animate);
}

// Animation starten
animate();