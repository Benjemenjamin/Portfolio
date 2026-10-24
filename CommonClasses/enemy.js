export class Enemy {
    constructor(x, y, player, platforms) {
        this.x = x;
        this.y = y;

        this.player = player;
        this.platforms = platforms;

        this.width = 30;
        this.height = 40;
        this.speed = 1.5;

        this.currentPlatform = null;
        this.isLit = false;
    }

    update() {
        if (this.isLit) return;
        // Plattform unter dem Gegner finden
        this.currentPlatform = this.getStandingPlatform(this);

        if (!this.currentPlatform) return;

        // Prüfen, ob der Spieler auf derselben Plattform steht
        const playerPlatform = this.getStandingPlatform(this.player);
        console.log(playerPlatform);


        // if (playerPlatform !== this.currentPlatform) return;
        // (this.player.x > this.currentPlatform.getBounds().x && this.player.x < this.currentPlatform.getBounds().x + this.currentPlatform.getBounds().width)

        if (this.player.x + this.player.width > this.currentPlatform.getBounds().x && this.player.x < this.currentPlatform.getBounds().x + this.currentPlatform.getBounds().width) {

            if (playerPlatform !== this.currentPlatform) return;
            // Auf den Spieler zulaufen
            if (this.player.x < this.x) {
                this.x -= this.speed;
            } else if (this.player.x > this.x) {
                this.x += this.speed;
            }
        }

    }

    getStandingPlatform(entity) {
        for (const platform of this.platforms) {
            const bounds = platform.getBounds();

            const overlapsHorizontally =
                entity.x + entity.width > bounds.x &&
                entity.x < bounds.x + bounds.width;

            const feet = entity.y + entity.height;

            const standsOnTop =
                Math.abs(feet - bounds.y) <= 5;

            if (overlapsHorizontally && standsOnTop) {
                entity.lastPlatform = platform;
                return platform;
            }
        }

        return entity.lastPlatform;
    }

    draw(ctx) {
        // Vorläufige Darstellung zum Testen
        ctx.fillStyle = "lime";
        ctx.fillRect(
            this.x - window.scrollX,
            this.y - window.scrollY,
            this.width,
            this.height
        );
    }
}