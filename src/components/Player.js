import * as THREE from 'three'

import { LEFT_LANE_POSITION, CENTER_LANE_POSITION, RIGHT_LANE_POSITION } from '../settings.js';
import { PLAYER_LATERAL_SPEED, PLAYER_JUMP_HEIGHT, PLAYER_JUMP_POWER } from '../settings.js';
import { PLAYER_SPEED } from '../settings.js'; //for updating bounding box position in a function that animate() can call on the player
import { Death } from './Death.js';

// @ts-ignore
import { FBXLoader } from 'https://unpkg.com/three@0.152.2/examples/jsm/loaders/FBXLoader.js'; //PROBLEM: WHAT THE FUCK IS THAT


export class Player {

    constructor() {
        //player mesh
        this.geometry = new THREE.BoxGeometry(0.1,0.1,0.1);
        this.material = new THREE.MeshPhongMaterial( {color: 0x00ff00} );
        this.material.opacity = 0;
        this.playerMesh = new THREE.Mesh(this.geometry, this.material);

        //player bounding box
        this.bounding_box = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
        this.bounding_box.setFromObject(this.playerMesh);
        this.helper = new THREE.Box3Helper(this.bounding_box, 0xff0000);
    
        //lane flags
        this.currentLane = 'center_lane';
        this.destinationLane = 'center_lane';

        //init jumping flags
        this.startedJump = false;
        this.endedJump = true;
        this.startedFall = false;

        //jump power and base gravity speed
        this.jumpPower = PLAYER_JUMP_POWER;
        this.gravity = 5;

        //jump and gravity acceleration
        this.jumpDecceleration = 0.2; //I have no idea what this should be I have to see it first
        this.fallAcceleration = 0;

        //jump starting height
        this.jumpStartingHeight = 0;

        //boolean alive
        this.isAlive = true;

        //death 
        this.deathScreen = new Death();

        //coins
        this.coinsCollected = 0;
    }

    updatePosition() {
        this.updatePlayerMesh();
        this.updateBoundingBox();
        //this.updateCameraPosition();
    }

    updatePlayerMesh() {
        this.playerMesh.translateZ(PLAYER_SPEED * -1);
    }

    updateBoundingBox() {
        // Set the bounding box from the player mesh
        this.bounding_box.setFromObject(this.playerMesh);
    
        // Get the current size of the bounding box
        const size = this.bounding_box.getSize(new THREE.Vector3());
        const narrowFactor = 0.5; // Scale factor for narrowing
    
        // Scale down the width of the bounding box (x dimension)
        size.x *= narrowFactor;
    
        // Recenter the bounding box: 
        // Adjust the min and max positions to maintain the original center
        const center = this.bounding_box.getCenter(new THREE.Vector3());
    
        // Update the bounding box with the new size and keep it centered
        this.bounding_box.min.set(center.x - size.x / 2, this.bounding_box.min.y, this.bounding_box.min.z);
        this.bounding_box.max.set(center.x + size.x / 2, this.bounding_box.max.y, this.bounding_box.max.z);

        // Move the bounding box back along the Z-axis
        const offsetZ = -20; // Change this value to move it farther or closer along the Z-axis
        this.bounding_box.min.z -= offsetZ;
        this.bounding_box.max.z -= offsetZ;
    }
    
    

    // updateCameraPosition() {
    //     this.camera.position.x = this.playerMesh.position.x; //-left +right
    //     this.camera.position.y = this.playerMesh.position.y +80;
    //     this.camera.position.z = this.playerMesh.position.z +150; // -forward +backward
    // }
    

    startJump() {
        if (this.startedJump == false && this.endedJump == true)
        {   
            // const translationVector = new THREE.Vector3(0, 80, 0);
            // this.bounding_box.translate(translationVector);
            //this.playerMesh.translateY(20) PROBLEM: instead of this we can say add a +20 to the bounding box,  this concept would also fix some other problems like if the players feet only skin the front of the carriage


            this.startedJump = true; //BREAKPOINT HERE
            this.endedJump = false;


            this.jumpStartingHeight = this.playerMesh.position.y; //set the starting height to the current height before the jump
            this.jumpPower = PLAYER_JUMP_POWER; 
        } else { console.log("Cannot start jump!    player.startedJump: ", this.startedJump, " < needs to be false  ", "player.endedJump: ", this.endedJump, "  < needs to be true");}
    }
    

    pollMovements() {
        this.pollJump();
        this.pollFall();
        this.pollLaneTransition();
    }
    
