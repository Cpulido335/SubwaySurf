// @ts-ignore
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"; // Import GLTFLoader
import { HALF_THE_DISTANCE_OF_THE_PLANES_Z_AXIS } from "../settings.js";
import { GROUND_SWAPCHAIN_OFFSET } from "../settings.js";


export class Ground {

    constructor(scene) {
        this.scene = scene;
        this.initGround();
    }


    async initGround() {
        this.groundObjectA = await this.createGround(0);
        this.groundObjectB = await this.createGround(GROUND_SWAPCHAIN_OFFSET);
        this.groundObjectInFront = 'B';
    }


    createGround(z_SpawnPosition) {
        return new Promise((resolve, reject) => {
            const loader = new GLTFLoader();
            loader.load('./assets/ground.glb', (gltf) => {
                let groundObject = gltf.scene;
                groundObject.position.set(0, 0, z_SpawnPosition);
                groundObject.scale.set(45, 45, 45);
                groundObject.receiveShadow = true;
    
                this.scene.add(groundObject);
                resolve(groundObject); //return the object when loaded
            }, undefined, (error) => {
                console.error("Error loading GLB:", error);
                reject(error);
            });
        });
    }
    

    swapChainSwap() { //z+ = backwards, z- =forwards
        if (this.groundObjectInFront == 'B') //if A is farther back than B
        {
            this.groundObjectA.position.z = this.groundObjectB.position.z;
            this.groundObjectB.position.z = this.groundObjectB.position.z + GROUND_SWAPCHAIN_OFFSET;
            this.groundObjectInFront = 'B';
        } 
        else if (this.groundObjectInFront == 'A')  //if B is farther back than A
        {
            this.groundObjectB.position.z = this.groundObjectA.position.z;
            this.groundObjectA.position.z = this.groundObjectA.position.z + GROUND_SWAPCHAIN_OFFSET
            this.groundObjectInFront = 'A';
        }
    }


    pollSwapChain(player_position_z) {
        if (this.groundObjectInFront == 'A')
        {
            if (player_position_z < this.groundObjectB.position.z - HALF_THE_DISTANCE_OF_THE_PLANES_Z_AXIS) // after player_position we need to have some sort of offset based on the size of the plane, it should be half the distance of the plane's z axis
            {
                this.swapChainSwap()
            }
        } 
        else if (this.groundObjectInFront == 'B')
        {
            if (player_position_z < this.groundObjectA.position.z - HALF_THE_DISTANCE_OF_THE_PLANES_Z_AXIS) // after player_position we need to have some sort of offset based on the size of the plane, it should be half the distance of the plane's z axis
            {
                this.swapChainSwap()
            }
        } 
    }
}