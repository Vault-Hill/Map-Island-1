import * as THREE from "../libs/three.module.js";
import { OrbitControls } from "../libs/OrbitControls.js";
import {
  LineGeometry,
  LineMaterial,
  Line2,
} from "../libs/three-fatline.module.js";
import {Sky} from '../libs/Sky.js';
import {Water} from '../libs/Water.js';
import {
  worldYPosition,
  scaleFactor,
  theme,
  sizes,
  waterMaterial,
  waterColor,
  sunColor
} from "./constants.js";

function VaultHill({
  data = {},
  container = "#scene",
  onLandClick = () => {},
  landTooltipHTML = () => {},
  material = "dark"
}) {
  var scene,
    camera,
    renderer,
    controls,
    raycaster = new THREE.Raycaster(),
    INTERSECTED,
    height = window.innerHeight,
    width = window.innerWidth,
    lands,
    materials,
    sun,
    sky,
    water,
    world,
    colors = theme[material || "dark"];

  const pointer = new THREE.Vector2();
  const tooltip = {};

  function createGreenAreas() {
    const greens = new THREE.Group();

    data.greenAreas.forEach((d) => {
      const p = createPolygon(d.coords);

      const land = new THREE.Mesh(p, materials.greenLands);

      land.position.y = worldYPosition - 0.02;
      land.renderOrder = 0;
      land.rotateX(Math.PI / 2);

      greens.add(land);
    });

    world.add(greens)
  }

  function createStreets() {
    const greens = new THREE.Group();

    data.streets.forEach((d) => {
      const p = createPolygon(d.coords);

      const land = new THREE.Mesh(p, materials.streets);
      land.position.y = worldYPosition - 0.01;
      land.renderOrder = 1;
      land.rotateX(Math.PI / 2);

      greens.add(land);
    });
    
    world.add(greens);
  }

  function createLakes() {
    const lakes = new THREE.Group();

    data.lakes.forEach((d) => {
      const p = createPolygon(d.coords);

      const land = new THREE.Mesh(p, materials.lakes);
      land.renderOrder = 3;
      land.position.y = worldYPosition - 0.005;
      land.rotateX(Math.PI / 2);

      lakes.add(land);
    });

    world.add(lakes);
  }

  function createLands() {
    const size = 32 / scaleFactor;
    const geometries = {
      Exclusive: new THREE.BoxGeometry(size, sizes.Exclusive, size),
      Deluxe: new THREE.BoxGeometry(size, sizes.Deluxe, size),
      Premium: new THREE.BoxGeometry(size, sizes.Premium, size),
      Standard: new THREE.BoxGeometry(size, sizes.Standard, size),
    };

    lands = new THREE.Group();

    for (let i = 0; i < data.lands.length; i++) {
      const { x1, y1, ...rest } = data.lands[i];
      const type = rest.Type;

      const geometry = geometries[type];
      const material = materials[type]();
      const size = sizes[type];

      const mesh = new THREE.Mesh(geometry, material);

      mesh.userData = rest;
      mesh.position.x = x1;
      mesh.position.y = worldYPosition + size / 2;
      mesh.position.z = y1;

      mesh.updateMatrix();
      mesh.matrixAutoUpdate = false;

      lands.add(mesh);
    }

    world.add(lands);
  }

  function createCommonSpaces() {
    const greens = new THREE.Group();

    data.commonSpaces.forEach((d) => {
      const p = createPolygon(d.coords);

      const land = new THREE.Mesh(p, materials.greenAreas);

      land.position.y = worldYPosition - 0.01;
      land.rotateX(Math.PI / 2);

      greens.add(land);
    });

    world.add(greens);
  }

  function createMaterials() {
    const greenLands = new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load(colors.GreenLand.value,function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }),
      side: THREE.BackSide,
    });

    const greenAreas = new THREE.MeshBasicMaterial({
      color: colors.Green,
      side: THREE.BackSide,
    });

    const streetColor = colors.Streets;

    const streets = new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load(streetColor.value, function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }),
      side: THREE.BackSide,
    });

    const lakes = new THREE.MeshBasicMaterial({
      color: colors.Lake,
      side: THREE.BackSide,
    });

    const matLine = new LineMaterial({
      color: colors.Bridges,
      linewidth: 1, // px
      resolution: new THREE.Vector2(width, height), // resolution of the viewport
      dashed: false,
      side: THREE.FrontSide,
    });

    return {
      greenLands,
      greenAreas,
      streets,
      matLine,
      lakes,
      Exclusive: () =>
        new THREE.MeshStandardMaterial({
          color: colors.Exclusive,
          flatShading: true,
          side: THREE.DoubleSide,
        }),
      Deluxe: () =>
        new THREE.MeshStandardMaterial({
          color: colors.Deluxe,
          flatShading: true,
          side: THREE.DoubleSide,
        }),
      Premium: () =>
        new THREE.MeshStandardMaterial({
          color: colors.Premium,
          flatShading: true,
          side: THREE.DoubleSide,
        }),
      Standard: () =>
        new THREE.MeshStandardMaterial({
          color: colors.Standard,
          flatShading: true,
          side: THREE.DoubleSide,
        }),
    };
  }

  function updateMaterials() {
    // green land texture
    const greenLandColor = colors.GreenLand;

    if (greenLandColor.type === "texture") {
      materials.greenLands.color.setHex(0xffffff);
      materials.greenLands.map = new THREE.TextureLoader().load(greenLandColor.value, function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        materials.greenLands.needsUpdate = true;
      });
    } else {
      materials.greenLands.color.setHex(greenLandColor.value);
      materials.greenLands.map = null; // not sure
      materials.greenLands.needsUpdate = true;
    }
    
    // green areas
    materials.greenAreas.color.setHex(colors.Green);

    // streets
    const streetColor = colors.Streets;

    if (streetColor.type === "texture") {
      materials.streets.color.setHex(0xffffff);
      materials.streets.map = new THREE.TextureLoader().load(streetColor.value, function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        materials.streets.needsUpdate = true;
      });
    } else {
      materials.streets.color.setHex(streetColor.value);
      materials.streets.map = null; // not sure
      materials.streets.needsUpdate = true;
    }

    // matLine
    materials.matLine.color.setHex(colors.Bridges);

    // lakes
    materials.lakes.color.setHex(colors.Lake);
  }

  function createLine(pos) {
    const geometry = new LineGeometry();
    geometry.setPositions(pos);
    const line = new Line2(geometry, materials.matLine);
    line.computeLineDistances();
    line.scale.set(1, 1, 1);
    world.add(line);
  }

  function createBridges() {
    const y = worldYPosition;

    data.bridges.forEach(({ Name, coords }) => {
      const isParralel = Name.includes("Parallels");

      const positions = coords.flatMap((d) => [d[0], y, d[1]]);

      if (!isParralel) {
        positions.push(coords[0][0], y, coords[0][1]);
      }

      createLine(positions);
    });
  }

  function createObjects() {
    materials = createMaterials();
    world = new THREE.Group();

    createWater();
    createGreenAreas();
    createStreets();
    createCommonSpaces();
    createLands();
    createBridges();
    createLakes();

    scene.add(world);
  }

  function createWater() {
    sun = new THREE.Vector3();

    // Water

    const waterGeometry = new THREE.PlaneGeometry(10000, 10000);

    water = new Water(waterGeometry, {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: new THREE.TextureLoader().load(
        waterMaterial,
        function (texture) {
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        }
      ),
      sunDirection: new THREE.Vector3(),
      sunColor: sunColor,
      waterColor: waterColor,
      distortionScale: 3.7,
      fog: scene.fog !== undefined,
    });

    water.rotation.x = -Math.PI / 2;

    water.material.uniforms.size.value = 15;

    // Skybox

    sky = new Sky();
    sky.scale.setScalar(10000);

    const skyUniforms = sky.material.uniforms;

    skyUniforms["turbidity"].value = 10;
    skyUniforms["rayleigh"].value = 2;
    skyUniforms["mieCoefficient"].value = 0.005;
    skyUniforms["mieDirectionalG"].value = 0.8;

    const parameters = {
      elevation: 3.5,
      azimuth: 160,
    };

    const pmremGenerator = new THREE.PMREMGenerator(renderer);

    function updateSun() {
      const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
      const theta = THREE.MathUtils.degToRad(parameters.azimuth);

      sun.setFromSphericalCoords(1, phi, theta);

      sky.material.uniforms["sunPosition"].value.copy(sun);
      water.material.uniforms["sunDirection"].value.copy(sun).normalize();

      scene.environment = pmremGenerator.fromScene(sky).texture;
    }

    updateSun();

    if (material === "ocean") {
      scene.add(water);
      scene.add(sky);
    }
  }

  function createControls() {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.listenToKeyEvents(window);

    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.05;

    controls.screenSpacePanning = false;

    controls.minDistance = 1;
    controls.maxDistance = 20;

    controls.maxPolarAngle = Math.PI / 2.5;
  }

  function createCamera() {
    const fov = 55; // Field of View. In DEGREES [1, 179]
    const aspect = width / height;
    const near = 0.1; // the near clipping plane
    const far = 20000; // the far clipping plane

    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 0, 20);
  }

  function createRenderer() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.setClearColor(0x000000, 0.0);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    renderer.clearDepth(); // important!

    const el = document.querySelector(container);
    el.appendChild(renderer.domElement);

    el.addEventListener("mousemove", onPointerMove);
    el.addEventListener("click", () => {
      if (INTERSECTED) {
        onLandClick(INTERSECTED.userData);
      } else {
        onLandClick(null);
      }
    });

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
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight1.position.set(-10, -10, -10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight2.position.set(10, 10, 10);
    scene.add(dirLight2);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
  }

  function render() {
    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects(lands.children, false);

    if (intersects.length > 0) {
      if (INTERSECTED != intersects[0].object) {
        if (INTERSECTED) {
          INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
        }

        INTERSECTED = intersects[0].object;
        INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
        INTERSECTED.material.color.setHex(colors.Highlight);
        showTooltip();
      }
    } else {
      if (INTERSECTED) {
        INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
      }

      INTERSECTED = null;
      hideTooltip();
    }

    if (water) {
      water.material.uniforms[ 'time' ].value += 1.0 / 120.0;
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
    // const axesHelper = new THREE.AxesHelper( 5 );
    // scene.add( axesHelper );
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

    t.innerHTML = landTooltipHTML(datum);
  }

  function hideTooltip() {
    const t = document.getElementById("tooltip");

    t.style.left = "-350px";
    t.innerHTML = "";
  }

  init();
  window.addEventListener("resize", onWindowResize);

  return {
    updateMaterial(name) {
      material = name;

      const update = () => {
        updateMaterials();

        scene.background = new THREE.Color(colors.Water);

        if (material === "ocean") {
          scene.add(water);
          scene.add(sky);
        } else {
          scene.remove(water);
          scene.remove(sky);
        }
      };

      switch (name) {
        case "ocean":
          colors = theme.ocean;
          update();
          break;

        case "dark":
          colors = theme.dark;
          update();
          break;

        case "light":
          colors = theme.light;
          update();
          break;
      
        default:
          break;
      }
    }
  };
}

export default VaultHill;
