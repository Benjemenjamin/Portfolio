export class Animation {
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