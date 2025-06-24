import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import GUI from 'lil-gui'

const canvas = document.querySelector('canvas.webgl');
const prayButton = document.querySelector('button.fireButton');

let renderer;
let scene;
let persCamera;
let light1;
let light2;
let orbitControls;

// 3D objects

// time variables
let ti;
let dt;

// debug UI
const gui = new GUI();

// loader
const gltfLoader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();

// canvas sizes
let canvasSizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

// physics
const i = new THREE.Vector3(1, 0, 0);
const iNeg = new THREE.Vector3(-1, 0, 0);
const j = new THREE.Vector3(0, 1, 0);
const jNeg = new THREE.Vector3(0, -1, 0);
const k = new THREE.Vector3(0, 0, 1);
const kNeg = new THREE.Vector3(0, 0, -1);
const origin = new THREE.Vector3(0, 0, 0);

// misc
let praying = false;

function init() {
    // scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color('#e0f4ff');
   
    // light
    light1 = new THREE.DirectionalLight('white', 10);
    light1.position.set(4.5, 5, 0);
    scene.add(light1);

    light2 = new THREE.AmbientLight('white', 10);
    scene.add(light2);

    // camera
    persCamera = new THREE.PerspectiveCamera(45, canvasSizes.width/canvasSizes.height);
    persCamera.position.set(4, 4.5, 0);
    scene.add(persCamera);

    // renderer
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true
    });
    renderer.setSize(canvasSizes.width, canvasSizes.height);
    renderer.physicallyCorrectLights = true;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // control
    orbitControls = new OrbitControls(persCamera, canvas);
    orbitControls.enableDamping = true;
    orbitControls.enablePan = false;
    orbitControls.enableZoom = false;
    orbitControls.target = new THREE.Vector3(-1, 1, 0);
    orbitControls.update();
    orbitControls.saveState();

    // gui
    gui.hide();

    // Kai's planet 
    const planetTexture = textureLoader.load('static/textures/baked.jpg');
    planetTexture.flipY = false;
    planetTexture.colorSpace = THREE.SRGBColorSpace;
    const planetMaterial = new THREE.MeshBasicMaterial({map: planetTexture});
    gltfLoader.load(
        'static/models/prayToNewton.glb',
        (gltf) =>
            {
                gltf.scene.traverse((child) =>
                {
                    child.material = planetMaterial;
                })
                scene.add(gltf.scene)
            }
    )

    // event
    window.addEventListener('resize', () => {
        // update sizes
        canvasSizes.width = window.innerWidth;
        canvasSizes.height = window.innerHeight;

        // update camera
        persCamera.aspect = canvasSizes.width/canvasSizes.height;
        persCamera.updateProjectionMatrix();

        // update renderer
        renderer.setSize(canvasSizes.width, canvasSizes.height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    })

    prayButton.addEventListener('click', () => {
        pray();
    })

    // time
    ti = performance.now()/1000;

    // start animation
    animate();
}

function onEachStep() {
    // time
    dt = performance.now()/1000 - ti;
    ti = performance.now()/1000;
    if (dt > 0.02) { // set a hard limit for dt in case of stuttering or tab switching
        dt = 1/60;
    }

    // orbit control
    if (praying == false) {
        orbitControls.update();
    }

    renderer.render(scene, persCamera);
}

function animate() {
    onEachStep();
    requestAnimationFrame(animate);
}

window.onload = init();

function pray() {
    prayButton.style.display = 'none'
    praying = true;
    orbitControls.reset();
    let i = 0;
    const animate = setInterval(() => {
        if (persCamera.position.y > 3) {
            persCamera.position.y -= 0.02
            persCamera.lookAt(new THREE.Vector3(-1, 1, 0));
        } else {
            if (i < 200) {
                if (i < 100) {
                    persCamera.rotateOnWorldAxis(k, 0.006)
                } else {
                    persCamera.rotateOnWorldAxis(k, -0.006)
                }
                i++;
            } else {
                clearInterval(animate);
                prayButton.style.display = 'block'
                praying = false
            }
        }
    }, 1000/60);
}