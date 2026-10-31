export class Enemy {
    constructor(x, y, player, platforms, animation = null) {
        this.x = x;
        this.y = y;

        this.player = player;
        this.platforms = platforms;

        this.width = 60;
        this.height = 80;
        this.speed = 2;

        this.currentPlatform = null;
        this.isLit = false;
        this.animation = animation;
        this.direction = 1;
        this.isMoving = false;
    }

    // update() {
    //     if (this.isLit) return;
    //     // Plattform unter dem Gegner finden
    //     this.currentPlatform = this.getStandingPlatform(this);

    //     if (!this.currentPlatform) return;

    //     // Prüfen, ob der Spieler auf derselben Plattform steht
    //     const playerPlatform = this.getStandingPlatform(this.player);



    //     // if (playerPlatform !== this.currentPlatform) return;
    //     // (this.player.x > this.currentPlatform.getBounds().x && this.player.x < this.currentPlatform.getBounds().x + this.currentPlatform.getBounds().width)

    //     if (this.player.x + this.player.width > this.currentPlatform.getBounds().x && this.player.x < this.currentPlatform.getBounds().x + this.currentPlatform.getBounds().width) {

    //         if (playerPlatform !== this.currentPlatform) return;
    //         // Auf den Spieler zulaufen
    //         if (this.player.x < this.x) {
    //             this.x -= this.speed;
    //         } else if (this.player.x > this.x) {
    //             this.x += this.speed;
    //         }

    //     }

    // }
    update() {
        this.isMoving = false;

        if (this.isLit) return;

        this.currentPlatform = this.getStandingPlatform(this);

        if (!this.currentPlatform) return;

        const playerPlatform = this.getStandingPlatform(this.player);

        if (this.player.x + this.player.width > this.currentPlatform.getBounds().x && this.player.x < this.currentPlatform.getBounds().x + this.currentPlatform.getBounds().width)
            {
            if (playerPlatform !== this.currentPlatform) return;

            if (this.player.x < this.x) {
                this.x -= this.speed;
                this.direction = -1;
                this.isMoving = true;
            }
            else if (this.player.x > this.x) {
                this.x += this.speed;
                this.direction = 1;
                this.isMoving = true;
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
        if (this.animation) {
            const scale = 1.7;

            const drawWidth = this.width * scale;
            const drawHeight = this.height * scale;

            const drawX = this.x - window.scrollX - (drawWidth - this.width) / 2;

            const drawY = this.y - window.scrollY + this.height - drawHeight;


            // Vorläufige Darstellung zum Testen
            // ctx.fillStyle = "lime";
            // ctx.fillRect(
            //     this.x - window.scrollX,
            //     this.y - window.scrollY,
            //     this.width,
            //     this.height
            // );
            this.animation.draw(
                ctx,
                drawX,
                drawY + 27,
                drawWidth,
                drawHeight,
                this.direction
            );
        }
        else {
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
}