import * as THREE from 'three'

export class CoinObject {
    
    
    constructor(spawn_position_x, spawn_position_y, spawn_position_z, coinBoundingBoxQueue) {
        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(50, 50, 2),
            new THREE.MeshPhongMaterial( {color:  0xff0000} )
        )
        this.mesh.visible = false; //make this bitch invisible
        this.mesh.position.set(spawn_position_x, spawn_position_y, spawn_position_z);

        //CoinObject.bounding_box for collision detection with coin objects to increase player score
        this.bounding_box = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
        this.bounding_box.setFromObject(this.mesh);

        //PROBLEM: WE CAN DELETE THE MESH AT THIS POINT WE DO NOT NEED IT ANYMORE
        
        coinBoundingBoxQueue.push(this.bounding_box);
    }
}