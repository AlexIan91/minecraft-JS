import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class NPC {
  constructor(scene, world, position) {
    this.scene = scene;
    this.world = world;
    this.position = position;
    this.velocity = new THREE.Vector3();
    this.model = null;
    this.mixer = null;
    this.actions = {};
    this.currentAction = null;
    this.modelScale = 10; // Adjust this value to make the model more visible
    this.loadModel();
    console.log("NPC construct or called with position:", position);

  } 

  loadModel() {
    const loader = new GLTFLoader();
    loader.load('models/Llama.glb', (gltf) => {
      this.model = gltf.scene;
      console.log("Model loaded successfully:", gltf);
      // Scale the model
      this.model.scale.set(this.modelScale, this.modelScale, this.modelScale);
      this.model.position.copy(this.position);
      this.scene.add(this.model);
      console.log("NPC model added to scene:", this.model);
      console.log("NPC model loaded and added to scene at:", this.model.position);


      // Set up animations
      this.mixer = new THREE.AnimationMixer(this.model);
      gltf.animations.forEach((clip) => {
        const action = this.mixer.clipAction(clip);
        this.actions[clip.name] = action;
      });

      // If the model has an 'idle' animation, play it by default
      if (this.actions['idle']) {
        this.playAnimation('idle');
      } else if (this.actions.length > 0) {
        // If there's no 'idle' animation, play the first available animation
        this.playAnimation(Object.keys(this.actions)[0]);
      }
    });
  }

  update(dt) {
    if (this.mixer) {
      this.mixer.update(dt);
    }

    // Simple AI logic
    this.think(dt);

    // Apply movement
    this.position.add(this.velocity.clone().multiplyScalar(dt));
    if (this.model) {
      this.model.position.copy(this.position);
      
      // Make the NPC face the direction it's moving
      if (this.velocity.length() > 0) {
        this.model.lookAt(this.model.position.clone().add(this.velocity));
      }
    }

    // Collision detection and resolution (simplified)
    this.handleCollisions();
  }

  think(dt) {
    // Simple random movement
    if (Math.random() < 0.02) {
      this.velocity.set(
        (Math.random() - 0.5) * 2,
        0,
        (Math.random() - 0.5) * 2
      );
      this.playAnimation('walk');
    }

    // Stop occasionally
    if (Math.random() < 0.01) {
      this.velocity.set(0, 0, 0);
      this.playAnimation('idle');
    }
  }

  handleCollisions() {
    // Simple collision detection with the world
    const floorHeight = this.world.getTerrainHeightAt(this.position.x, this.position.z);
    if (this.position.y < floorHeight) {
      this.position.y = floorHeight;
      this.velocity.y = 0;
    }
  }

  playAnimation(name) {
    if (this.currentAction) {
      const fadeDuration = 0.2;
      this.currentAction.fadeOut(fadeDuration);
    }
    this.currentAction = this.actions[name];
    if (this.currentAction) {
      this.currentAction.reset().fadeIn(0.2).play();
    }
  }
}