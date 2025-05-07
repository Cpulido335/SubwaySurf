import * as THREE from 'three'

import { Spawner } from './Spawner.js' 
import { RandomEventTimer } from './RandomEventTimer.js' 
import { Ground } from './Ground.js' 
import { Player } from './Player.js' 
import { DebugOverlay } from './DebugOverlay.js';
import { Death } from './Death.js';
import { PLAYER_SPEED } from '../settings.js'
import { CoinOverlay } from './CoinOverlay.js'


export class Game {
    
    constructor(containerId) 
    {
        // 1. Grab container and measure it
        this.container = document.getElementById(containerId);
        const width  = this.container.clientWidth;
        const height = this.container.clientHeight;

        // 2. Create renderer *before* we size it
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.shadowMap.enabled = true;
        
        //lower the quality to 0.5 (half resolution) to improve performance
        this.renderer.setPixelRatio(0.5); 

        this.container.appendChild(this.renderer.domElement);

        // 3. Create camera using the container’s aspect ratio
        const { clientWidth: w, clientHeight: h } = this.container;
        this.camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 4000);
        
        // 4. Apply initial size
        this.onWindowResize();
        
        this.scene = new THREE.Scene()

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

        this.directional_light = new THREE.DirectionalLight(0xffffff, 1);
        this.directional_light.position.set(0, 400, 0);
        this.directional_light.castShadow = true; 
        this.scene.add(this.directional_light);

        // Add a helper to visualize the directional light
        //const lightHelper = new THREE.DirectionalLightHelper(this.directional_light, 50, 0xff0000);
        //this.scene.add(lightHelper);

        //Object queues 
        this.surfaceObjectMeshQueue = []; 
        this.modelMeshQueue = [];
        this.surfaceObjectBoundingBoxQueue = [];

        //death object queues
        this.deathObjectMeshQueue = [];
        this.deathObjectBoundingBoxQueue = [];
        
        //coinMeshQueue and coinBoundingBoxQueue
        this.coinQueue = [];
        this.coinBoundingBoxQueue = [];

        //create spawner instance //PROBLEM: this would be our carriage spawner and have the function spawnCoin or spawn a line of coins all at once 
        this.s = new Spawner(this.scene, this.modelMeshQueue, this.surfaceObjectMeshQueue, this.surfaceObjectBoundingBoxQueue, this.deathObjectMeshQueue, this.deathObjectBoundingBoxQueue, this.coinQueue, this.coinBoundingBoxQueue);
        
        //create gorund instance
        this.ground = new Ground(this.scene);       
        
        //create player instance
        this.player = new Player();
        this.player.addToScene(this.scene);

        this.updateCameraPosition(); // position it relative to your player

        //add controls
        this.addControls(this.player)

        //carriage spawner timer
        this.timer1 = new RandomEventTimer(() => this.s.spawnCarriage(this.player.playerMesh.position.z), 2000);
        this.timer1.start(); 
        //coin spawner timer
        this.timer2 = new RandomEventTimer(() => this.s.spawnCoin(this.player.playerMesh.position.z), 500);
        this.timer2.start(); 

        //debug overlay
        this.debugOverlay = new DebugOverlay();

        //death screen
        this.death = new Death();
        
        //coin overlay (score)
        this.coinOverlay = new CoinOverlay();
    }


    updateCameraPosition() {
        this.camera.position.x = this.player.playerMesh.position.x; //-left +right
        this.camera.position.y = this.player.playerMesh.position.y +80;
        this.camera.position.z = this.player.playerMesh.position.z +150; // -forward +backward
    }


    onWindowResize() {
        const w = this.container.clientWidth;
        const h = this.container.clientHeight;
    
        //resize renderer
        this.renderer.setSize(w, h);

        
    
        //update camera
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
    }


    updateLight() {
        this.directional_light.translateZ(PLAYER_SPEED * -1);
    }

    addControls(player) {
        let touchStartX = null;
        let touchStartY = null;
        const SWIPE_THRESHOLD = 30; // px
      
        function onDocumentKeyDown(event) {
          const keyCode = event.which || event.keyCode;
      
          // Jump: Space
          if (keyCode === 32) {
            player.startJump();
            return;
          }
      
          // Move left: A (65) or ← (37)
          if ((keyCode === 65 || keyCode === 37) && player.currentLane !== 'left_lane') {
            if (player.currentLane === 'center_lane') player.destinationLane = 'left_lane';
            else if (player.currentLane === 'right_lane') player.destinationLane = 'center_lane';
            return;
          }
      
          // Move right: D (68) or → (39)
          if ((keyCode === 68 || keyCode === 39) && player.currentLane !== 'right_lane') {
            if (player.currentLane === 'center_lane') player.destinationLane = 'right_lane';
            else if (player.currentLane === 'left_lane') player.destinationLane = 'center_lane';
          }
        }
      
        function onTouchStart(e) {
          if (e.touches.length === 1) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
          }
        }
      
        function onTouchEnd(e) {
          if (touchStartX === null || touchStartY === null) return;
          const dx = e.changedTouches[0].clientX - touchStartX;
          const dy = e.changedTouches[0].clientY - touchStartY;
      
          // Vertical swipe (jump)
          if (dy < -SWIPE_THRESHOLD && Math.abs(dy) > Math.abs(dx)) {
            player.startJump();
          }
          // Horizontal swipe right
          else if (dx > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
            if (player.currentLane === 'left_lane')      player.destinationLane = 'center_lane';
            else if (player.currentLane === 'center_lane') player.destinationLane = 'right_lane';
          }
          // Horizontal swipe left
          else if (dx < -SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
            if (player.currentLane === 'right_lane')     player.destinationLane = 'center_lane';
            else if (player.currentLane === 'center_lane') player.destinationLane = 'left_lane';
          }
      
          touchStartX = null;
          touchStartY = null;
        }
      
        document.addEventListener('keydown',   onDocumentKeyDown, false);
        document.addEventListener('touchstart', onTouchStart,     false);
        document.addEventListener('touchend',   onTouchEnd,       false);
    }


    destroy() {
      if (this.renderer && this.renderer.domElement && this.container.contains(this.renderer.domElement)) {
        this.container.removeChild(this.renderer.domElement);
      }
    
      window.removeEventListener('resize', this._onResizeCallback);
      this.timer1?.stop();
      this.timer2?.stop();

      this.surfaceObjectMeshQueue = [];
      this.modelMeshQueue = [];
      this.surfaceObjectBoundingBoxQueue = [];
      this.deathObjectMeshQueue = [];
      this.deathObjectBoundingBoxQueue = [];
  
      this.container.innerHTML = '';
  }
          
} 
    