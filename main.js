import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

// --- Scene, Camera, and Renderer Setup ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.toneMapping = THREE.ReinhardToneMapping; // Important for bloom effect
document.body.appendChild(renderer.domElement);

camera.position.set(0, 5, 25);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Adds a smooth "inertia" to camera movement

// --- Post-Processing (for the Glow Effect) ---
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5, // strength
    0.4, // radius
    0.85 // threshold
);
const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// --- Create the Central Energy Core ---
const coreGeometry = new THREE.SphereGeometry(4, 32, 32);
const coreMaterial = new THREE.MeshBasicMaterial({ color: 0x04d9ff, wireframe: true });
const energyCore = new THREE.Mesh(coreGeometry, coreMaterial);
scene.add(energyCore);

// --- Create the Orbital Rings ---
function createRing(radius, tubeRadius, color) {
    const geometry = new THREE.TorusGeometry(radius, tubeRadius, 16, 100);
    const material = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color, // Makes the material glow
        emissiveIntensity: 2
    });
    const ring = new THREE.Mesh(geometry, material);
    scene.add(ring);
    return ring;
}

const ring1 = createRing(8, 0.1, 0x00aaff);
const ring2 = createRing(10, 0.1, 0x00ffff);
const ring3 = createRing(12, 0.1, 0x4dffff);
ring2.rotation.x = Math.PI / 2; // Rotate the second ring 90 degrees

// --- Create a Shimmering Starfield ---
const starVertices = [];
for (let i = 0; i < 10000; i++) {
    const x = (Math.random() - 0.5) * 200;
    const y = (Math.random() - 0.5) * 200;
    const z = (Math.random() - 0.5) * 200;
    starVertices.push(x, y, z);
}
const starGeometry = new THREE.BufferGeometry();
starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);


// --- Animation Loop ---
const clock = new THREE.Clock(); // Clock to manage time for animations

function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime(); // Get time since start

    // Animate the core
    energyCore.rotation.y = elapsedTime * 0.2;
    energyCore.scale.set(
        Math.sin(elapsedTime * 1.5) * 0.1 + 1,
        Math.sin(elapsedTime * 1.5) * 0.1 + 1,
        Math.sin(elapsedTime * 1.5) * 0.1 + 1
    ); // Pulsating effect

    // Animate the rings
    ring1.rotation.z = elapsedTime * 0.3;
    ring2.rotation.z = elapsedTime * 0.3;
    ring3.rotation.y = elapsedTime * -0.2;
    
    controls.update();
    composer.render(); // Use the composer to render the scene with post-processing
}

animate();

// --- Handle Window Resizing ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});