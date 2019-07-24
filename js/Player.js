class Player {

    /**
     * @returns {Float} The top of the player
     */
    get top() {
        return this.pos.y - this.dimensions.y / 2;
    }

    /**
     * @returns {Float} The bottom of the player
     */
    get bottom() {
        return this.pos.y + this.dimensions.y / 2;
    }

    /**
     * @returns {Float} The left of the player
     */
    get left() {
        return this.pos.x - this.dimensions.x / 2;
    }

    /**
     * @returns {Float} The right of the player
     */
    get right() {
        return this.pos.x + this.dimensions.x / 2;
    }

    constructor(pos, vel, dimensions, brain) {
        //without the object.assign part, you'll get pass-by-reference conflicts like all the players jumping when one jumps
        this.pos = Object.assign({}, pos);
        this.vel = Object.assign({}, vel);
        this.dimensions = Object.assign({}, dimensions);
        this.brain = brain;
        this.brain.score = 0;

        this.gravity = 0.3; //The higher the gravity, the quicker the player will fall down
        this.color = "red";
        this.MIN_SPEED = -15;
        this.MAX_SPEED = 15;
        this.jumpForce = 10;

        this.isDead = false; //at least I hope so
        this.closestPipeDistance = Number.POSITIVE_INFINITY;
        this.closestPipe = null;
    }

    /**
     * Update the player's position, also clamp him to the roof/floor so he won't go out of bounds
     */
    update() {
        let halfWidth = this.dimensions.x / 2;

        //Update the player's velocity
        this.vel.y += this.gravity;
        this.vel.y = MathExtensions.clamp(this.vel.y, this.MIN_SPEED, this.MAX_SPEED);

        //Update the position based on the velocity
        this.pos.y += this.vel.y;
        //could also write min clamp as 0 + halfWidth but this seemed more logical even tho slightly harder to read
        this.pos.y = MathExtensions.clamp(this.pos.y, halfWidth, WINDOW_HEIGHT - halfWidth);
        this.pos.x += this.vel.x; //this shouldn't change... hopefuly...
    }

    /**
     * Let the neural network decide whether it should fly or fall
     * 
     * @returns {Float[]} An array containing 1 value, his confidince in him having to fly
     */
    calculateMove() {
        let input = [];
        input.push(this.pos.x / WINDOW_WIDTH);
        input.push(this.pos.y / WINDOW_HEIGHT);

        //normalize the vel.y
        //e.g. this will result in 0 + 15 / 15 * 2 = 15 / 30 = 0.5
        //-15 + 15 / 15 * 2 = 0 / 30 = 0
        //15 + 15 / 15 * 2 = 30 / 30 = 1
        //1 = full speed up, 0.5 = 0 speed, 0 = full speed down
        input.push((this.vel.y + this.MAX_SPEED) / (this.MAX_SPEED * 2));
        input.push((this.closestPipeDistance + this.closestPipe.width) / (WINDOW_WIDTH)); //add the width to calculate from the back

        input.push(this.closestPipe.topHeight / WINDOW_HEIGHT);
        input.push((this.closestPipe.topHeight + this.closestPipe.gapSize) / WINDOW_HEIGHT);

        return this.brain.activate(input);
    }

    /**
     * Tell the neural network it's doing something
     */
    addScore() {
        //who's a good boy... girl... you can't really know in this day and age anymore
        this.brain.score++;
    }

    /**
     * Calculate the distance between the player and an object
     * 
     * @param {GameObject} obj The object to calculate the distance for 
     * 
     * @returns {Float} The distance between the two objects
     */
    verticalDistanceWith(obj) {
        return obj.pos.x - this.pos.x;
    }

    /**
     * Check if the player is colliding with an object
     * 
     * @param {GameObject} obj The object to check
     * 
     * @returns {Boolean} Whether the two objects are colliding or not
     */
    isCollidingWith(obj) {
        return (obj.bottom >= this.top &&
            obj.top <= this.bottom &&
            obj.left <= this.right &&
            obj.right >= this.left);
    }

    /**
     * Oh no the bird passed away... Better notify the user with some visual feedback
     */
    died() {
        this.isDead = true;
        this.color = "grey"; //should this be done here? Idk
        this.vel.x = -1.5;
    }

    /**
     * Let the bird fly!
     */
    jump() {
        //could also do if(!this.isDead) { //yeet up } but I prefer it first doing all the checks and then executing the code
        if (this.isDead) {
            return;
        }

        this.vel.y += -this.jumpForce;
    }

    /**
     * Draw the player to the screen
     * 
     * @param {Object} sketch A reference to the current sketch 
     */
    draw(sketch) {
        sketch.fill(this.color);
        sketch.ellipse(this.pos.x, this.pos.y, this.dimensions.x);
    }

    /**
     * Draw what neural network "sees", tho this is only part of it
     * 
     * @param {Object} sketch A reference to the current sketch
     */
    drawSight(sketch) {
        sketch.stroke("blue"); //set the line's color to blue
        sketch.line(this.pos.x, this.pos.y, this.closestPipe.pos.x, this.closestPipe.topHeight);
        sketch.line(this.pos.x, this.pos.y, this.closestPipe.pos.x, this.closestPipe.topHeight + this.closestPipe.gapSize);

        sketch.stroke("black"); //reset the color since it also effects object outlines
    }

}