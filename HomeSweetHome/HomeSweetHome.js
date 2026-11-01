import { Player } from "../CommonClasses/player.js";
import { Platform } from "../CommonClasses/platform.js";
import { Enemy } from "../CommonClasses/enemy.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Einstellungen
let mouseX = 0;
let mouseY = 0;



const maxEnemies = 5;
let currentEnemies = 0;

let points = 0;

// Mausbewegung
let startX = 0;
let startY = 0;
let lastTime = 0;

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


export class Furniture {
    constructor(x, y, imageSrc, platforms) {
        this.x = x;
        this.y = y;

        this.width = 50;
        this.height = 50;

        this.image = new Image();
        this.image.src = imageSrc;

        this.platforms = platforms;

        this.isPickedUp = false;
        this.isThrown = false;

        this.vx = 0;
        this.vy = 0;
        this.gravity = 0.4;
    }

    update() {
        if (this.isPickedUp) return;

        // Horizontale Bewegung
        this.x += this.vx;

        // Vertikale Bewegung
        const previousY = this.y;
        this.vy += this.gravity;
        this.y += this.vy;

        // Kollision mit Plattformen
        for (const platform of this.platforms) {
            const bounds = platform.getBounds();

            const overlapsHorizontally =
                this.x + this.width > bounds.x &&
                this.x < bounds.x + bounds.width;

            const wasAbovePlatform =
                previousY + this.height <= bounds.y + 5;

            const isBelowPlatform =
                this.y + this.height >= bounds.y;

            if (
                overlapsHorizontally &&
                wasAbovePlatform &&
                isBelowPlatform &&
                this.vy >= 0
            ) {
                this.y = bounds.y - this.height;
                this.vy = 0;
                this.vx -= this.vx * 0.1; // Reibung
            }
        }
    }

    draw(ctx) {
        ctx.drawImage(
            this.image,
            this.x - window.scrollX,
            this.y - window.scrollY,
            this.width,
            this.height
        );
    }

    pickUp() {
        this.isPickedUp = true;
        this.isThrown = false;
        this.vx = 0;
        this.vy = 0;
    }

    throw(angle, speed = 16) {
        this.isPickedUp = false;
        this.isThrown = true;

        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
    }

    checkCollision(enemy) {
        return (
            this.x < enemy.x + enemy.width &&
            this.x + this.width > enemy.x &&
            this.y < enemy.y + enemy.height &&
            this.y + this.height > enemy.y
        );
    }
}

export class FurnitureEnemy extends Enemy {
    constructor(x, y, player, platforms, health = 1) {
        super(x, y, player, platforms, null);

        this.health = health;
        this.dead = false;
    }

    takeDamage(damage = 1) {
        this.health -= damage;

        if (this.health <= 0) {
            this.dead = true;
        }
    }
}


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

window.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() !== "e") return;
    if (carriedFurniture !== null) return;

    for (const item of furniture) {
        if (item.isPickedUp) continue;

        const distanceX =
            player.x + player.width / 2 -
            (item.x + item.width / 2);

        const distanceY =
            player.y + player.height / 2 -
            (item.y + item.height / 2);

        const distance = Math.hypot(distanceX, distanceY);

        if (distance < 70) {
            item.pickUp();
            carriedFurniture = item;
            break;
        }
    }
});

window.addEventListener("mousedown", (event) => {
    if (event.button !== 0) return;
    if (carriedFurniture === null) return;

    const targetX = event.clientX + window.scrollX;
    const targetY = event.clientY + window.scrollY;

    const angle = Math.atan2(
        targetY - carriedFurniture.y - carriedFurniture.height / 2,
        targetX - carriedFurniture.x - carriedFurniture.width / 2
    );

    carriedFurniture.throw(angle);
    carriedFurniture = null;
});


const platforms = [];
const spawnPoints = [];
const helperPlatformsArray = [];
const player = new Player(160, 200, keys, platforms);


function getPlatforms() {
    document.querySelectorAll(".info-platform, .helper-platform, .screenshot-gallery").forEach((element) => {
        platforms.push(new Platform(element));
    });
    document.querySelectorAll(".info-platform, .screenshot-gallery").forEach((element) => {
        if (element.classList.contains("info-platform") &&
            element === document.querySelector(".info-platform")) {
            return;
        }
        spawnPoints.push(new Platform(element));
    });
    document.querySelectorAll(".helper-platform").forEach((element) => {
        helperPlatformsArray.push(new Platform(element));
    });
    const shuffled = [...helperPlatformsArray].sort(() => Math.random() - 0.5);
    spawnPoints.push(...shuffled.slice(0, 2));
}

getPlatforms();

const furniture = [
    new Furniture(300, 500, "../Images/HSH_MainMenu.png", platforms),
    new Furniture(500, 500, "../Images/HSH_MainMenu.png", platforms),
    new Furniture(700, 500, "../Images/HSH_MainMenu.png", platforms)
];
let carriedFurniture = null;


