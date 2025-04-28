import * as THREE from 'three'

import { Game } from './Game.js';
import { CARRIAGE_SPEED } from '../settings.js';
import { CollisionDetection } from './CollisionDetection.js';


export class Animation {

    static animationFrameId = null; //store animation frame ID and cancel it if needed
    static clock = new THREE.Clock();  //track time

    static animate(game) { //meat and potatoes 
        const delta = Animation.clock.getDelta();  //track the time since the last frame

        if (game.player.isAlive) {
            //continue the animation loop
            Animation.animationFrameId = requestAnimationFrame(() => Animation.animate(game));
            game.renderer.render(game.scene, game.player.camera);

            //background parallax effect
            if (game.scene.background && game.scene.background.isTexture) {
                game.scene.background.offset.x = game.player.camera.position.x * 0.0005;
                game.scene.background.offset.y = game.player.camera.position.y * 0.0005;
            }

            //update ground tiles
            game.ground.pollSwapChain(game.player.playerMesh.position.z);

            //player updates
            game.player.updatePosition();
            game.player.pollMovements();

            //check collisions
            CollisionDetection.pollCollisions(
                game.player, 
                game.surfaceObjectBoundingBoxQueue, 
                game.deathObjectBoundingBoxQueue
            );

            //move and remove objects
            this.updatePositions(game);

            //debug overlay
            game.debugOverlay.update(game.player);

            //if Game over > reset
            if (!game.player.isAlive) {
                Animation.resetGame(game);
            }
            
            //ANIMATION
            if (game.player.mixer) {
                game.player.mixer.update(delta);  //update the player model animation
            }
        }
    }

    static updatePositions(game) {
        //update model meshes
        for (let i = game.modelMeshQueue.length - 1; i >= 0; i--) {
            const model = game.modelMeshQueue[i];
            model.translateZ(CARRIAGE_SPEED);

            if (model.position.z > game.player.playerMesh.position.z + 200) {
                game.scene.remove(model);
                if (model.geometry) model.geometry.dispose();
                if (model.material) model.material.dispose();
                game.modelMeshQueue.splice(i, 1);
            }
        }

        // Update standard meshes and bounding boxes
        for (let i = game.surfaceObjectMeshQueue.length - 1; i >= 0; i--) {
            const mesh = game.surfaceObjectMeshQueue[i];
            const box = game.surfaceObjectBoundingBoxQueue[i];

            mesh.translateZ(CARRIAGE_SPEED);
            box.setFromObject(mesh);

            if (mesh.position.z > game.player.playerMesh.position.z + 200) {
                game.scene.remove(mesh);
                if (mesh.geometry) mesh.geometry.dispose();
                if (mesh.material) mesh.material.dispose();
                game.surfaceObjectMeshQueue.splice(i, 1);
                game.surfaceObjectBoundingBoxQueue.splice(i, 1);
            }
        }

        // Update death meshes and death-bounding-boxes
        for (let i = game.deathObjectMeshQueue.length - 1; i >= 0; i--) {
            const mesh = game.deathObjectMeshQueue[i];
            const box = game.deathObjectBoundingBoxQueue[i];

            mesh.translateZ(CARRIAGE_SPEED);
            box.setFromObject(mesh);

            if (mesh.position.z > game.player.playerMesh.position.z + 200) {
                game.scene.remove(mesh);
                if (mesh.geometry) mesh.geometry.dispose();
                if (mesh.material) mesh.material.dispose();
                game.deathObjectMeshQueue.splice(i, 1);
                game.deathObjectBoundingBoxQueue.splice(i, 1);
            }
        }
    }

    static async resetGame(game) {
        //stop the animation loop before showing the death screen
        Animation.stopAnimationLoop();

        //show death screen and wait for 3 seconds
        await game.death.showAndWait();

        //after 3 seconds, reset the game
        game.destroy(); // Destroy the old game
        game = new Game(); //assign it to a newly created game instance

        //restart the animation loop
        Animation.animate(game);

        return game;
    }

    static stopAnimationLoop() {
        if (Animation.animationFrameId) {
            cancelAnimationFrame(Animation.animationFrameId);
            Animation.animationFrameId = null; //clear the animation frame ID
        }
    }
}
