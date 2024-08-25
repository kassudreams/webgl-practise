import { mat4 } from 'gl-matrix';
import { createProgram, vertexShaderSource, fragmentShaderSource } from './shaders.js';
import { initBuffers, drawModel } from './models.js';
import { loadTexture } from './textures.js';
import { createPerspectiveMatrix } from './utils.js';

export function startGame(gl, canvas) {
    const shaderProgram = createProgram(gl, vertexShaderSource, fragmentShaderSource);
    const buffers = initBuffers(gl);
    const texture = loadTexture(gl, 'assets/textures/texture.png');

    // Projection matrix for perspective projection
    const projectionMatrix = createPerspectiveMatrix(
        Math.PI / 4,                    // Field of view (45 degrees)
        gl.canvas.clientWidth / gl.canvas.clientHeight, // Aspect ratio
        0.1,                            // Near clipping plane
        100.0                           // Far clipping plane
    );

    // Model-view matrix to position the cube
    const modelViewMatrix = mat4.create();
    mat4.translate(modelViewMatrix, modelViewMatrix, [-0.0, 0.0, -6.0]); // Move cube back

    // Normal matrix for lighting calculations
    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, modelViewMatrix);
    mat4.transpose(normalMatrix, normalMatrix);

    // Mouse and keyboard variables
    let lastMouseX = 0;
    let lastMouseY = 0;
    let isDragging = false;
    let cameraAngleX = 0;
    let cameraAngleY = 0;
    let cameraRadius = 10;
    let cameraPosition = [0, 0, 0];
    let cameraSpeed = 0.1;
    let moveForward = false;
    let moveBackward = false;
    let moveLeft = false;
    let moveRight = false;

    function updateCamera() {
        const x = cameraRadius * Math.sin(cameraAngleY) * Math.cos(cameraAngleX);
        const y = cameraRadius * Math.sin(cameraAngleX);
        const z = cameraRadius * Math.cos(cameraAngleY) * Math.cos(cameraAngleX);

        cameraPosition = [x, y, z];
    }

    function onMouseMove(event) {
        if (!isDragging) return;

        const deltaX = event.clientX - lastMouseX;
        const deltaY = event.clientY - lastMouseY;

        cameraAngleX += deltaX * 0.01;
        cameraAngleY -= deltaY * 0.01;
        cameraAngleY = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cameraAngleY)); // Clamp Y angle

        updateCamera();

        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
    }

    function onMouseDown(event) {
        isDragging = true;
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
    }

    function onMouseUp() {
        isDragging = false;
    }

    function onKeyDown(event) {
        switch (event.key) {
            case 'w':
                moveForward = true;
                break;
            case 's':
                moveBackward = true;
                break;
            case 'a':
                moveLeft = true;
                break;
            case 'd':
                moveRight = true;
                break;
        }
    }

    function onKeyUp(event) {
        switch (event.key) {
            case 'w':
                moveForward = false;
                break;
            case 's':
                moveBackward = false;
                break;
            case 'a':
                moveLeft = false;
                break;
            case 'd':
                moveRight = false;
                break;
        }
    }

    function updateCameraPosition() {
        if (moveForward) {
            cameraPosition[0] += cameraSpeed * Math.sin(cameraAngleY);
            cameraPosition[2] -= cameraSpeed * Math.cos(cameraAngleY);
        }
        if (moveBackward) {
            cameraPosition[0] -= cameraSpeed * Math.sin(cameraAngleY);
            cameraPosition[2] += cameraSpeed * Math.cos(cameraAngleY);
        }
        if (moveLeft) {
            cameraPosition[0] -= cameraSpeed * Math.cos(cameraAngleY);
            cameraPosition[2] -= cameraSpeed * Math.sin(cameraAngleY);
        }
        if (moveRight) {
            cameraPosition[0] += cameraSpeed * Math.cos(cameraAngleY);
            cameraPosition[2] += cameraSpeed * Math.sin(cameraAngleY);
        }
    }

    function drawScene() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        updateCameraPosition();

        gl.useProgram(shaderProgram);

        const viewMatrix = mat4.create();
        mat4.lookAt(viewMatrix, cameraPosition, [0, 0, 0], [0, 1, 0]);
        const modelViewMatrix = mat4.create();
        mat4.multiply(modelViewMatrix, viewMatrix, modelViewMatrix);

        gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'), false, projectionMatrix);
        gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'), false, modelViewMatrix);

        // Update the normal matrix
        const normalMatrix = mat4.create();
        mat4.invert(normalMatrix, modelViewMatrix);
        mat4.transpose(normalMatrix, normalMatrix);
        gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, 'uNormalMatrix'), false, normalMatrix);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(gl.getUniformLocation(shaderProgram, 'uSampler'), 0);

        drawModel(gl, shaderProgram, buffers);
        

        requestAnimationFrame(drawScene);
    }

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mouseup', onMouseUp);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    function getMouseRay(event) {
        const rect = canvas.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / canvas.width) * 2 - 1;
        const y = -((event.clientY - rect.top) / canvas.height) * 2 + 1;
    
        const rayNDC = [x, y, -1, 1];
        const rayWorld = mat4.create();
        mat4.invert(rayWorld, mat4.create());
        const rayClip = mat4.create();
        mat4.multiply(rayClip, rayNDC, rayWorld);
    
        return rayClip;

    }

    function checkRayIntersection(ray, objects) {
        // Implement a basic intersection test
        for (const object of objects) {
            // Check if the ray intersects with the object
            // This would involve mathematical checks specific to your object shapes
        }
    }
    
    function onMouseClick(event) {
        const ray = getMouseRay(event);
        checkRayIntersection(ray, [/* list of objects */]);
    }
    
    canvas.addEventListener('click', onMouseClick);

    requestAnimationFrame(drawScene);
}