    //jump portion
    pollJump() {
        
        if (this.startedJump == true) 
        {
            this.bounding_box.min.y += 20;
            if (this.playerMesh.position.y < this.jumpStartingHeight + PLAYER_JUMP_HEIGHT) //PROBLEM: this needs to be settings.js JUMP_HEIGHT
            {
                this.playerMesh.position.y += this.jumpPower;
                this.jumpPower -= this.jumpDecceleration; //deccelarate the rising velocity of the player
            } 
            else if (this.playerMesh.position.y >= this.jumpStartingHeight + PLAYER_JUMP_HEIGHT)
            {
                this.startedJump = false; // do we need two?
                this.startedFall = true;

                //reset the starting height variable
                //this.jumpStartingHeight
            }
        }    
    }
  
    
    //fall portion
    pollFall() {
        if (this.startedFall == true) 
        {
            if (this.playerMesh.position.y > 0) //PROBLEM: COLLISION DETECTION REQUIRED HERE
            {
                this.playerMesh.position.y -= this.gravity;
                this.gravity += this.fallAcceleration; //accelerate the falling velocity of the player
            } 
            else if (this.playerMesh.position.y <= 0)
            {
                this.playerMesh.position.y = 0; //put him at 0 incase he calls through the fllor for some reason
                

                //reset flags
                this.endedJump = true;
                this.startedFall = false;
                //reset gravity and jumpPower
                this.jumpPower = PLAYER_JUMP_POWER; //PROBLEM: use settings.js
                this.gravity = 5;
            }
        }
    }

    
    pollFall2() {
        if (this.startedFall == true) 
        {
            if (this.playerMesh.position.y > 0) //PROBLEM: COLLISION DETECTION REQUIRED HERE
            {
                this.playerMesh.position.y -= this.gravity;
                this.gravity += this.fallAcceleration; //accelerate the falling velocity of the player
            } 
            else if (this.playerMesh.position.y <= 0)
            {
                this.playerMesh.position.y = 0; //put him at 0 incase he calls through the fllor for some reason
                

                //reset flags
                this.endedJump = true;
                this.startedFall = false;
                //reset gravity and jumpPower
                this.jumpPower = PLAYER_JUMP_POWER; //PROBLEM: use settings.js
                this.gravity = 5;
            }
        }
    }

    //the key press event handler changes the player.destinationLane, we poll very anim call to see if player is in its destination lane 
    pollLaneTransition() {
        if (this.checkIfPlayerHasReachedDestinationLane() == false) 
            this.transitionLanes(this.destinationLane); 
    }


    addToScene(scene) {
        scene.add(this.playerMesh);
        scene.add(this.camera);
    
        const loader = new FBXLoader();
        loader.load('./assets/character.fbx', (model) => {
            model.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI);
            this.playerMesh.add(model);
            
            this.playerMesh.scale.set(0.3, 0.3, 0.3);
            //this.playerMesh.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI); //rotate him 180 to face forward

    
            this.mixer = new THREE.AnimationMixer(model);
    
            if (model.animations.length > 0) {
                const action = this.mixer.clipAction(model.animations[0]);
                action.play();
            }
    
            //move these INSIDE after loading the model!
            scene.add(this.bounding_box);
            scene.add(this.helper);
        });
    }

    update(deltaTime) {
        if (this.mixer) {
            //update the animation mixer with the delta time
            this.mixer.update(deltaTime);  //this ensures the animation stays in sync with the time delta
        }
    }
    
    
    transitionLanes(destinationLane) {   
        switch (destinationLane) {
            case 'left_lane':
                if (this.playerMesh.position.x != LEFT_LANE_POSITION) 
                    this.playerMesh.position.x -= PLAYER_LATERAL_SPEED;
                break;
            case 'center_lane':
                if (this.playerMesh.position.x != CENTER_LANE_POSITION) 
                {
                    if (CENTER_LANE_POSITION > this.playerMesh.position.x) //center lane is to the right
                        this.playerMesh.position.x += PLAYER_LATERAL_SPEED
                    else if (CENTER_LANE_POSITION < this.playerMesh.position.x) //center lane is to the left
                        this.playerMesh.position.x -= PLAYER_LATERAL_SPEED;
                }
                break;
            case 'right_lane':
                if (this.playerMesh.position.x != RIGHT_LANE_POSITION) 
                    this.playerMesh.position.x += PLAYER_LATERAL_SPEED; 
                break;
        }
    }
    

    checkIfPlayerHasReachedDestinationLane() { //also sets Player.currentLane equal to Player.destinationLane if true 
        switch(this.destinationLane) {
            case 'left_lane':
                if (this.playerMesh.position.x == LEFT_LANE_POSITION) {
                    this.currentLane = 'left_lane'
                    return true;
                } 
                else { return false; }
            case 'center_lane':
                if (this.playerMesh.position.x == CENTER_LANE_POSITION) {
                    this.currentLane = 'center_lane'
                    return true;
                } 
                else { return false; }
            case 'right_lane':
                if (this.playerMesh.position.x == RIGHT_LANE_POSITION) {
                    this.currentLane = 'right_lane'
                    return true;
                } 
                else { return false; }
        }
    }

}