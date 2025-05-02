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

    static pollCollisions(player, boundingBoxQueue, deathBoundingBoxQueue, coinBoundingBoxQueue)
    {
        this.setFallState(player, boundingBoxQueue);

        //check for collisions with coins
        if (this.checkCollisions(player, coinBoundingBoxQueue)) {
            player.coinsCollected += 1;
        }

        //check for collision with fronts of carriages
        if (this.checkCollisions(player, deathBoundingBoxQueue)){
            player.isAlive = false; //if colliding with deathBoundingBox set alive flag to false (player death state)
        }
    }
    

}