import { createProgram, createPerspectiveMatrix } from './utils.js';
import { createPyramidModel, createGroundModel } from './models.js';
import { vertexShaderSource, fragmentShaderSource } from './shaders.js';
import { Camera } from './camera.js';
import { Player } from './player.js';
import { mat4 } from 'gl-matrix';

export function startGame(gl) {
    // Initialize shaders
    const shaderProgram = createProgram(gl, vertexShaderSource, fragmentShaderSource);

    // Create the player model (a pyramid)
    const playerModel = createPyramidModel(gl);
    const groundModel = createGroundModel(gl);
    const player = new Player([0, 0, 0]); // Initialize the player at the origin

    // Initialize the camera
    const camera = new Camera([0, 2, 10]);

    // Create a projection matrix
    const projectionMatrix = createPerspectiveMatrix(
        Math.PI / 4,
        gl.canvas.clientWidth / gl.canvas.clientHeight,
        0.1,
        100.0
    );
    camera.setProjectionMatrix(projectionMatrix);


    // Set up keyboard input tracking
    let keys = {};
    window.addEventListener("keydown", function (event) {
        keys[event.key] = true;
    });
    window.addEventListener("keyup", function (event) {
        keys[event.key] = false;
    });

    // Handle player input and movement
    function handleInput() {
        if (keys["ArrowUp"]) player.move("forward");
        if (keys["ArrowDown"]) player.move("backward");
        if (keys["ArrowLeft"]) player.move("left");
        if (keys["ArrowRight"]) player.move("right");
    }

    // Main render loop
    function drawScene() {
        // Clear the screen
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Use the shader program
        gl.useProgram(shaderProgram);

        // Handle input and update player position
        handleInput();
        const playerPosition = player.getPosition();
        camera.followPlayer(playerPosition);

        // Draw the ground
        const groundModelViewMatrix = mat4.create();
        groundModelViewMatrix[13] = -1.0; // Position the ground at the base level
        groundModel.draw(gl, shaderProgram, groundModelViewMatrix, projectionMatrix);

        // Draw the player model
        const modelViewMatrix = mat4.create();
        mat4.translate(modelViewMatrix, modelViewMatrix, playerPosition);
        playerModel.draw(gl, shaderProgram, modelViewMatrix, projectionMatrix);

        // Set view and projection matrices
        gl.uniformMatrix4fv(
            gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
            false,
            camera.getViewMatrix()
        );
        gl.uniformMatrix4fv(
            gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            false,
            camera.getProjectionMatrix()
        );


        // Request the next frame
        requestAnimationFrame(drawScene);
    }

    // Start the rendering loop
    requestAnimationFrame(drawScene);
}
