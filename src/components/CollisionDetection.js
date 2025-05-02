export class CollisionDetection {

    static checkCollisions(player, boundingBoxQueue) {
        for (let i = boundingBoxQueue.length - 1; i >= 0; i--) {
            const currentBoundingBox = boundingBoxQueue[i];
    
            if (
                isNaN(currentBoundingBox.min.x) || isNaN(currentBoundingBox.max.x) ||
                isNaN(currentBoundingBox.min.y) || isNaN(currentBoundingBox.max.y) ||
                isNaN(currentBoundingBox.min.z) || isNaN(currentBoundingBox.max.z)
            ) {
                console.warn("Skipping collision check — invalid bounding box:", currentBoundingBox);
                continue; //skip this one but keep checking others
            }
    
            if (currentBoundingBox.intersectsBox(player.bounding_box)) { //this basicallay says, were on top of something therefore were not falling anymore
                console.log('Collision Detected!', "    currentBoundingBox: ", currentBoundingBox);
                return true;
            }
                
        }

        return false; //if we check every box against the player_bbox and exit the for-loop than return false
    }


    static setFallState(player, boundingBoxQueue) //PROBLEM: instead of this function being in here and called setFallState, it should be in player and called startFall()
    {
        if (this.checkCollisions(player, boundingBoxQueue) == true) 
        {
            player.endedJump = true; 
            player.startedJump = false;
            player.startedFall = false;
        } 
        else if (player.playerMesh.position.y > 0 && player.startedJump == false) //this shouldnt pull us down if setFallState is called during a jump phase
        {
            player.startedFall = true;
            player.startedJump = false; //play around with these flags
        }

    }


    static pollCollisions(game)
    {
        this.setFallState(game.player, game.surfaceObjectBoundingBoxQueue);

        //check coin collisions 
        this.pollCoinCollisions(game);

        //check for collision with fronts of carriages
        if (this.checkCollisions(game.player, game.deathObjectBoundingBoxQueue)){
            game.player.isAlive = false; //if colliding with deathBoundingBox set alive flag to false (player death state)
        }
    }


    static pollCoinCollisions(game) {
        for (let i = game.coinBoundingBoxQueue.length - 1; i >= 0; i--) {
            const currentBoundingBox = game.coinBoundingBoxQueue[i];

            if (
                isNaN(currentBoundingBox.min.x) || isNaN(currentBoundingBox.max.x) ||
                isNaN(currentBoundingBox.min.y) || isNaN(currentBoundingBox.max.y) ||
                isNaN(currentBoundingBox.min.z) || isNaN(currentBoundingBox.max.z)
            ) {
                console.warn("Skipping collision check — invalid bounding box:", currentBoundingBox);
                continue; //skip this one but keep checking others
            }

            if (currentBoundingBox.intersectsBox(game.player.bounding_box)) { //this basicallay says, were on top of something therefore were not falling anymore
                console.log('Collision Detected!', "    currentBoundingBox: ", currentBoundingBox);
                game.coinBoundingBoxQueue.splice(i, 1); // Remove the collided bounding box
                
                let model = game.coinQueue[i];

                game.scene.remove(model)

                if (model.geometry) model.geometry.dispose();
                if (model.material) model.material.dispose(); //this could cause some weird async shit 

                game.coinQueue.splice(i, 1); //i really hope these queues are symmetric
                game.player.coinsCollected +=1;
            }
        }   
    }

}