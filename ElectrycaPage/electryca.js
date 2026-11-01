import { Player } from "../CommonClasses/player.js";
import { Platform } from "../CommonClasses/platform.js";
import { Enemy } from "../CommonClasses/enemy.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Einstellungen

let flashlightOn = false;
let lightsOn = false;
flashlightOn = true;
let mouseX = 0;
let mouseY = 0;

const flashlightRange = 350;
const flashlightAngle = Math.PI / 5; // 36 Grad
const maxEnemies = 6;
let currentEnemies = 0;

let points = 0;

// Mausbewegung
let dragging = false;
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

class FlickeringLight {
    constructor(x, y, range) {
        this.x = x;
        this.y = y;
        this.range = range;

        this.isOn = true;
        this.timer = 0;
        this.nextFlicker = 10;
    }

    update(deltaTime) {
        if (!Number.isFinite(deltaTime)) return;
        this.timer += deltaTime;

        if (this.timer >= this.nextFlicker) {
            this.isOn = !this.isOn;
            this.timer = 0;

            if (this.isOn) {
                // kurz an
                this.nextFlicker = 70 + Math.random() * 300;
            } else {
                // länger aus
                this.nextFlicker = 150 + Math.random() * 600;
            }
        }
    }

    draw(ctx) {
        if (!this.isOn) return;
        ctx.save();

        ctx.fillStyle = "rgba(255, 245, 180, 0.25)";
        ctx.beginPath();
        ctx.moveTo(this.x - window.scrollX, this.y - window.scrollY);

        ctx.arc(
            this.x - window.scrollX,
            this.y - window.scrollY,
            this.range,
            Math.PI / 2 - Math.PI / 3 / 2,
            Math.PI / 2 + Math.PI / 3 / 2
        );

        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }
}

const tutorialLight = new FlickeringLight(1540, 1070, 300);
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

const codeInput = document.getElementById("codeInput");

