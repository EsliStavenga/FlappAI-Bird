//TODO pipe => pipepair
//TODO pipepart => pipe
class PipePair {

    constructor(pos, vel) {
        this.pos = pos;
        this.vel = vel;
        this.passed = false;

        //by splitting the pipe into two parts, the constructor will be slightly bigger
        //however it will be easier to draw, update, and detect hitboxes
        this.parts = [];
        this.width = MathExtensions.randomInt(75, 100);
        this.topHeight = MathExtensions.randomInt(50, WINDOW_HEIGHT / 2 + WINDOW_HEIGHT / 4);
        this.gapSize = MathExtensions.randomInt(100, 150);
        let color = "green";

        this.parts.push(new Pipe(pos, vel, new Vector2(this.width, this.topHeight), color)); //TODO use GameObject instead? Will save a class, this might look more logical

        let pos2 = new Vector2(pos.x, this.topHeight + this.gapSize);
        this.parts.push(new Pipe(pos2, vel, new Vector2(this.width, WINDOW_HEIGHT - pos2.y), color));
    }

    /**
     * Detect whether an object is offscreen
     * 
     * @returns {Boolean} Whether the pipepair is offscreen
     */
    isOffscreen() {
        return this.pos.x <= -this.width;
    }

    /**
     * Check whether the object has passed another object, like a pipe passing the player
     * 
     * @param {GameObject} obj The object to check for
     * 
     * @returns {Boolean} Whether the pipe has passed the object
     */
    hasPassedObject(obj) {
        return this.pos.x + this.width <= obj.pos.x - obj.dimensions.y;
    }

    /**
     * Update all the pipes
     */
    update() {
        this.parts.forEach((part) => {
            part.update();
        })
    }

    /**
     * Draw all the pipes
     * 
     * @param {Object} sketch A reference to the current sketch
     */
    draw(sketch) {
        this.parts.forEach((part) => {
            part.draw(sketch);
        })
    }

}