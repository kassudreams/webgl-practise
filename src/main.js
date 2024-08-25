import { startGame } from './game.js';

function resizeCanvasToDisplaySize(canvas) {
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    // Check if the canvas size needs to be updated
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        // Set the canvas width and height to the display size
        canvas.width = displayWidth;
        canvas.height = displayHeight;
    }
}

function main() {
    const canvas = document.getElementById("glCanvas");
    const gl = canvas.getContext("webgl2");

    if (!gl) {
        console.error("Unable to initialize WebGL. Your browser may not support it.");
        return;
    }

    // Set the canvas size
    resizeCanvasToDisplaySize(canvas);

    // Set the viewport to match the canvas dimensions
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Set the clear color to black, fully opaque
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // Enable depth testing
    gl.enable(gl.DEPTH_TEST);
    // Near things obscure far things
    gl.depthFunc(gl.LEQUAL);
    // Clear the color as well as the depth buffer.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Start the game
    startGame(gl, canvas);
}

window.onload = main;
