import * as THREE from 'three';

export class CanvasSetup {
  constructor(scene, width = 512, height = 512, position = { x: 0, y: 5, z: -20 }) {
    this.scene = scene;
    this.width = width;
    this.height = height;
    this.position = position;
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.material = new THREE.MeshBasicMaterial({ map: this.texture });
    this.geometry = new THREE.PlaneGeometry(10, 10);
    this.whiteboard = new THREE.Mesh(this.geometry, this.material);
    this.drawing = false;

    this.initCanvas();
    this.initWhiteboard();
    this.addEventListeners();
  }

  initCanvas() {
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.context.fillStyle = 'white';
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    document.body.appendChild(this.canvas);
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '10px';
    this.canvas.style.left = '10px';
    this.canvas.style.border = '1px solid black';
  }

  initWhiteboard() {
    this.whiteboard.position.set(this.position.x, this.position.y, this.position.z);
    this.scene.add(this.whiteboard);
  }

  addEventListeners() {
    this.canvas.addEventListener('mousedown', (e) => {
      this.drawing = true;
      this.context.moveTo(e.offsetX, e.offsetY);
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (this.drawing) {
        this.context.lineTo(e.offsetX, e.offsetY);
        this.context.stroke();
        this.texture.needsUpdate = true; // Update the texture
      }
    });

    this.canvas.addEventListener('mouseup', () => {
      this.drawing = false;
    });
  }
}