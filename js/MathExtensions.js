class MathExtensions {

    /**
     * Clamp a value between the min and max
     * 
     * @param {Float} val The value to clamp
     * @param {Float} min The minimum value
     * @param {Float} max The maximum value
     * 
     * @returns The value, or either bound
     */
    static clamp(val, min, max) {
        return Math.min(Math.max(val, min), max);
    }

    /**
     * Generate a random float between the min and max
     * 
     * @param {Float} min The minimum value
     * @param {Float} max The maximum value
     * 
     * @returns A random float value between min and max
     */
    static randomFloat(min, max) {
        return Math.max(min, Math.random() * max)
    }

    /**
     * Generate a random integer between the min and max
     * 
     * @param {Float} min The minimum value
     * @param {Float} max The maximum value
     * 
     * @returns A random integer value between min and max
     */
    static randomInt(min, max) {
        return Math.round(MathExtensions.randomFloat(min, max));
    }

}