import * as THREE from 'three'

import { Spawner } from './Spawner.js' 
import { RandomEventTimer } from './RandomEventTimer.js' 
import { Ground } from './Ground.js' 
import { Player } from './Player.js' 
import { DebugOverlay } from './DebugOverlay.js';
import { Death } from './Death.js';
import { PLAYER_SPEED } from '../settings.js'


export class Game {
    
    constructor() 
    {
        this.scene = new THREE.Scene()

        this.renderer = new THREE.WebGLRenderer({ antialias: true })
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement)

        //background
        this.loader = new THREE.TextureLoader();
        this.loader.load(
            './assets/background_sky_texture.jpg',
            (texture) => {
                console.log('Texture loaded:', texture);
                this.scene.background = texture; //Works because arrow functions preserve outer 'this'
            },
            undefined,
            (error) => {
                console.error('Texture loading failed:', error);
            }
        );

        //ambient light 
        this.al = new THREE.AmbientLight(0xffffff, 1); //ambient light
        this.scene.add(this.al);

        //direction light PROBLEM: why tf do we need this
        this.directional_light = new THREE.DirectionalLight(0xffffff, 1);
        this.directional_light.position.set(0, 400, 0);
        this.directional_light.castShadow = true;  // Enable shadow casting for the light source
        // Set the target's position — e.g., directly below and in front
        //this.directional_light.target.position.set(0, 0, -1);
        this.scene.add(this.directional_light);

        // Add a helper to visualize the directional light
        const lightHelper = new THREE.DirectionalLightHelper(this.directional_light, 50, 0xff0000);
        this.scene.add(lightHelper);

        //Object queues 
        this.surfaceObjectMeshQueue = []; 
        this.modelMeshQueue = [];
        this.surfaceObjectBoundingBoxQueue = [];

        // death object queues
        this.deathObjectMeshQueue = [];
        this.deathObjectBoundingBoxQueue = [];
        
        this.coinQueue = [];

        //create spawner instance //PROBLEM: this would be our carriage spawner and have the function spawnCoin or spawn a line of coins all at once 
        this.s = new Spawner(this.scene, this.modelMeshQueue, this.surfaceObjectMeshQueue, this.surfaceObjectBoundingBoxQueue, this.deathObjectMeshQueue, this.deathObjectBoundingBoxQueue, this.coinQueue);
        
        //create gorund instance
        this.ground = new Ground(this.scene);       
        
        //create player instance
        this.player = new Player();
        this.player.addToScene(this.scene);

        //add controls
        this.addControls(this.player)

        //carriage spawner timer
        this.timer1 = new RandomEventTimer(() => this.s.spawnCarriage(this.player.playerMesh.position.z), 2000);
        this.timer1.start(); //start the timer
        //coin spawner timer
        this.timer2 = new RandomEventTimer(() => this.s.spawnCoin(this.player.playerMesh.position.z), 500);
        this.timer2.start(); //start the timer

        
        
        //debug overlay
        this.debugOverlay = new DebugOverlay();

        //death screen
        this.death = new Death();
    }



    addControls(player) {
        function onDocumentKeyDown(event) {
            const keyCode = event.which || event.keyCode;
    
            // Space bar to jump
            if (keyCode === 32) {
                player.startJump();
            }
    
            // A = 65, D = 68
            switch (player.currentLane) {
                case 'left_lane':
                    if (keyCode === 68) {
                        player.destinationLane = 'center_lane';
                    }
                    break;
                case 'center_lane':
                    if (keyCode === 65) {
                        player.destinationLane = 'left_lane';
                    } else if (keyCode === 68) {
                        player.destinationLane = 'right_lane';
                    }
                    break;
                case 'right_lane':
                    if (keyCode === 65) {
                        player.destinationLane = 'center_lane';
                    }
                    break;
            }
        }
        document.addEventListener("keydown", onDocumentKeyDown, false);
    }
    
    destroy() {
    
        //Remove renderer canvas
        if (this.renderer && this.renderer.domElement && document.body.contains(this.renderer.domElement)) {
            document.body.removeChild(this.renderer.domElement);
        }
    
        //stop timers if any
        if (this.timer1) {
            this.timer1.stop();
        }
        if (this.timer2) {
            this.timer2.stop();
        }
    
    
        //clear object references
        this.surfaceObjectMeshQueue = [];
        this.modelMeshQueue = [];
        this.surfaceObjectBoundingBoxQueue = [];
        this.deathObjectMeshQueue = [];
        this.deathObjectBoundingBoxQueue = [];
    }

    updateLight() {
        this.directional_light.translateZ(PLAYER_SPEED * -1);

        //this.playerMesh.translateZ(PLAYER_SPEED * -1);
    }
} 
    