import * as THREE from 'three'

//PROBLEM: this is a custom class that needs to be renamed to something like RooftopBoundingBox or 'SurfaceObject' since it encompasses both a mesh and a bounding box
export class SurfaceObject {
    
    constructor(spawn_position_x, spawn_position_y, spawn_position_z) { //PROBLEM: add the object_queue?
        //Rooftop mesh
        this.cuboid_mesh = new THREE.Mesh(
            new THREE.BoxGeometry(60, 2, 280),
            new THREE.MeshPhongMaterial( {color:  0x0000ff} )
        )

        this.cuboid_mesh.position.set(spawn_position_x, spawn_position_y, spawn_position_z);

        //Rooftop bounding box for collision detection that player can run on
        this.rooftop_bounding_box = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
        this.rooftop_bounding_box.setFromObject(this.cuboid_mesh);

        //make invisible
        this.cuboid_mesh.visible = false;
    }
}