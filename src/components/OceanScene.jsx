import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import * as THREE from 'three';

const START_X = 34;
const END_X = -32;

const createWordPanel = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  texture.encoding = THREE.sRGBEncoding;
  texture.anisotropy = 16;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 1.8), material);
  plane.position.set(0.5, 0.2, 1.25);
  plane.renderOrder = 5;
  plane.userData = {
    canvas,
    context,
    texture,
    lastWord: '',
    lastTyped: '',
    lastTarget: false,
  };
  return plane;
};

const updateWordPanel = (panel, shark, isTarget) => {
  const data = panel.userData;
  if (!data || !data.context) {
    return;
  }

  if (
    data.lastWord === shark.word &&
    data.lastTyped === shark.typed &&
    data.lastTarget === isTarget
  ) {
    return;
  }

  data.lastWord = shark.word;
  data.lastTyped = shark.typed;
  data.lastTarget = isTarget;

  const { canvas, context, texture } = data;
  context.clearRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = isTarget ? 'rgba(255, 147, 79, 0.65)' : 'rgba(5, 28, 52, 0.65)';
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.font = 'bold 188px "Be Vietnam Pro", "Noto Sans", sans-serif';
  context.textAlign = 'left';
  context.textBaseline = 'middle';

  const typed = shark.word.slice(0, shark.typed.length);
  const remaining = shark.word.slice(shark.typed.length);

  const totalMetrics = context.measureText(shark.word);
  const typedMetrics = context.measureText(typed);
  const startX = (canvas.width - totalMetrics.width) / 2;
  const y = canvas.height / 2 + 8;

  context.fillStyle = '#ffe0b8';
  context.fillText(typed, startX, y);
  context.fillStyle = '#ffffff';
  context.fillText(remaining, startX + typedMetrics.width, y);

  context.lineWidth = 8;
  context.strokeStyle = isTarget ? 'rgba(255, 208, 79, 0.8)' : 'rgba(73, 185, 255, 0.45)';
  context.strokeRect(18, 18, canvas.width - 36, canvas.height - 36);

  texture.needsUpdate = true;
};

const createSharkMesh = () => {
  const group = new THREE.Group();
  const materials = [];
  const sharedMaterial = new THREE.MeshStandardMaterial({
    color: 0x4cb0ff,
    roughness: 0.45,
    metalness: 0.1,
    emissive: 0x081c2c,
    emissiveIntensity: 0.2,
  });

  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 1.6, 6, 18, 1, true), sharedMaterial);
  body.rotation.z = Math.PI / 2;
  group.add(body);
  materials.push(body.material);

  const headMaterial = sharedMaterial.clone();
  const head = new THREE.Mesh(new THREE.ConeGeometry(1.2, 2.2, 22), headMaterial);
  head.position.set(3, 0, 0);
  head.rotation.z = Math.PI / 2;
  group.add(head);
  materials.push(head.material);

  const topFinMaterial = sharedMaterial.clone();
  const topFin = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.8, 16), topFinMaterial);
  topFin.position.set(0, 1.4, 0);
  topFin.rotation.set(Math.PI, 0, Math.PI / 2);
  group.add(topFin);
  materials.push(topFin.material);

  const sideFinMaterial = sharedMaterial.clone();
  const leftFin = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.8, 16), sideFinMaterial);
  leftFin.scale.set(1, 0.9, 0.6);
  leftFin.position.set(-0.2, -0.3, 0.9);
  leftFin.rotation.set(Math.PI / 2, 0, 0);
  group.add(leftFin);
  materials.push(leftFin.material);

  const rightFin = leftFin.clone();
  rightFin.position.z = -0.9;
  group.add(rightFin);
  materials.push(rightFin.material);

  const tailMaterial = sharedMaterial.clone();
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.7, 2, 16), tailMaterial);
  tail.position.set(-3.2, 0, 0);
  tail.rotation.set(Math.PI, 0, Math.PI / 2);
  group.add(tail);
  materials.push(tail.material);

  const panel = createWordPanel();
  group.add(panel);

  group.userData.materials = materials;
  group.userData.textPanel = panel;
  group.castShadow = true;

  return group;
};

