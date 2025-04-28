import * as THREE from 'three'


export class DeathObject {
    
    constructor(spawn_position_x, spawn_position_y, spawn_position_z) { //PROBLEM: add the object_queue?
        
        //Front of the carriage mesh
        this.front_of_carriage_mesh = new THREE.Mesh(
            new THREE.BoxGeometry(50, 50, 2),
            new THREE.MeshPhongMaterial( {color:  0xff0000} )
        )
        this.front_of_carriage_mesh.position.set(spawn_position_x, spawn_position_y - 24, spawn_position_z + 146);

        //Front of carriage bounding box for collision detection that kills player on contact
        this.front_of_carriage_bounding_box = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
        this.front_of_carriage_bounding_box.setFromObject(this.front_of_carriage_mesh);

        //Make invisible
        this.front_of_carriage_mesh.visible = false;
    }
}