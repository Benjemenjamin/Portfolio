import { Player } from "../CommonClasses/player.js";
import { Platform } from "../CommonClasses/platform.js";
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Einstellungen
const MIN_DRAG_DISTANCE = 15;
const PROJECTILE_RADIUS = 7;
const SPEED_PER_PIXEL = 0.18;
const MAX_PROJECTILE_SPEED = 18;
let lastTime = 0;
const maxEnemies = 20;
let currentEnemies = 0;

let points = 0;

// Mausbewegung
let dragging = false;
let startX = 0;
let startY = 0;
let currentDoor = null;


let pressedA = false
let pressedB = false
const keys = {};


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
// const player = new Player(300, 200, keys, platforms);

const tutorialPlatform = document.querySelector(".TutorialPlatform");
const bounds = tutorialPlatform.getBoundingClientRect();

const spawnX = bounds.left + window.scrollX + bounds.width / 2 - 15;
const spawnY = bounds.top + window.scrollY - 40;

const player = new Player(spawnX, spawnY, keys, platforms);

document.querySelectorAll(".project-card, .ladder-block, .TutorialPlatform").forEach((element) => {
    platforms.push(new Platform(element));
});
platforms.forEach((platform) => {
    console.log(platform.getBounds());
});

document.addEventListener("keydown", (event) => {
    keys[event.key.toLowerCase()] = true;

    switch (event.code) {
        case "Space":
            event.preventDefault();

            if (!keys["spacePressed"]) {
                player.jump();
                completeTutorialTask("jumpCheck");
                keys["spacePressed"] = true;
            }
            break;

        case "KeyS":
            console.log("s");
            if (!keys["sPressed"]) {
                keys["sPressed"] = true;
                completeTutorialTask("downCheck");
            }
            break;

        case "KeyA":
            console.log("a");
            pressedA = true
            if (pressedA && pressedB) {
                completeTutorialTask("moveCheck");
            }
            break;

        case "KeyD":
            console.log("d");
            pressedB = true
            if (pressedA && pressedB) {
                completeTutorialTask("moveCheck");
            }
            break;

        case "KeyE":
            console.log("e");
            openDoor(currentDoor);
            break;
    }
});


let manualScrolling = false;

window.addEventListener("wheel", () => {
    manualScrolling = true;
});

window.addEventListener("touchmove", () => {
    manualScrolling = true;
});

window.addEventListener("keydown", (event) => {
    const scrollKeys = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "];

    if (scrollKeys.includes(event.key)) {
        manualScrolling = true;
    }
});


function checkPlayerVisibility() {


    const playerMoving =
        keys["a"] ||
        keys["d"] ||
        keys["arrowleft"] ||
        keys["arrowright"] ||
        keys[" "] ||
        keys["space"] ||
        keys["s"];

    if (playerMoving) {
        manualScrolling = false;
    }

    if (manualScrolling) return;

    const playerScreenX = player.x - window.scrollX;
    const playerScreenY = player.y - window.scrollY;

    const isOutside =
        playerScreenX + player.width < 0 ||
        playerScreenX > window.innerWidth ||
        playerScreenY + player.height < 0 ||
        playerScreenY > window.innerHeight;

    if (isOutside) {
        const targetX = player.x + player.width / 2 - window.innerWidth / 2;
        const targetY = player.y + player.height / 2 - window.innerHeight / 2;

        window.scrollTo({
            left: Math.max(0, Math.min(targetX, document.documentElement.scrollWidth - window.innerWidth)),
            top: Math.max(0, Math.min(targetY, document.documentElement.scrollHeight - window.innerHeight)),
            behavior: "smooth"
        });
    }
}
let byDoor = false;
function checkDoorCollision() {
    const doors = document.querySelectorAll(".project-entry");

    let foundDoor = null;

    for (const door of doors) {
        const bounds = door.getBoundingClientRect();

        const doorX = bounds.left + window.scrollX;
        const doorY = bounds.top + window.scrollY;

        const image = door.querySelector("img");

        if (
            player.x + player.width > doorX &&
            player.x < doorX + bounds.width &&
            player.y + player.height > doorY &&
            player.y < doorY + bounds.height
        ) {
            foundDoor = door;
        }
    }

    // Erst nach der Schleife den Zustand aktualisieren
    currentDoor = foundDoor;
    byDoor = currentDoor !== null;

    // for (const door of doors) {
    //     const image = door.querySelector("img");

    //     if (door === currentDoor) {
    //         image.src = "Images/jpg(1).png";
    //         console.log("Door open");

    //     } else {
    //         image.src = "Images/jpg.png";
    //     }
    // }
    for (const door of doors) {
        const image = door.querySelector("img");

        const newSrc = door === currentDoor
            ? "Images/jpg(1).png"
            : "Images/jpg.png";

        // Nur ändern, wenn sich das Bild tatsächlich ändern muss
        if (image.getAttribute("src") !== newSrc) {
            image.src = newSrc;
            console.log("Changed src");
        }
    }
}

function openDoor(door) {
    if (!byDoor) return;
    if (!door) return;


    if (door.dataset.tutorial === "true") {
        completeTutorialTask("doorCheck");
    }
    else {
        window.location.href = door.dataset.link;
    }
}

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

function completeTutorialTask(taskId) {
    const checkbox = document.getElementById(taskId);
    checkbox.classList.add("completed");
}

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

});



// Ziehvorgang abbrechen, wenn das Fenster den Fokus verliert
window.addEventListener("blur", () => {
    dragging = false;
});

// Projektile bewegen und zeichnen
function animate(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    ctx.clearRect(
        0,
        0,
        window.innerWidth,
        window.innerHeight
    );
    player.update(deltaTime);
    player.draw(ctx);
    checkPlayerVisibility();
    checkDoorCollision()

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
