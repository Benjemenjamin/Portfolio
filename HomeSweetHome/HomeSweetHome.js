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
const player = new Player(160, 200, keys, platforms);


function getPlatforms() {
    document.querySelectorAll(".info-platform, .helper-platform, .screenshot-gallery").forEach((element) => {
        platforms.push(new Platform(element));
    });
    platforms.forEach((platform) => {
        console.log(platform.getBounds());
    });
}

getPlatforms();




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


    // for (let i = enemies.length - 1; i >= 0; i--) {
    //     const enemy = enemies[i];
    //     enemy.isLit = isEnemyIlluminated(enemy);
    //     enemy.update();
    //     enemy.draw(ctx);
    // }

    for (const enemy of enemies) {

        enemy.update();
        enemy.draw(ctx);
    }

    
    // handleEnemyCollisions();
    // Nächsten Animationsframe starten
    requestAnimationFrame(animate);
}

// Animation starten
animate();