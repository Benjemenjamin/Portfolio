export class Enemy {
    constructor(x, y, player, platforms, animation = null, offset = 27) {
        this.x = x;
        this.y = y;

        this.player = player;
        this.platforms = platforms;
        this.offset = offset;

        this.width = 60;
        this.height = 80;
        this.speed = 2;
        this.damageCooldown = 0;

        this.contactTimer = 0;
        this.contactDamageDelay = 150; // 0,5 Sekunden

        this.currentPlatform = null;
        this.isLit = false;
        this.animation = animation;
        this.direction = 1;
        this.isMoving = false;
    }

    update(deltaTime) {
        if (!deltaTime) return;
        this.damageCooldown = Math.max(0, this.damageCooldown - deltaTime);
        this.checkPlayerCollision(deltaTime);
        this.isMoving = false;

        if (this.isLit) return;

        this.currentPlatform = this.getStandingPlatform(this);

        if (!this.currentPlatform) return;

        const playerPlatform = this.getStandingPlatform(this.player);

        if (this.player.x + this.player.width > this.currentPlatform.getBounds().x &&
            this.player.x < this.currentPlatform.getBounds().x + this.currentPlatform.getBounds().width) {

            if (playerPlatform !== this.currentPlatform) return;

            const movement = this.speed * (deltaTime / 16.67);

            if (this.player.x < this.x) {
                this.x -= movement;
                this.direction = -1;
                this.isMoving = true;
            }
            else if (this.player.x > this.x) {
                this.x += movement;
                this.direction = 1;
                this.isMoving = true;
            }
        }
    }

    checkPlayerCollision(deltaTime) {
        const collision =
            this.x < this.player.x + this.player.width &&
            this.x + this.width > this.player.x &&
            this.y < this.player.y + this.player.height &&
            this.y + this.height > this.player.y;

        if (collision && !this.isLit) {
            this.contactTimer += deltaTime;

            if (this.contactTimer >= this.contactDamageDelay) {
                this.player.TakeDamage(1);
                this.contactTimer = 0;
            }
        }
        else {
            this.contactTimer = 0;
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
        // if (!this.isLit) return;
        if (this.animation) {
            const scale = 1.7;

            const drawWidth = this.width * scale;
            const drawHeight = this.height * scale;

            const drawX = this.x - window.scrollX - (drawWidth - this.width) / 2;

            const drawY = this.y - window.scrollY + this.height - drawHeight;


            this.animation.draw(
                ctx,
                drawX,
                drawY + this.offset,
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