codeInput.addEventListener("input", () => {
    if (codeInput.value === "4827") {
        console.log("Richtiger Code!");
        document.body.classList.add("lights-on");
        lightsOn = true;
    }
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

class Animation {
    constructor(imagePaths, frameDuration) {
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

        while (this.frameTimer >= this.frameDuration) {
            this.currentFrame =
                (this.currentFrame + 1) % this.frames.length;

            this.frameTimer -= this.frameDuration;
        }
    }

    draw(ctx, x, y, width, height, direction = 1) {
        if (!this.loaded) return;

        const image = this.frames[this.currentFrame];

        ctx.save();

        if (direction === -1) {
            ctx.translate(x + width, y);
            ctx.scale(-1, 1);
            ctx.drawImage(image, 0, 0, width, height);
        } else {
            ctx.drawImage(image, x, y, width, height);
        }

        ctx.restore();
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




function createQuinnAnimation() {
    return new Animation(quinnWalkPaths, 30);
}



const enemies = [];

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

    const enemy = new Enemy(
        x,
        y,
        player,
        spawnPoints,
        createQuinnAnimation()
    );

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


function updateHiddenCode() {
    const code = document.querySelector(".hidden-code");

    if (!code) return;

    const rect = code.getBoundingClientRect();

    const codeX = rect.left + rect.width / 2 + window.scrollX;
    const codeY = rect.top + rect.height / 2 + window.scrollY;

    const playerX = player.x + player.width / 2;
    const playerY = player.y + player.height / 2;

    code.style.setProperty(
        "--light-x",
        `${playerX - codeX}px`
    );

    code.style.setProperty(
        "--light-y",
        `${playerY - codeY}px`
    );

    const dx = codeX - playerX;
    const dy = codeY - playerY;

    const distance = Math.hypot(dx, dy);

    const mouseWorldX = mouseX + window.scrollX;
    const mouseWorldY = mouseY + window.scrollY;

    const flashlightDirection = Math.atan2(
        mouseWorldY - playerY,
        mouseWorldX - playerX
    );

    const codeDirection = Math.atan2(dy, dx);

    let angleDifference = codeDirection - flashlightDirection;

    angleDifference = Math.atan2(
        Math.sin(angleDifference),
        Math.cos(angleDifference)
    );

    const illuminated =
        flashlightOn &&
        distance <= flashlightRange &&
        Math.abs(angleDifference) <= flashlightAngle / 2;

    code.style.opacity = illuminated ? "1" : "0";
}

// function drawHiddenCode(ctx, codeX, codeY, codeText, fontSize = 24) {

//     if (lightsOn) {
//         ctx.fillStyle = "#fff5b4";
//         ctx.font = `bold ${fontSize}px Arial`;
//         ctx.fillText(
//             codeText,
//             codeX - window.scrollX,
//             codeY - window.scrollY
//         );
//         return;
//     }
//     if (!flashlightOn) return;
//     const playerX =
//         player.x + player.width / 2 - window.scrollX;

//     const playerY =
//         player.y + player.height / 2 - window.scrollY;

//     const angle = Math.atan2(
//         mouseY - playerY,
//         mouseX - playerX
//     );

//     ctx.save();

//     // Lichtkegel als Zeichenbereich festlegen
//     ctx.beginPath();
//     ctx.moveTo(playerX, playerY);
//     ctx.arc(
//         playerX,
//         playerY,
//         flashlightRange,
//         angle - flashlightAngle / 2,
//         angle + flashlightAngle / 2
//     );
//     ctx.closePath();
//     ctx.clip();

//     // Nur der Teil des Codes im Lichtkegel wird gezeichnet
//     ctx.fillStyle = "#fff5b4";
//     ctx.font = `bold ${fontSize}px Arial`;
//     ctx.fillText(
//         codeText,
//         codeX - window.scrollX,
//         codeY - window.scrollY
//     );

//     ctx.restore();
// }
function drawHiddenCode(ctx, codeX, codeY, codeText, fontSize = 24) {

    if (lightsOn) {
        ctx.fillStyle = "#fff5b4";
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.fillText(codeText, codeX - window.scrollX, codeY - window.scrollY);
        return;
    }

    const playerX = player.x + player.width / 2 - window.scrollX;
    const playerY = player.y + player.height / 2 - window.scrollY;

    ctx.save();

    ctx.beginPath();

    // Taschenlampenbereich
    if (flashlightOn) {
        const angle = Math.atan2(
            mouseY - playerY,
            mouseX - playerX
        );

        ctx.moveTo(playerX, playerY);
        ctx.arc(
            playerX,
            playerY,
            flashlightRange,
            angle - flashlightAngle / 2,
            angle + flashlightAngle / 2
        );
    }

    // Stationärer Lichtbereich
    if (tutorialLight.isOn) {
        ctx.moveTo(
            tutorialLight.x - window.scrollX,
            tutorialLight.y - window.scrollY
        );

        ctx.arc(
            tutorialLight.x - window.scrollX,
            tutorialLight.y - window.scrollY,
            tutorialLight.range,
            Math.PI / 2 - Math.PI / 3 / 2,
            Math.PI / 2 + Math.PI / 3 / 2
        );
    }
    ctx.clip();

    ctx.fillStyle = "#fff5b4";
    ctx.font = `bold ${fontSize}px Arial`;

    ctx.fillText(
        codeText,
        codeX - window.scrollX,
        codeY - window.scrollY
    );

    ctx.restore();

}

function isEnemyIlluminated(enemy) {
    const enemyX = enemy.x + enemy.width / 2;
    const enemyY = enemy.y + enemy.height / 2;

    // Stationäres Licht überprüfen
    if (tutorialLight.isOn) {
        const dx = enemyX - tutorialLight.x;
        const dy = enemyY - tutorialLight.y;

        const distance = Math.hypot(dx, dy);

        const enemyDirection = Math.atan2(dy, dx);
        const angleDifference = Math.atan2(

            Math.sin(enemyDirection - Math.PI / 2),
            Math.cos(enemyDirection - Math.PI / 2)


        );

        if (distance <= tutorialLight.range &&
            Math.abs(angleDifference) <= Math.PI / 3 / 2
        ) {
            return true;
        }
    }

    // Taschenlampe überprüfen
    if (flashlightOn) {
        const playerX = player.x + player.width / 2;
        const playerY = player.y + player.height / 2;

        const dx = enemyX - playerX;
        const dy = enemyY - playerY;

        const distance = Math.hypot(dx, dy);

        if (distance > flashlightRange) return false;

        const mouseWorldX = mouseX + window.scrollX;
        const mouseWorldY = mouseY + window.scrollY;

        const flashlightDirection = Math.atan2(
            mouseWorldY - playerY,
            mouseWorldX - playerX
        );

        const enemyDirection = Math.atan2(dy, dx);

        let angleDifference = enemyDirection - flashlightDirection;

        angleDifference = Math.atan2(
            Math.sin(angleDifference),
            Math.cos(angleDifference)
        );

        return Math.abs(angleDifference) <= flashlightAngle / 2;
    }

    return false;
}

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
    tutorialLight.update(deltaTime);
    tutorialLight.draw(ctx);

    for (const enemy of enemies) {

        if (lightsOn) {
            enemy.isLit = true;
            enemy.draw(ctx);
            // enemy.update();
            continue;
        }

        enemy.isLit = isEnemyIlluminated(enemy);
        enemy.update(deltaTime);
        // enemy.draw(ctx);
        if (enemy.animation && enemy.isMoving) {
            enemy.animation.update(deltaTime);
        }

        if (flashlightOn) {
            ctx.save();

            const playerX =
                player.x + player.width / 2 - window.scrollX;
            const playerY =
                player.y + player.height / 2 - window.scrollY;

            const angle = Math.atan2(
                mouseY - playerY,
                mouseX - playerX
            );

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
            ctx.clip();

            enemy.draw(ctx);

            ctx.restore();
        }
        if (tutorialLight.isOn) {
            const lightX = tutorialLight.x - window.scrollX;
            const lightY = tutorialLight.y - window.scrollY;

            ctx.save();

            ctx.beginPath();
            ctx.moveTo(lightX, lightY);

            ctx.arc(
                lightX,
                lightY,
                tutorialLight.range,
                Math.PI / 2 - Math.PI / 3 / 2,
                Math.PI / 2 + Math.PI / 3 / 2
            );

            ctx.closePath();
            ctx.clip();

            enemy.draw(ctx);

            ctx.restore();
        }
    }

    drawFlashlight(ctx);
    // updateHiddenCode();
    const codePosition = document
        .getElementById("hiddenCodePosition")
        .getBoundingClientRect();

    drawHiddenCode(
        ctx,
        codePosition.left + window.scrollX,
        codePosition.top + window.scrollY,
        "4827"
    );

    const ArrowPosition = document
        .getElementById("hiddenArrowPosition")
        .getBoundingClientRect();

    drawHiddenCode(
        ctx,
        ArrowPosition.left + window.scrollX,
        ArrowPosition.top + window.scrollY,
        "\u279C",
        60
    );

    const TextPosition = document
        .getElementById("hiddenTextPosition")
        .getBoundingClientRect();

    drawHiddenCode(
        ctx,
        TextPosition.left + window.scrollX,
        TextPosition.top + window.scrollY,
        "Find the code in the dark"
    );

    const TextPosition2 = document
        .getElementById("hiddenTextPosition2")
        .getBoundingClientRect();

    drawHiddenCode(
        ctx,
        TextPosition2.left + window.scrollX,
        TextPosition2.top + window.scrollY,
        "Toggle flashlight with left mouse click"
    );
    // handleEnemyCollisions();
    // Nächsten Animationsframe starten
    requestAnimationFrame(animate);
}

// Animation starten
animate();