const disposeObject = (object) => {
  if (object.userData && object.userData.textPanel && object.userData.textPanel.material) {
    const { textPanel } = object.userData;
    if (textPanel.material.map) {
      textPanel.material.map.dispose();
    }
    if (textPanel.material) {
      textPanel.material.dispose();
    }
    if (textPanel.geometry) {
      textPanel.geometry.dispose();
    }
  }
  object.traverse((child) => {
    if (child.isMesh) {
      child.geometry.dispose();
      if (Array.isArray(child.material)) {
        child.material.forEach((material) => material.dispose());
      } else if (child.material) {
        child.material.dispose();
      }
    }
    if (child.userData && child.userData.textPanel && child.userData.textPanel.material) {
      const { textPanel } = child.userData;
      if (textPanel.material.map) {
        textPanel.material.map.dispose();
      }
      if (textPanel.material) {
        textPanel.material.dispose();
      }
      if (textPanel.geometry) {
        textPanel.geometry.dispose();
      }
    }
  });
};

const createHunterMesh = () => {
  const group = new THREE.Group();

  const suitMaterial = new THREE.MeshStandardMaterial({
    color: 0x1d2f4f,
    roughness: 0.3,
    metalness: 0.15,
    emissive: 0x0d1a2d,
    emissiveIntensity: 0.3,
  });

  const helmetMaterial = new THREE.MeshStandardMaterial({
    color: 0xd7e8ff,
    roughness: 0.15,
    metalness: 0.6,
    emissive: 0x1c3454,
    emissiveIntensity: 0.45,
  });

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(1.4, 3.6, 14, 24), suitMaterial);
  body.position.y = 3.2;
  group.add(body);

  const helmet = new THREE.Mesh(new THREE.SphereGeometry(1.4, 24, 24), helmetMaterial);
  helmet.position.set(0, 5.4, 0);
  group.add(helmet);

  const visor = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 1.2, 24), helmetMaterial.clone());
  visor.position.set(0.9, 5.4, 0);
  visor.rotation.z = Math.PI / 2;
  visor.material.opacity = 0.75;
  visor.material.transparent = true;
  group.add(visor);

  const spear = new THREE.Group();
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 8, 12), new THREE.MeshStandardMaterial({ color: 0xc1c8cf }));
  shaft.rotation.z = Math.PI / 2;
  spear.add(shaft);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.4, 16), new THREE.MeshStandardMaterial({ color: 0xffd04f, metalness: 0.8, roughness: 0.2 }));
  tip.position.set(4.4, 0, 0);
  tip.rotation.z = Math.PI / 2;
  spear.add(tip);
  spear.position.set(-1.2, 3.6, 0);
  spear.rotation.set(0.1, 0, Math.PI / 6);
  group.add(spear);

  group.position.set(END_X - 6, 2.4, 0);
  group.scale.set(1.1, 1.1, 1.1);

  return group;
};

