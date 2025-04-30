// @ts-ignore
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"; // Import GLTFLoader
import { SurfaceObject } from './SurfaceObject.js'; 
import { DeathObject } from './DeathObject.js'; 

import { LEFT_LANE_POSITION, CENTER_LANE_POSITION, RIGHT_LANE_POSITION } from '../settings.js';

//import { CoinSpawner } from "./Coin.js";


export class Spawner {
    constructor(scene,  
                modelMeshQueue, 
                surfaceObjectMeshQueue, surfaceObjectBoundingBoxQueue, 
                deathObjectMeshQueue, deathObjectBoundingBoxQueue,
                coinQueue) 
    {
        this.scene = scene; //a spawner instance needs references to the scene and the object queues
        this.surfaceObjectMeshQueue = surfaceObjectMeshQueue;
        this.modelMeshQueue = modelMeshQueue;
        this.surfaceObjectBoundingBoxQueue = surfaceObjectBoundingBoxQueue;

        this.deathObjectMeshQueue = deathObjectMeshQueue; //the fronts of the carriages that kills the player goes in these
        this.deathObjectBoundingBoxQueue = deathObjectBoundingBoxQueue;

        this.coinQueue = coinQueue;

        this.spawn_lanes = [1, 2, 3]; 
    }


    pickRandomLane() {
        console.log("Picking lane");
        return Math.floor(Math.random() * 3); // Random lane (0, 1, or 2)
    }
    

    createGround(z_SpawnPosition) {
        const loader = new GLTFLoader();
        loader.load('./assets/ground.glb', (gltf) => {
            let groundObject = gltf.scene; // Use gltf.scene instead of object
            groundObject.position.set(0, 0, z_SpawnPosition); //modify the spawn pos so multiple lanes 
            groundObject.scale.set(45, 45, 45); 
            groundObject.receiveShadow = true; //allow ground to receive shadows
            this.scene.add(groundObject);

        }, undefined, (error) => {
            console.error("Error loading GLB:", error);
        });
    }


    createCarriageObject(x_SpawnPosition, z_SpawnPosition) { //PROBLEM: change this to createCarriageMesh
        const loader = new GLTFLoader();
        loader.load('./assets/subway_car.glb', (gltf) => {
            let myObject = gltf.scene; //use gltf.scene instead of object
            myObject.position.set(x_SpawnPosition, 7, z_SpawnPosition); //modify the spawn pos so multiple lanes PROBLEM: why is there a 7??
            myObject.scale.set(6, 6, 6); //scale it up because its glb and i shrunk it in blender
            this.scene.add(myObject);
            this.modelMeshQueue.push(myObject); //store for animation

            //traverse the object to set castShadow on all mesh nodes
            myObject.traverse((node) => {
                if (node.isMesh) {
                    node.castShadow = true; 
                }
            });
        }, undefined, (error) => {
            console.error("Error loading GLB:", error);
        });
    }


    spawnCarriage(playerZPosition) {
        let x_position = 0;
        let z_position = playerZPosition - 1000; //this has to be based on the players z position PROBLEM: instead of 400 you should put something like CARRIAGE_SPAWN_DISTANCE from settings
        this.lane = this.pickRandomLane();
        console.log("Picked lane:", this.lane);

        switch (this.lane) {
            case 0: x_position = LEFT_LANE_POSITION; break;
            case 1: x_position = CENTER_LANE_POSITION; break;
            case 2: x_position = RIGHT_LANE_POSITION; break;
            default: x_position = 0; // Default if lane is not 0, 1, or 2
        }

        this.createCarriageObject(x_position, z_position);

        //add the bounding box meshes for visualization //PROBLEM: we dont need to visualize them when deployed

        //rooftop meshes and their corresponding boundingboxes
        var surfaceObject = new SurfaceObject(x_position, 58, z_position); //PROBLEM: wtf is this 58 for
        this.scene.add(surfaceObject.cuboid_mesh);   
        this.surfaceObjectMeshQueue.push(surfaceObject.cuboid_mesh); // Store for animation

        this.scene.add(surfaceObject.rooftop_bounding_box); //add bounding boxes to the bounding box queues
        this.surfaceObjectBoundingBoxQueue.push(surfaceObject.rooftop_bounding_box); //PROBLEM dont need rooftop prefix since its just a surface object

        
        //front_of_carriages_ that kill the player aka 'deathObject' meshes and their corresponding boundingboxes
        var deathObject = new DeathObject(x_position, 58, z_position);
        this.scene.add(deathObject.front_of_carriage_mesh);   
        this.deathObjectMeshQueue.push(deathObject.front_of_carriage_mesh); // Store for animation

        this.scene.add(deathObject.front_of_carriage_bounding_box);
        this.deathObjectBoundingBoxQueue.push(deathObject.front_of_carriage_bounding_box);
    }

    
    createCoinObject(x_SpawnPosition, z_SpawnPosition){
        const loader = new GLTFLoader();
        loader.load('./assets/gold_coin4.glb', (gltf) => {
            let myObject = gltf.scene; //use gltf.scene instead of object
            myObject.position.set(x_SpawnPosition, 20, z_SpawnPosition); //modify the spawn pos so multiple lanes PROBLEM: why is there a 7??
            myObject.scale.set(12, 12, 12); 
            myObject.rotation.x = Math.PI / 2; // rotate it so its up right
            this.scene.add(myObject);
            this.coinQueue.push(myObject); //store for animation

            //traverse the object to set castShadow on all mesh nodes
            myObject.traverse((node) => {
                if (node.isMesh) {
                    node.castShadow = true; 
                }
            });
        }, undefined, (error) => {
            console.error("Error loading GLB:", error);
        });
    }


    spawnCoin(playerZPosition) {
        let x_position = 0;
        let z_position = playerZPosition - 1000; //this has to be based on the players z position PROBLEM: instead of 400 you should put something like CARRIAGE_SPAWN_DISTANCE from settings
        this.lane = this.pickRandomLane();
        console.log("Picked lane:", this.lane);

        switch (this.lane) {
            case 0: x_position = LEFT_LANE_POSITION; break;
            case 1: x_position = CENTER_LANE_POSITION; break;
            case 2: x_position = RIGHT_LANE_POSITION; break;
            default: x_position = 0; // Default if lane is not 0, 1, or 2
        }
        this.createCoinObject(x_position, z_position);
    }
}
