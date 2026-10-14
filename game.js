
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Einstellungen
const MIN_DRAG_DISTANCE = 15;
const PROJECTILE_RADIUS = 7;
const SPEED_PER_PIXEL = 0.18;
const MAX_PROJECTILE_SPEED = 18;

const maxEnemies = 20;
let currentEnemies = 0;

// Mausbewegung
let dragging = false;
let startX = 0;
let startY = 0;

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
    constructor(x, y, speed, radius) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.radius = radius;
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

        ctx.fillStyle = "#000000";
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

    let enemy = new Enemy(x, y, 1.5, 20);
    enemies.push(enemy);
    currentEnemies++;
}
setInterval(() => {
    spawnEnemy();
}, 3000);


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
window.addEventListener("resize", resizeCanvas);

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
    console.log(projectiles.length);
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

    for (let i = projectiles.length - 1; i >= 0; i--) {
        const projectile = projectiles[i];

        // Position aktualisieren
        projectile.update();

        const margin = 200;
        if (
            projectile.x < -margin ||
            projectile.x > document.documentElement.scrollWidth + margin ||
            projectile.y < -margin ||
            projectile.y > document.documentElement.scrollHeight + margin
        ) {
            projectiles.splice(i, 1);
            continue;
        }

        // Projektil als Kreis zeichnen
        projectile.draw();
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.update();
        enemy.draw();
    }
    handleEnemyCollisions();
    // Nächsten Animationsframe starten
    requestAnimationFrame(animate);
}

// Animation starten
animate();
