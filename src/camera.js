import { mat4 } from 'gl-matrix';

export class Camera {
    constructor(position = [0, 0, 0]) {
        this.position = position;
        this.target = [0, 0, 0];
        this.up = [0, 1, 0];
        this.viewMatrix = mat4.create();
        this.projectionMatrix = mat4.create();
        this.updateViewMatrix();
    }

    followPlayer(playerPosition) {
        // Update camera position to follow the player
        this.position[0] = playerPosition[0];
        this.position[1] = playerPosition[1] + 5; // Above the player
        this.position[2] = playerPosition[2] + 10; // Behind the player

        this.target = playerPosition; // Camera looks at the player

        this.updateViewMatrix();
    }

    updateViewMatrix() {
        mat4.lookAt(this.viewMatrix, this.position, this.target, this.up);
    }

    setProjectionMatrix(projectionMatrix) {
        this.projectionMatrix = projectionMatrix;
    }

    getViewMatrix() {
        return this.viewMatrix;
    }

    getProjectionMatrix() {
        return this.projectionMatrix;
    }
}
