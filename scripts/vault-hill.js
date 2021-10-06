import * as THREE from "../libs/three.module.js";
import { OrbitControls } from "../libs/OrbitControls.js";
import {LineGeometry, LineMaterial, Line2} from "../libs/three-fatline.module.js";

const colors = {
  Water: 0x122230,
  Green: 0x041922,
  Ground: 0x0a0f1d,
  Streets: 0x32495c,
  Bridges: 0x103665,
  Exclusive: 0xc1e5e6,
  Deluxe: 0x75bac1,
  Premium: 0x4aa6af,
  Standard: 0x00929c,
};

const sizes = {
  Exclusive: 48,
  Deluxe: 32,
  Premium: 16,
  Standard: 8,
};

function VaultHill({ data = {}, container = "#scene" }) {
  var scene,
    camera,
    renderer,
    controls,
    raycaster = new THREE.Raycaster(),
    INTERSECTED,
    height = window.innerHeight,
    width = window.innerWidth,
    lands,
    materials;

  const pointer = new THREE.Vector2();
  const tooltip = {};
  const maxZ = Math.max(...data.lands.map(d => d.y1));

  function createStreets() {
    const greens = new THREE.Group();

    data.streets.forEach((d) => {
      const p = createPolygon(d.coords);

      const land = new THREE.Mesh(p, materials.streets);
      land.renderDepth = 0;
      land.rotateX(Math.PI / 2);

      greens.add(land);
    });

    scene.add(greens);
  }

  function createLands() {
    const geometries = {
      Exclusive: new THREE.BoxGeometry(32, sizes.Exclusive, 32),
      Deluxe: new THREE.BoxGeometry(32, sizes.Deluxe, 32),
      Premium: new THREE.BoxGeometry(32, sizes.Premium, 32),
      Standard: new THREE.BoxGeometry(32, sizes.Standard, 32),
    };

    const materials = {
      Exclusive: new THREE.MeshStandardMaterial({
        color: colors.Exclusive,
        flatShading: true,
        side: THREE.DoubleSide,
      }),
      Deluxe: new THREE.MeshStandardMaterial({
        color: colors.Deluxe,
        flatShading: true,
        side: THREE.DoubleSide,
      }),
      Premium: new THREE.MeshStandardMaterial({
        color: colors.Premium,
        flatShading: true,
        side: THREE.DoubleSide,
      }),
      Standard: new THREE.MeshStandardMaterial({
        color: colors.Standard,
        flatShading: true,
        side: THREE.DoubleSide,
      }),
    };

    lands = new THREE.Group();

    for (let i = 0; i < data.lands.length; i++) {
      const { x1, y1, ...rest } = data.lands[i];
      const type = rest.Name.split("_")[0];

      const geometry = geometries[type];
      const material = materials[type];

      const mesh = new THREE.Mesh(geometry, material);

      mesh.userData = rest;
      mesh.position.x = x1;
      mesh.position.y = 0;
      mesh.position.z = y1;

      mesh.updateMatrix();
      mesh.matrixAutoUpdate = false;

      lands.add(mesh);
    }

    scene.add(lands);
  }

  function createGreenAreas() {
    const greens = new THREE.Group();

    data.greenAreas.forEach((d) => {
      const p = createPolygon(d.coords);

      const land = new THREE.Mesh(p, materials.greenLands);
      land.renderDepth = 0;
      land.rotateX(Math.PI / 2);

      greens.add(land);
    });

    scene.add(greens);
  }

  function createCommonSpaces() {
    const greens = new THREE.Group();

    data.commonSpaces.forEach((d) => {
      const p = createPolygon(d.coords);

      const land = new THREE.Mesh(p, materials.greenLands);
      land.renderDepth = 0;
      land.rotateX(Math.PI / 2);

      greens.add(land);
    });

    scene.add(greens);
  }

  function createMaterials() {
    const greenLands = new THREE.MeshBasicMaterial({
      color: colors.Green,
      depthWrite: false,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      polygonOffsetUnits: 1,
    });

    const streets = new THREE.MeshBasicMaterial({
      color: colors.Streets,
      depthWrite: false,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      polygonOffsetUnits: 1,
    });

    const matLine = new LineMaterial({
      color: colors.Bridges,
      flatShading: true,
      linewidth: 2, // px
      worldUnits: true,
      depthWrite: false,
      alphaToCoverage: true,
      needsUpdate: true,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: 1,
      resolution: new THREE.Vector2(width, height), // resolution of the viewport
      dashed: false,
      alphaToCoverage: true,
      // dashed, dashScale, dashSize, gapSize
    });

    return {
      greenLands,
      streets,
      matLine,
    };
  }

  function createLine(pos) {
    const geometry = new LineGeometry();
    geometry.setPositions(pos);
    const line = new Line2(geometry, materials.matLine);
    line.computeLineDistances();
    line.scale.set( 1, 1, 1 );
    scene.add( line );
  }

  function createBridges() {

    const y = -1;

    data.bridges
      .forEach(({ Name, coords }) => {
        const isParralel = Name.includes("Parallels");

        const positions = coords.flatMap(d => [d[0], y, d[1]]);

        if (!isParralel) {
          positions.push(coords[0][0], y, coords[0][1]);
        }

        createLine(positions)
      });

  }

  function createObjects() {
    materials = createMaterials();

    createGreenAreas();
    createStreets();
    createCommonSpaces();
    createLands();
    createBridges();
  }

  function createControls() {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.listenToKeyEvents(window);

    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.05;

    controls.screenSpacePanning = false;

    controls.minDistance = 100;
    controls.maxDistance = maxZ * 5;

    controls.maxPolarAngle = Math.PI / 2.5;
  }

  function createCamera() {
    const fov = 60; // Field of View. In DEGREES [1, 179]
    const aspect = width / height;
    const near = 0.01; // the near clipping plane
    const far = 100000; // the far clipping plane

    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, maxZ * 2, 0);
  }

  function createRenderer() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor( 0x000000, 0.0 );
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    renderer.clearDepth(); // important!

    document.querySelector(container).appendChild(renderer.domElement);
    document.body.addEventListener("mousemove", onPointerMove);

    // ???
    // renderer.gammaFactor = 2.2;
    // renderer.gammaOutput = true;

    // renderer.physicallyCorrectLights = true;
  }

  function onPointerMove(event) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    tooltip.x = event.clientX;
    tooltip.y = event.clientY;
  }

  function createLights() {
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1);
    dirLight1.position.set(-10, -10, -10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 1);
    dirLight2.position.set(10, 10, 10);
    scene.add(dirLight2);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);
  }

  function render() {
    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects(lands.children, false);

    if (intersects.length > 0) {
      if (INTERSECTED != intersects[0].object) {
        if (INTERSECTED)
          INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);

        INTERSECTED = intersects[0].object;
        INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
        INTERSECTED.material.emissive.setHex(0xff0000);
        showTooltip();
      }
    } else {
      if (INTERSECTED)
        INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
      INTERSECTED = null;
      hideTooltip();
    }

    renderer.render(scene, camera);
  }

  function animate() {
    requestAnimationFrame(animate);

    controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

    render();
  }

  function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(colors.Water);

    createCamera();
    createRenderer();
    createControls();

    createLights();
    createObjects();

    animate();
  }

  function onWindowResize() {
    width = window.innerWidth;
    height = window.innerHeight;

    camera.aspect = width / height;

    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  function createPolygon(poly) {
    const shape = new THREE.Shape();

    shape.moveTo(poly[0][0], poly[0][1]);

    for (var i = 1; i < poly.length; ++i) {
      shape.lineTo(poly[i][0], poly[i][1]);
    }

    shape.lineTo(poly[0][0], poly[0][1]);

    const geometry = new THREE.ShapeGeometry(shape);
    return geometry;
  }

  function showTooltip() {
    if (!INTERSECTED) return hideTooltip();
  
    const t = document.getElementById("tooltip");
    const datum = INTERSECTED.userData;
  
    t.style.left = tooltip.x + 5 + "px";
    t.style.top = tooltip.y + 5 + "px";
  
    t.innerHTML = `
            <div style="margin-bottom: 10px">ID: ${datum.ID}</div>
            <div>NAME: ${datum.Name}</div>
          `;
  }
  
  function hideTooltip() {
    const t = document.getElementById("tooltip");
  
    t.style.left = "-350px";
    t.innerHTML = "";
  }

  init();
  window.addEventListener("resize", onWindowResize);

  return {};
}

export default VaultHill;
