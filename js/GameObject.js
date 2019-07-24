class GameObject {

    /**
     * @returns {Float} The top of the object
     */
    get top() {
        return this.pos.y;
    }

    /**
     * @returns {Float} The bottom of the object
     */
    get bottom() {
        return this.pos.y + this.dimensions.y;
    }

    /**
     * @returns {Float} The left of the object
     */
    get left() {
        return this.pos.x;
    }

    /**
     * @returns {Float} The right of the object
     */
    get right() {
        return this.pos.x + this.dimensions.x;
    }

    constructor(pos, vel, dimensions, color) {
        this.pos = pos;
        this.vel = vel;
        this.dimensions = dimensions;
        this.color = color;
    }

    /**
     * Update the object's position
     */
    update() {
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;
    }

    /**
     * Draw the current object
     * 
     * @param {Object} sketch A reference to the current sketch
     */
    draw(sketch) {
        sketch.fill(this.color);
        sketch.rect(this.pos.x, this.pos.y, this.dimensions.x, this.dimensions.y);
    }

}