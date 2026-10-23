export class Platform {
    constructor(element) {
        this.element = element;
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
}