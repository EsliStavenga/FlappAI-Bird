const Architect = neataptic.architect;
const Neat = neataptic.Neat;
const Methods = neataptic.methods;

const WINDOW_WIDTH = 600,
    WINDOW_HEIGHT = 600;
const FRAME_RATE = 240;

const PIPE_COUNT = 3;
const PIPE_INTERVAL = WINDOW_WIDTH / (PIPE_COUNT - 1); //the distance between two pipes
const PLAYER_AMOUNT = 100;
const MUTATION_RATE = 0.4;
const ELITISM_PERCENT = 0.1;
const INPUT_NODES = 6; //s inputs: x pos, y pos, y vel, closest pipe's distance, height of the half, starting pos bottom half
const OUTPUT_NODES = 1;
const HIDDEN_LAYERS = 20;
const POPULATION_TYPES = ["getPopulation1", "getPopulation2", "getPopulation3", "NONE"];
let displayPlayerVision = false;

const NETWORK = Architect.Random(INPUT_NODES, HIDDEN_LAYERS, OUTPUT_NODES);
const NEAT = new Neat(INPUT_NODES, OUTPUT_NODES, fitnessFunction, {
    mutation: [
        Methods.mutation.ADD_NODE,
        Methods.mutation.SUB_NODE,
        Methods.mutation.ADD_CONN,
        Methods.mutation.SUB_CONN,
        Methods.mutation.MOD_WEIGHT,
        Methods.mutation.MOD_BIAS,
        Methods.mutation.MOD_ACTIVATION,
        Methods.mutation.ADD_GATE,
        Methods.mutation.SUB_GATE,
        Methods.mutation.ADD_SELF_CONN,
        Methods.mutation.SUB_SELF_CONN,
        Methods.mutation.ADD_BACK_CONN,
        Methods.mutation.SUB_BACK_CONN
    ],
    popsize: PLAYER_AMOUNT,
    mutationRate: MUTATION_RATE,
    elitism: Math.round(ELITISM_PERCENT * PLAYER_AMOUNT),
    selection: Methods.selection.FITNESS_PROPORTIONATE,
});

const genData = document.querySelector(".data .gen");
const avgData = document.querySelector(".data .avg");
const bestData = document.querySelector(".data .best");

//very basic way to prevent XSS
let popToLoad = getGettersFromURL()[0];
popToLoad = (popToLoad == undefined ? undefined : POPULATION_TYPES[parseInt(popToLoad.pop)]);

switch (popToLoad) {
    case POPULATION_TYPES[0]:
    case POPULATION_TYPES[1]:
    case POPULATION_TYPES[2]:
        NEAT.import(eval(`${popToLoad}()`));
        break;

    case POPULATION_TYPES[3]:
    case undefined:
    default:
        break;
}

//jsonP
//NEAT.import(getPopulation2());


let players = [];
let pipes = [];
let playerDeathCount = 0;
let lastAlive = null;

startGeneration();

/**
 * create a new P5.js sketch
 */
new p5((sketch) => {

    sketch.setup = () => {
        sketch.createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
        sketch.frameRate(FRAME_RATE);
    }

    sketch.draw = () => {
        sketch.background(0);
        let firstDraw = true;

        players.forEach((player) => {

            if (!player.isDead) { //if the player is dead, don't do anything except drawing

                if (playerDeathCount == PLAYER_AMOUNT - 1) {
                    lastAlive = player;
                }

                //FIXME callback hell
                doPipeStuff(player); //checks whether the player isn't colliding with a pipe
                player.addScore(); //tell the player it's doing something

                //if the player is more than x% confident, jump
                let decision = player.calculateMove();
                if (decision[0] > 0.5) { //now it's variable
                    player.jump();
                }

                //if the player passed the first pipe, recalculate the distance to the second pipe
                if (player.passedFirstPipe) {
                    player.closestPipeDistance = Number.POSITIVE_INFINITY;
                }

                //draw the first player's "sight"
                if (firstDraw && displayPlayerVision) {
                    player.drawSight(sketch);
                }

                firstDraw = false;
            }

            //drawing the player after drawing the sight gives a fun bouncy effect!
            player.update();
            player.draw(sketch);

        });


        //if all player's died, create a new generation
        if (playerDeathCount == PLAYER_AMOUNT) {
            endGeneration();
        }

        //draw every pipe
        for (let i = 0; i < PIPE_COUNT; i++) {
            let pipe = pipes[i];
            pipe.update();

            //if the pipe is offscreen, remove it and add a new pipe to the end of the sequence
            if (pipe.isOffscreen()) {
                pipes.splice(i, 1);
                addPipe(pipes[pipes.length - 1].pos.x + PIPE_INTERVAL);

                i--; //compensate for the index missing, else some pipes won't be drawn for a frame causing a black 1 frame stutter
            } else {
                pipe.draw(sketch);
            }
        }
    }
});

