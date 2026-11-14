export class Player {
    constructor(x, y, keys, platforms) {
        this.x = x;
        this.y = y;
        this.keys = keys;
        this.platforms = platforms;
        this.width = 30;
        this.height = 40;
        this.lastPlatform = null;
        this.activePlatform = null;
        this.health = 10;
        this.vx = 0;
        this.vy = 0;

        this.speed = 4;
        this.jumpForce = -12;
        this.gravity = 0.5;

        this.onGround = false;

        this.visible = true;
        this.invulnerable = false;
        this.invulnerabilityTime = 2000;
        this.invulnerabilityTimer = 0;

        this.blinkInterval = 150;
        this.blinkTimer = 0;
        this.friction = 0.98;
    }

    update(deltaTime) {
        if (!Number.isFinite(deltaTime)) return;
        const timeScale = deltaTime / 16.67;

        if (this.invulnerable) {
            this.invulnerabilityTimer -= deltaTime;
            this.blinkTimer += deltaTime;

            if (this.blinkTimer >= this.blinkInterval) {
                this.visible = !this.visible;
                this.blinkTimer = 0;
            }

            if (this.invulnerabilityTimer <= 0) {
                this.invulnerable = false;
                this.visible = true;
            }
        }

        if (this.keys["a"] || this.keys["arrowleft"]) {
            this.x -= this.speed * timeScale;
        }

        if (this.keys["d"] || this.keys["arrowright"]) {
            this.x += this.speed * timeScale;
        }

        if (this.onGround) {
            this.friction = 0.7; // Reibung erhöhen, wenn der Spieler auf dem Boden ist
        }
        else {
            this.friction = 0.95; // Reibung wieder auf normalen Wert setzen, wenn der Spieler in der Luft ist
        }

        this.x += this.vx * timeScale;

        this.vx *= this.friction;


        if (Math.abs(this.vx) < 0.1) this.vx = 0;

        // Alte Position merken
        const previousY = this.y;

        // Schwerkraft und vertikale Bewegung

        this.vy += this.gravity * timeScale;
        this.y += this.vy * timeScale;

        // Zunächst annehmen, dass der Spieler in der Luft ist
        this.onGround = false;

        // Plattformkollisionen überprüfen
        // Plattformkollisionen überprüfen
        this.activePlatform = null;
        for (const platform of this.platforms) {
            const bounds = platform.getBounds();

            // Horizontale Überlappung prüfen
            const overlapsHorizontally =
                this.x + this.width > bounds.x &&
                this.x < bounds.x + bounds.width;

            // Vertikale Bewegung nach unten:
            // Auf der Oberkante landen
            const crossesTop =
                previousY + this.height <= bounds.y + 5 &&
                this.y + this.height >= bounds.y;

            if (
                this.vy >= 0 &&
                overlapsHorizontally &&
                crossesTop &&
                !this.keys["sPressed"]
            ) {
                this.y = bounds.y - this.height;
                this.vy = 0;
                this.onGround = true;
                this.activePlatform = platform;
            }

            // Vertikale Bewegung nach oben:
            // Auf der Unterkante landen
            const crossesBottom =

                previousY + this.height <= bounds.y + bounds.height + 5 &&
                this.y + this.height >= bounds.y + bounds.height;


            if (
                this.vy >= 0 &&
                overlapsHorizontally &&
                crossesBottom &&
                !this.keys["sPressed"]
            ) {
                this.y = bounds.y + bounds.height - this.height;
                this.vy = 0;
                this.onGround = true;
                this.activePlatform = platform;
            }
        }

        // Vorläufiger Boden am unteren Dokumentrand
        const ground = document.documentElement.scrollHeight;

        if (this.y + this.height >= ground) {
            this.y = ground - this.height;
            this.vy = 0;
            this.onGround = true;
            this.activePlatform = null;
        }


    }

    draw(ctx) {
        if (!this.visible) return;
        const screenX = this.x - window.scrollX;
        const screenY = this.y - window.scrollY;

        switch (this.health) {
            case 10:
                ctx.fillStyle = "#02fd17";
                break;

            case 9:
                ctx.fillStyle = "#66fd02";
                break;

            case 8:
                ctx.fillStyle = "#88fd02";
                break;

            case 7:
                ctx.fillStyle = "#a5fd02";
                break;

            case 6:
                ctx.fillStyle = "#cffd02";
                break;

            case 5:
                ctx.fillStyle = "#fdf902";
                break;

            case 4:
                ctx.fillStyle = "#fdcf02";
                break;

            case 3:
                ctx.fillStyle = "#fdad02";
                break;

            case 2:
                ctx.fillStyle = "#fd5e02";
                break;

            case 1:
                ctx.fillStyle = "#fd0202";
                break;
        }
        ctx.fillRect(
            screenX,
            screenY,
            this.width,
            this.height
        );
    }

    jump() {
        if (this.onGround) {
            this.vy = this.jumpForce;
            this.onGround = false;
            this.friction = 0.98; // Reibung wieder auf normalen Wert setzen, wenn der Spieler springt
        }
    }

    TakeDamage(amount, hitDirection) {
        if (this.invulnerable || this.health <= 0) return;

        this.health = Math.max(0, this.health - amount);

        this.invulnerable = true;
        this.invulnerabilityTimer = this.invulnerabilityTime;

        this.visible = false;
        this.blinkTimer = 0;

        const knockbackForce = 10;

        switch (hitDirection) {
            case "right":
                this.vx = -knockbackForce;
                this.vy = -knockbackForce / 2;
                break;
            case "left":
                this.vx = knockbackForce;
                this.vy = -knockbackForce / 2;
                break;
            case "top":
                this.vy = -knockbackForce;
                break;
            case "bottom":
                this.vy = knockbackForce;
                break;
        }
        this.onGround = false;
        if (this.health === 0) {
            console.log("dead");
            this.x = 160;
            this.y = 200;
            this.health = 10;
            this.invulnerable = false;
            this.visible = true;
        }
    }
}