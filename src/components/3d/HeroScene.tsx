// ─────────────────────────────────────────────────────────────────────────────
// src/components/3d/HeroScene.tsx
// High-Tech Three.js WebGL interactive hero — Futuristic Cyber-Vehicle + Dual Energy Airflow + Hologram Grid
// React Island: client:only="react"
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function HeroScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const el = mountRef.current;

    // ── Scene & Camera ──────────────────────────────────────────────────────
    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(50, el.clientWidth / el.clientHeight, 0.1, 1000);
    camera.position.set(0, 1.4, 5.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    // ── Color Theme ────────────────────────────────────────────────────────
    const CYAN    = new THREE.Color('#00F0FF');
    const EMERALD = new THREE.Color('#10B981');
    const CRIMSON = new THREE.Color('#FF2E4D');
    const ELECTRIC_BLUE = new THREE.Color('#38BDF8');

    // ── Ambient Grid Floor (Cyber Horizon) ──────────────────────────────────
    const gridHelper = new THREE.GridHelper(36, 36, 0x00F0FF, 0x1E293B);
    gridHelper.position.y = -1.6;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.22;
    scene.add(gridHelper);

    // ── Vehicle Group ──────────────────────────────────────────────────────
    const vehicleGroup = new THREE.Group();
    scene.add(vehicleGroup);

    function createLine(pts: number[][], color: THREE.Color, opacity = 0.95) {
      const geom = new THREE.BufferGeometry().setFromPoints(
        pts.map(([x, y, z]) => new THREE.Vector3(x, y, z))
      );
      const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
      return new THREE.Line(geom, mat);
    }

    // ── Sleek Aerodynamic EV/Sports Silhouette ──────────────────────────────
    // Right side profile coordinates
    const profileR: number[][] = [
      [-2.4, -0.4, 0.95], [-2.35, -0.1, 0.95], [-1.8, 0.25, 0.95], [-1.2, 0.65, 0.92],
      [-0.4, 0.95, 0.88], [0.8, 0.95, 0.88], [1.7, 0.65, 0.92], [2.3, 0.35, 0.95],
      [2.45, -0.4, 0.95], [-2.4, -0.4, 0.95]
    ];
    // Left side profile
    const profileL = profileR.map(([x, y]) => [x, y, -0.95]);

    vehicleGroup.add(createLine(profileR, CYAN, 0.9));
    vehicleGroup.add(createLine(profileL, CYAN, 0.9));

    // Waistline / Shoulder contour
    const shoulderR: number[][] = [
      [-2.35, -0.1, 0.95], [-1.2, 0.15, 0.98], [0.8, 0.15, 0.98], [2.3, 0.1, 0.95]
    ];
    const shoulderL = shoulderR.map(([x, y]) => [x, y, -0.98]);
    vehicleGroup.add(createLine(shoulderR, ELECTRIC_BLUE, 0.8));
    vehicleGroup.add(createLine(shoulderL, ELECTRIC_BLUE, 0.8));

    // Windshield & Roof cross arches
    const roofBars: number[][][] = [
      [[-1.2, 0.65, 0.92], [-1.2, 0.65, -0.92]], // Front pillar
      [[-0.4, 0.95, 0.88], [-0.4, 0.95, -0.88]], // B-pillar front
      [[0.8, 0.95, 0.88], [0.8, 0.95, -0.88]],   // B-pillar rear
      [[1.7, 0.65, 0.92], [1.7, 0.65, -0.92]],   // Rear windshield
    ];
    roofBars.forEach(bar => vehicleGroup.add(createLine(bar, CYAN, 0.75)));

    // Hood & Rear Deck Crossbars
    const crossBars: number[][][] = [
      [[-2.4, -0.4, 0.95], [-2.4, -0.4, -0.95]], // Front splitter
      [[-1.8, 0.25, 0.95], [-1.8, 0.25, -0.95]], // Hood crease
      [[2.3, 0.35, 0.95], [2.3, 0.35, -0.95]],   // Trunk lip
      [[2.45, -0.4, 0.95], [2.45, -0.4, -0.95]]  // Rear diffuser
    ];
    crossBars.forEach(bar => vehicleGroup.add(createLine(bar, EMERALD, 0.85)));

    // ── Glowing Cyber Wheels with Spin Effect ───────────────────────────────
    const wheelMeshes: THREE.Group[] = [];

    function buildCyberWheel(x: number, y: number, z: number) {
      const wheelGroup = new THREE.Group();
      wheelGroup.position.set(x, y, z);

      // Outer rim
      const rimGeom = new THREE.RingGeometry(0.32, 0.44, 32);
      const rimMat  = new THREE.MeshBasicMaterial({ color: CYAN, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
      const rim = new THREE.Mesh(rimGeom, rimMat);
      wheelGroup.add(rim);

      // Inner glowing spokes
      for (let i = 0; i < 5; i++) {
        const spokeGeom = new THREE.PlaneGeometry(0.04, 0.35);
        const spokeMat = new THREE.MeshBasicMaterial({ color: EMERALD, side: THREE.DoubleSide });
        const spoke = new THREE.Mesh(spokeGeom, spokeMat);
        spoke.rotation.z = (i / 5) * Math.PI * 2;
        spoke.position.z = 0.01;
        wheelGroup.add(spoke);
      }

      vehicleGroup.add(wheelGroup);
      wheelMeshes.push(wheelGroup);
    }

    buildCyberWheel(-1.5, -0.42, 0.96);  // Front Right
    buildCyberWheel(1.5, -0.42, 0.96);   // Rear Right
    buildCyberWheel(-1.5, -0.42, -0.96); // Front Left
    buildCyberWheel(1.5, -0.42, -0.96);  // Rear Left

    // ── Headlights (Laser Cyan) & Taillights (Crimson Red) ──────────────────
    const hlGeom = new THREE.RingGeometry(0.04, 0.12, 16);
    const hlMat  = new THREE.MeshBasicMaterial({ color: CYAN, side: THREE.DoubleSide });
    const hlR = new THREE.Mesh(hlGeom, hlMat);
    hlR.position.set(-2.4, -0.05, 0.65);
    hlR.rotation.y = Math.PI / 2;
    const hlL = new THREE.Mesh(hlGeom, hlMat);
    hlL.position.set(-2.4, -0.05, -0.65);
    hlL.rotation.y = Math.PI / 2;
    vehicleGroup.add(hlR, hlL);

    const tlGeom = new THREE.PlaneGeometry(0.04, 1.4);
    const tlMat  = new THREE.MeshBasicMaterial({ color: CRIMSON, side: THREE.DoubleSide });
    const lightBar = new THREE.Mesh(tlGeom, tlMat);
    lightBar.position.set(2.44, 0.15, 0);
    lightBar.rotation.y = Math.PI / 2;
    lightBar.rotation.z = Math.PI / 2;
    vehicleGroup.add(lightBar);

    vehicleGroup.position.y = -0.1;

    // ── Dual Energy Particle Windtunnel (Cyan Electric + Emerald Fuel) ───────
    const PARTICLE_COUNT = 700;
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const vel = new Float32Array(PARTICLE_COUNT);
    const col = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      resetStreamParticle(i);
      pos[i * 3] = (Math.random() - 0.5) * 16; // Randomize along X
    }

    function resetStreamParticle(i: number) {
      const radius = 0.4 + Math.random() * 2.2;
      const angle = Math.random() * Math.PI * 2;
      pos[i * 3]     = 9 + Math.random() * 3; // Flowing from front (right) to back (left)
      pos[i * 3 + 1] = Math.sin(angle) * radius + 0.1;
      pos[i * 3 + 2] = Math.cos(angle) * radius;
      vel[i]         = 0.22 + Math.random() * 0.28; // Faster dynamic particle speed

      const isCyan = Math.random() > 0.45;
      const c = isCyan ? CYAN : EMERALD;
      col[i * 3]     = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }

    const pGeom = new THREE.BufferGeometry();
    pGeom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    pGeom.setAttribute('color', new THREE.BufferAttribute(col, 3));

    const pMat = new THREE.PointsMaterial({
      size: 0.055,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true
    });
    const particles = new THREE.Points(pGeom, pMat);
    scene.add(particles);

    // ── Holographic Ground Pulse Ring ───────────────────────────────────────
    const ringGeom = new THREE.RingGeometry(2.8, 2.85, 64);
    const ringMat  = new THREE.MeshBasicMaterial({ color: CYAN, side: THREE.DoubleSide, transparent: true, opacity: 0.25 });
    const pulseRing = new THREE.Mesh(ringGeom, ringMat);
    pulseRing.rotation.x = -Math.PI / 2;
    pulseRing.position.y = -1.58;
    scene.add(pulseRing);

    // ── Mouse Interactivity ─────────────────────────────────────────────────
    let mouseX = 0, mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseY = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // ── Animation Loop ──────────────────────────────────────────────────────
    let animId: number;
    let clock = 0;

    function animate() {
      animId = requestAnimationFrame(animate);
      clock += 0.025; // Faster fluid motion

      // Vehicle hover & responsive tilt
      vehicleGroup.rotation.y = THREE.MathUtils.lerp(vehicleGroup.rotation.y, (mouseX * 0.55) - 0.2 + Math.sin(clock * 1.2) * 0.06, 0.12);
      vehicleGroup.rotation.x = THREE.MathUtils.lerp(vehicleGroup.rotation.x, (mouseY * 0.2) + Math.cos(clock * 1.0) * 0.04, 0.12);
      vehicleGroup.position.y = -0.1 + Math.sin(clock * 1.8) * 0.08;

      // Spin Wheels faster
      wheelMeshes.forEach(w => {
        w.rotation.z -= 0.12;
      });

      // Stream particles forward
      const positions = pGeom.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        positions.array[i * 3] -= vel[i];
        if ((positions.array[i * 3] as number) < -9) {
          resetStreamParticle(i);
        }
      }
      positions.needsUpdate = true;

      // Pulse ring expansion
      pulseRing.scale.setScalar(1 + Math.sin(clock * 2.2) * 0.08);
      pulseRing.rotation.z += 0.005;

      renderer.render(scene, camera);
    }
    animate();

    // ── Resize ──────────────────────────────────────────────────────────────
    const handleResize = () => {
      if (!el) return;
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
      aria-hidden="true"
    />
  );
}