function doPipeStuff(player) {
    //foreach pipe, check if the player is colliding with it else check if the player has passed the first pipe
    pipes.forEach((pipe, i) => {
        if (player.isCollidingWith(pipe.parts[0]) || player.isCollidingWith(pipe.parts[1])) {
            player.died(playerDeathCount == PLAYER_AMOUNT - 1, pipe.parts[0], pipe.parts[1]); //can't break, but it's a short forEach
            playerDeathCount++;
            return;
        } else if (i == 0) {
            player.passedFirstPipe = pipe.hasPassedObject(player); //player passed pipe when the first pipe's x < player's x
        }

        //calculate the distance between the player and the closest upcoming pipe
        let distance = player.verticalDistanceWith(pipe);

        if (distance > 0 && distance < player.closestPipeDistance) {
            player.closestPipeDistance = distance;
            player.closestPipe = pipe;
        }
    });
}


function startGeneration() {
    playerDeathCount = 0;

    for (let i = 0; i < PIPE_COUNT; i++) {
        addPipe(WINDOW_WIDTH + PIPE_INTERVAL * i);
    }

    let pos = new Vector2(75, WINDOW_HEIGHT / 2);
    let vel = new Vector2(0, 0);
    let dim = new Vector2(30, 30);

    for (let genome of NEAT.population) {
        let p = new Player(pos, vel, dim, genome);
        players.push(p);
    }

    //showPlayerBrain();
}

function showPlayerBrain() {
    drawGraph(players[0].brain.graph(250, 250), "#graph");
}

function endGeneration() {
    players = [];
    pipes = [];

    // console.log(`Generation: ${NEAT.generation}  |  average score: ${NEAT.getAverage()}`);
    genData.innerHTML = `Generation: ${NEAT.generation}`;
    avgData.innerHTML = `Average score: ${Math.round(NEAT.getAverage() * 100) / 100}`;
    bestData.innerHTML = `Best player score: ${lastAlive.brain.score}`;

    NEAT.sort();
    let newPop = [];

    for (var i = 0; i < NEAT.elitism; i++) {
        newPop.push(NEAT.population[i]);
    }

    let sum = NEAT.popsize - NEAT.elitism;
    for (var i = 0; i < sum; i++) {
        newPop.push(NEAT.getOffspring());
    }

    NEAT.population = newPop;
    NEAT.mutate();

    NEAT.generation++;

    startGeneration();
}

/**
 * Spawn a new pipe
 * 
 * @param {Integer} xPos The x position to spawn the pipe at 
 */
function addPipe(xPos = 0) {
    let pos = new Vector2(xPos, 0);
    let vel = new Vector2(-1.5, 0);

    pipes.push(new PipePair(pos, vel));
}

function loadGeneration(_this) {
    location.href = `${location.href}?pop=${_this.value}`;
}

/**
 * @returns {Object[]} An array of objects in the format { getKey: getValue}
 */
function getGettersFromURL() {
    let array = location.href.split("?"); array.shift();
    let final = [];

    array.forEach(item => {
        let i = item.split("=");
        let obj = {}; obj[i[0]] = i[1];
        final.push(obj);
    });

    return final;
}

/**
 * @returns {JSON} A JSON string of the current population
 */
function exportGeneration() {
    return JSON.stringify(NEAT.export());
}

function copyToClipboard(text) {
    //Add the text to the DOM (usually achieved with a hidden input field)
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.value = text;

    //Select the text
    input.focus();
    input.select();

    //Copy text to clipboard
    document.execCommand('copy');
    input.remove();
}

function toggleDebug() {
    displayPlayerVision = !displayPlayerVision;
}

function fitnessFunction(genome) {
    return genome.score;
}