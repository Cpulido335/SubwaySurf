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


    static pollCollisions(player, boundingBoxQueue, deathBoundingBoxQueue, coinBoundingBoxQueue, coinQueue)
    {
        this.setFallState(player, boundingBoxQueue);

        //check coin collisions 
        this.pollCoinCollisions(player, coinBoundingBoxQueue, coinQueue);

        //check for collision with fronts of carriages
        if (this.checkCollisions(player, deathBoundingBoxQueue)){
            player.isAlive = false; //if colliding with deathBoundingBox set alive flag to false (player death state)
        }
    }


    static pollCoinCollisions(player, coinBoundingBoxQueue, coinQueue) {
        for (let i = coinBoundingBoxQueue.length - 1; i >= 0; i--) {
            const currentBoundingBox = coinBoundingBoxQueue[i];

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
                coinBoundingBoxQueue.splice(i, 1); // Remove the collided bounding box
                
                let model = coinQueue[i];

                if (model.geometry) model.geometry.dispose();
                if (model.material) model.material.dispose(); //this could cause some weird async shit 

                coinQueue.splice(i, 1); //i really hope these queues are symmetric
                player.coinsCollected +=1;
            }
        }   
    }

}