export class Player {
    constructor(x, y, keys, platforms) {
        this.x = x;
        this.y = y;
        this.keys = keys;
        this.platforms = platforms;
        this.width = 30;
        this.height = 40;

        this.vx = 0;
        this.vy = 0;

        this.speed = 4;
        this.jumpForce = -12;
        this.gravity = 0.5;

        this.onGround = false;
    }

    update() {
        // Horizontale Bewegung
        if (this.keys["a"] || this.keys["arrowleft"]) {
            this.x -= this.speed;
        }

        if (this.keys["d"] || this.keys["arrowright"]) {
            this.x += this.speed;
        }


        // Alte Position merken
        const previousY = this.y;

        // Schwerkraft und vertikale Bewegung
        this.vy += this.gravity;
        this.y += this.vy;

        // Zunächst annehmen, dass der Spieler in der Luft ist
        this.onGround = false;

        // Plattformkollisionen überprüfen
        // Plattformkollisionen überprüfen
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
            }
        }

        // Vorläufiger Boden am unteren Dokumentrand
        const ground = document.documentElement.scrollHeight;

        if (this.y + this.height >= ground) {
            this.y = ground - this.height;
            this.vy = 0;
            this.onGround = true;
        }
    }

    draw(ctx) {
        const screenX = this.x - window.scrollX;
        const screenY = this.y - window.scrollY;

        ctx.fillStyle = "red";
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
        }
    }
}