// Aktive Projektile
const projectiles = [];








const enemies = [];

// function spawnEnemy() {
//     if (currentEnemies >= maxEnemies) return;

//     // Zufällige Plattform auswählen
//     const platform = platforms[
//         Math.floor(Math.random() * platforms.length)
//     ];

//     // Position und Größe der Plattform ermitteln
//     const bounds = platform.getBounds();

//     // Zufällige horizontale Position auf der Plattform
//     const x = bounds.x + Math.random() * (bounds.width - 30);

//     // Gegner direkt auf die Oberkante setzen
//     const y = bounds.y - 40;

//     const enemy = new FurnitureEnemy(x, y, player, platforms, 3);

//     enemies.push(enemy);
//     currentEnemies++;
// }

// setInterval(() => {
//     spawnEnemy();
// }, 1500);


function spawnEnemy() {
    if (currentEnemies >= maxEnemies) return;

    // Plattformen auswählen, auf denen noch kein Gegner steht
    const availablePlatforms = spawnPoints.filter(platform => {
        return !enemies.some(enemy => {
            return enemy.getStandingPlatform(enemy) === platform;
        });
    });

    // Wenn jede Plattform bereits einen Gegner hat
    if (availablePlatforms.length === 0) return;

    // Zufällige freie Plattform auswählen
    const platform = availablePlatforms[
        Math.floor(Math.random() * availablePlatforms.length)
    ];

    const bounds = platform.getBounds();

    // Zufällige horizontale Position
    const x = bounds.x + Math.random() * (bounds.width - 60);

    // Gegner auf der Plattform platzieren
    const y = bounds.y - 80;

    const enemy = new FurnitureEnemy(x, y, player, spawnPoints, 3);

    enemies.push(enemy);
    currentEnemies++;
    spawnEnemy();
}

spawnEnemy();


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

});

document.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
});

// Maustaste drücken: Abschusspunkt festlegen
document.addEventListener("mousedown", (event) => {
    if (event.button !== 0) return;
    if (isInteractiveElement(event.target)) return;

    // dragging = true;

    startX = event.clientX;
    startY = event.clientY;
});

// Maustaste loslassen: Projektil abschießen
// document.addEventListener("mouseup", (event) => {
//     if (!dragging || event.button !== 0) return;

//     dragging = false;

//     const endX = event.clientX;
//     const endY = event.clientY;

//     const dx = startX - endX;
//     const dy = startY - endY;

//     const distance = Math.hypot(dx, dy);

//     // Kleine Bewegungen gelten als normale Klicks
//     if (distance < MIN_DRAG_DISTANCE) return;

//     // Flugrichtung entgegen der Zugrichtung
//     const directionX = dx / distance;
//     const directionY = dy / distance;

//     // Zugdistanz bestimmt die Geschwindigkeit
//     const speed = Math.min(
//         distance * SPEED_PER_PIXEL,
//         MAX_PROJECTILE_SPEED
//     );

//     // Neues Projektil erzeugen
//     projectiles.push(new Projectile(
//         startX + window.scrollX,
//         startY + window.scrollY,
//         directionX * speed,
//         directionY * speed
//     ));

// });





// Ziehvorgang abbrechen, wenn das Fenster den Fokus verliert
window.addEventListener("blur", () => {
    // dragging = false;
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
    for (const item of furniture) {
        item.update(deltaTime);
        item.draw(ctx);
    }

    for (const item of furniture) {
        if (!item.isThrown) continue;

        for (const enemy of enemies) {
            if (item.checkCollision(enemy)) {
                enemy.takeDamage(1);

                item.isThrown = false;
                item.vx = 0;
                item.vy = 0;
                break;
            }
        }
    }
    for (let i = enemies.length - 1; i >= 0; i--) {
        if (enemies[i].dead) {
            enemies.splice(i, 1);
        }
    }
    player.update(deltaTime);
    player.draw(ctx);

    if (carriedFurniture !== null) {
        carriedFurniture.x =
            player.x + player.width / 2
            - carriedFurniture.width / 2;

        carriedFurniture.y =
            player.y - carriedFurniture.height - 10;

        carriedFurniture.draw(ctx);
    }
    // for (let i = enemies.length - 1; i >= 0; i--) {
    //     const enemy = enemies[i];
    //     enemy.isLit = isEnemyIlluminated(enemy);
    //     enemy.update();
    //     enemy.draw(ctx);
    // }

    for (const enemy of enemies) {

        enemy.update(deltaTime);
        enemy.draw(ctx);
    }


    // handleEnemyCollisions();
    // Nächsten Animationsframe starten
    requestAnimationFrame(animate);
}

// Animation starten
animate();