export class Platform {
    constructor(element) {
        this.element = element;
        this.previousY = this.getBounds().y;
        this.velocityY = 0;
    }

    getBounds() {
        const rect = this.element.getBoundingClientRect();

        return {
            x: rect.left + window.scrollX,
            y: rect.top + window.scrollY,
            width: rect.width,
            height: rect.height
        };
    }

    getMovement(deltaTime) {
        const currentY = this.getBounds().y;
        const movement = currentY - this.previousY;

        this.velocityY = (currentY - this.previousY) / (deltaTime/5);

        this.previousY = currentY;

        return movement;
    }
}