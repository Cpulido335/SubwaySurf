// // @ts-ignore
// import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"; // Import GLTFLoader

// export class CoinSpawner {

//     constructor(scene) {
//         this.scene = scene; //PROBLEM: prob get rid of this


//     }

//     //PROBLEM: m_Ref to the scene
//     creatCoinObject(spawn_position_x, spawn_position_y, spawn_position_z) { //PROBLEM: change this to createCarriageMesh
//         const loader = new GLTFLoader();
//         loader.load('./assets/coin.js', (gltf) => {
//             let myObject = gltf.scene; //use gltf.scene instead of object
//             myObject.position.set(spawn_position_x, spawn_position_y, spawn_position_z); //modify the spawn pos so multiple lanes PROBLEM: why is there a 7??
//             myObject.scale.set(6, 6, 6); //scale it up because its glb and i shrunk it in blender
//             this.scene.add(myObject);
//             //this.modelMeshQueue.push(myObject); //store for animation

//             //traverse the object to set castShadow on all mesh nodes
//             myObject.traverse((node) => {
//                 if (node.isMesh) {
//                     node.castShadow = true; 
//                 }
//             });
//         }, undefined, (error) => {
//             console.error("Error loading GLB:", error);
//         });
//     }

// }