export default function OceanScene({ sharks, targetId }) {
  const mountRef = useRef(null);
  const sceneRef = useRef();
  const animationRef = useRef();
  const waterRef = useRef();
  const bubblesRef = useRef();
  const sharkMeshesRef = useRef(new Map());
  const hunterRef = useRef();
  const cameraRef = useRef();

  useEffect(() => {
    const mount = mountRef.current;
    const width = mount.clientWidth || window.innerWidth;
    const height = mount.clientHeight || window.innerHeight * 0.6;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#021026');
    scene.fog = new THREE.FogExp2('#021026', 0.032);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 200);
    camera.position.set(0, 8, 26);
    camera.lookAt(0, 5, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 3));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    mount.appendChild(renderer.domElement);

    const hemiLight = new THREE.HemisphereLight(0x6bd4ff, 0x032744, 0.6);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.85);
    dirLight.position.set(-30, 40, 30);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const waterGeometry = new THREE.PlaneGeometry(180, 180, 32, 32);
    const waterMaterial = new THREE.MeshPhongMaterial({
      color: 0x05395f,
      transparent: true,
      opacity: 0.82,
      shininess: 80,
    });
    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -4;
    scene.add(water);
    waterRef.current = water;

    const bubbleGroup = new THREE.Group();
    const bubbleGeometry = new THREE.SphereGeometry(0.25, 16, 16);
    const bubbleMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.18,
    });
    for (let i = 0; i < 24; i += 1) {
      const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial.clone());
      bubble.position.set((Math.random() - 0.5) * 60, Math.random() * 18 - 4, Math.random() * -40);
      bubbleGroup.add(bubble);
    }
    scene.add(bubbleGroup);
    bubblesRef.current = bubbleGroup;

    const hunter = createHunterMesh();
    scene.add(hunter);
    hunterRef.current = hunter;

    const clock = new THREE.Clock();
    const animate = () => {
      const elapsed = clock.getElapsedTime();
      if (waterRef.current) {
        waterRef.current.material.opacity = 0.78 + Math.sin(elapsed * 0.6) * 0.04;
      }
      if (bubblesRef.current) {
        bubblesRef.current.children.forEach((bubble, index) => {
          bubble.position.y += 0.03 + Math.sin(elapsed + index) * 0.002;
          if (bubble.position.y > 10) {
            bubble.position.y = -6;
          }
        });
      }
      if (hunterRef.current) {
        hunterRef.current.position.y = 2.4 + Math.sin(elapsed * 1.4) * 0.35;
        hunterRef.current.rotation.y = Math.sin(elapsed * 0.6) * 0.1;
      }
      renderer.render(scene, camera);
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      const newWidth = mount.clientWidth || window.innerWidth;
      const newHeight = mount.clientHeight || window.innerHeight * 0.6;
      renderer.setSize(newWidth, newHeight);
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', handleResize);
      scene.clear();
      bubbleGroup.children.forEach((bubble) => {
        if (bubble.material) bubble.material.dispose();
      });
      bubbleGeometry.dispose();
      if (water.geometry) water.geometry.dispose();
      if (water.material) water.material.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    const meshes = sharkMeshesRef.current;
    if (!scene) {
      return;
    }

    const existingIds = new Set(sharks.map((shark) => shark.id));
    meshes.forEach((mesh, id) => {
      if (!existingIds.has(id)) {
        scene.remove(mesh);
        disposeObject(mesh);
        meshes.delete(id);
      }
    });

    sharks.forEach((shark) => {
      let mesh = meshes.get(shark.id);
      if (!mesh) {
        mesh = createSharkMesh();
        meshes.set(shark.id, mesh);
        scene.add(mesh);
      }
      const ratio = shark.word.length ? shark.typed.length / shark.word.length : 0;
      mesh.userData.materials.forEach((material) => {
        material.color.setHSL(0.58 - ratio * 0.3, 0.85, 0.55 + ratio * 0.2);
        material.emissiveIntensity = targetId === shark.id ? 0.6 : 0.22;
      });
      const x = THREE.MathUtils.lerp(START_X, END_X, shark.progress);
      const verticalBob = Math.sin(shark.wobbleSeed + shark.progress * 5) * 0.6;
      mesh.position.set(x, shark.lane + verticalBob, Math.sin(shark.wobbleSeed) * 1.2);
      mesh.rotation.y = Math.PI;
      mesh.rotation.z = Math.sin(shark.wobbleSeed + shark.progress * 4) * 0.12;
      if (mesh.userData.textPanel) {
        updateWordPanel(mesh.userData.textPanel, shark, targetId === shark.id);
        const panel = mesh.userData.textPanel;
        panel.position.y = 0.2 + Math.cos(shark.wobbleSeed + shark.progress * 6) * 0.1;
        if (cameraRef.current) {
          panel.quaternion.copy(cameraRef.current.quaternion);
          panel.rotateY(Math.PI);
        }
      }
    });
  }, [sharks, targetId]);

  return <div ref={mountRef} className="relative z-0 flex-1" role="presentation" />;
}

OceanScene.propTypes = {
  sharks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      word: PropTypes.string.isRequired,
      typed: PropTypes.string.isRequired,
      lane: PropTypes.number.isRequired,
      wobbleSeed: PropTypes.number.isRequired,
      progress: PropTypes.number.isRequired,
    })
  ).isRequired,
  targetId: PropTypes.number,
};

OceanScene.defaultProps = {
  targetId: null,
};
