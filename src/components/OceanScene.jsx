import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import * as THREE from 'three';

const FAR_Z = -90;
const NEAR_Z = 10;

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

  group.userData.materials = materials;
  group.castShadow = true;

  return group;
};

const disposeObject = (object) => {
  object.traverse((child) => {
    if (child.isMesh) {
      child.geometry.dispose();
      if (Array.isArray(child.material)) {
        child.material.forEach((material) => material.dispose());
      } else if (child.material) {
        child.material.dispose();
      }
    }
  });
};

export default function OceanScene({ sharks, targetId }) {
  const mountRef = useRef(null);
  const sceneRef = useRef();
  const animationRef = useRef();
  const waterRef = useRef();
  const bubblesRef = useRef();
  const sharkMeshesRef = useRef(new Map());

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

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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
      const z = THREE.MathUtils.lerp(FAR_Z, NEAR_Z, shark.progress);
      const sway = Math.sin(shark.wobbleSeed + shark.progress * 6) * 2.2;
      mesh.position.set(shark.lane + sway * 0.15, 2.6 + Math.sin(shark.wobbleSeed + shark.progress * 5) * 0.7, z);
      mesh.rotation.y = Math.PI;
      mesh.rotation.z = Math.sin(shark.wobbleSeed + shark.progress * 4) * 0.15;
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
