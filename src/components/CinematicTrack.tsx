"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass.js";

export type TrackIntensity = "full" | "quiet" | "stage";

type StageConfig = {
  cam: { x: number; y: number; z: number; fov: number };
  stageX: number;
  stageY: number;
  lookX: number;
  targetSize: number;
  fog: number;
  bloom: number;
  rim: number;
  kick: number;
  wire: number;
  dust: number;
  exposure: number;
};

const CONFIG: Record<TrackIntensity, StageConfig> = {
  // Hero: right-weighted, room to breathe for copy on the left
  full: {
    cam: { x: 0.85, y: 0.25, z: 5.4, fov: 44 },
    stageX: 1.55,
    stageY: -0.05,
    lookX: 1.3,
    targetSize: 2.65,
    fog: 0.018,
    bloom: 0.11,
    rim: 0.95,
    kick: 8,
    wire: 0.28,
    dust: 160,
    exposure: 1.05,
  },
  // Chapter overlays: softer, still readable under HUD
  quiet: {
    cam: { x: 0.15, y: 0.1, z: 4.2, fov: 36 },
    stageX: 0.2,
    stageY: -0.08,
    lookX: 0.15,
    targetSize: 2.35,
    fog: 0.02,
    bloom: 0.14,
    rim: 1.1,
    kick: 9,
    wire: 0.28,
    dust: 90,
    exposure: 1.12,
  },
  // Mega-split panels: centered, close, hard presence on dark field
  stage: {
    cam: { x: 0.05, y: 0.08, z: 3.7, fov: 34 },
    stageX: 0,
    stageY: -0.05,
    lookX: 0,
    targetSize: 2.7,
    fog: 0.01,
    bloom: 0.16,
    rim: 1.4,
    kick: 12,
    wire: 0.35,
    dust: 120,
    exposure: 1.18,
  },
};

/**
 * Studio 3D: PBR GLB + wireframe twin, soft bloom, contact depth.
 */
export function CinematicTrack({ intensity = "full" }: { intensity?: TrackIntensity }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const cfg = CONFIG[intensity];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = mount.clientWidth || window.innerWidth;
    let h = mount.clientHeight || window.innerHeight;
    let disposed = false;
    let visible = true;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, intensity === "full" ? 2 : 1.65));
    renderer.setSize(w, h, false);
    const clear =
      intensity === "full" ? 0xf3f3ee : 0x121410;
    renderer.setClearColor(clear, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = intensity === "full" ? cfg.exposure : 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.cssText =
      "position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:auto;touch-action:none;";
    mount.appendChild(renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    const scene = new THREE.Scene();
    scene.environment = envTex;
    scene.background = new THREE.Color(clear);
    scene.fog = new THREE.FogExp2(clear, intensity === "full" ? cfg.fog : cfg.fog * 0.65);

    const camera = new THREE.PerspectiveCamera(cfg.cam.fov, w / h, 0.1, 80);
    const camBase = { ...cfg.cam };
    camera.position.set(camBase.x, camBase.y, camBase.z);

    const root = new THREE.Group();
    scene.add(root);

    const stage = new THREE.Group();
    stage.position.set(cfg.stageX, cfg.stageY, 0);
    root.add(stage);

    scene.add(new THREE.AmbientLight(0xffffff, intensity === "full" ? 0.38 : 0.22));
    const key = new THREE.DirectionalLight(0xfff4ea, intensity === "stage" ? 2.8 : intensity === "quiet" ? 2.4 : 2.2);
    key.position.set(4.5, 7, 3.5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 24;
    key.shadow.camera.left = -6;
    key.shadow.camera.right = 6;
    key.shadow.camera.top = 6;
    key.shadow.camera.bottom = -6;
    key.shadow.bias = -0.0002;
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xb8c8d8, intensity === "full" ? 0.62 : 0.35);
    fill.position.set(-5, 2.2, 2.5);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0xc8ff00, intensity === "full" ? cfg.rim : cfg.rim * 1.35);
    rim.position.set(-2.5, 3, -5);
    scene.add(rim);

    const kick = new THREE.PointLight(0xc8ff00, intensity === "full" ? cfg.kick : cfg.kick * 1.4, 14, 2);
    kick.position.set(1.6, 1.4, 2.2);
    stage.add(kick);

    const materials: THREE.Material[] = [];
    const geometries: THREE.BufferGeometry[] = [];

    // Soft lit floor disc — darker on stage panels
    const pedGeo = new THREE.CircleGeometry(intensity === "stage" ? 2.1 : 2.0, 72);
    geometries.push(pedGeo);
    const pedMat = new THREE.MeshPhysicalMaterial({
      color: intensity === "full" ? 0xffffff : 0x2a2e28,
      metalness: intensity === "full" ? 0.28 : 0.75,
      roughness: intensity === "full" ? 0.42 : 0.28,
      envMapIntensity: intensity === "full" ? 0.7 : 1.1,
      transparent: true,
      opacity: 0.97,
    });
    materials.push(pedMat);
    const ped = new THREE.Mesh(pedGeo, pedMat);
    ped.rotation.x = -Math.PI / 2;
    ped.position.y = -1.15;
    ped.receiveShadow = true;
    stage.add(ped);

    // Contact shadow blob under prop
    const shadowGeo = new THREE.CircleGeometry(1.05, 48);
    geometries.push(shadowGeo);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: intensity === "full" ? 0.14 : 0.45,
      depthWrite: false,
    });
    materials.push(shadowMat);
    const contact = new THREE.Mesh(shadowGeo, shadowMat);
    contact.rotation.x = -Math.PI / 2;
    contact.position.y = -1.145;
    contact.scale.set(1.35, 0.7, 1);
    stage.add(contact);

    // Neon ground ring
    const ringGeo = new THREE.TorusGeometry(intensity === "stage" ? 1.55 : 1.55, 0.014, 14, 120);
    geometries.push(ringGeo);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xc8ff00,
      emissive: 0xc8ff00,
      emissiveIntensity: intensity === "stage" ? 0.7 : 0.5,
      metalness: 0.35,
      roughness: 0.35,
    });
    materials.push(ringMat);
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -1.12;
    stage.add(ring);

    // Outer thin black ring for depth edge
    const outerGeo = new THREE.TorusGeometry(intensity === "stage" ? 1.85 : 1.9, 0.006, 10, 96);
    geometries.push(outerGeo);
    const outerMat = new THREE.MeshBasicMaterial({
      color: 0x0a0a0a,
      transparent: true,
      opacity: 0.18,
    });
    materials.push(outerMat);
    const outer = new THREE.Mesh(outerGeo, outerMat);
    outer.rotation.x = -Math.PI / 2;
    outer.position.y = -1.118;
    stage.add(outer);

    const prop = new THREE.Group();
    stage.add(prop);

    let wireTwin: THREE.Group | null = null;
    let modelReady = false;

    const loader = new GLTFLoader();
    loader.load(
      "/models/helmet.glb",
      (gltf) => {
        if (disposed) return;

        const solid = gltf.scene;
        solid.traverse((obj) => {
          const mesh = obj as THREE.Mesh;
          if (!mesh.isMesh) return;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((m) => {
            const std = m as THREE.MeshStandardMaterial;
            if (std.envMapIntensity !== undefined) std.envMapIntensity = 1.35;
            if (std.roughness !== undefined) std.roughness = Math.min(std.roughness ?? 0.5, 0.5);
            if (std.metalness !== undefined) std.metalness = Math.max(std.metalness ?? 0.2, 0.25);
          });
        });

        const box = new THREE.Box3().setFromObject(solid);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const s = cfg.targetSize / maxDim;
        solid.scale.setScalar(s);
        box.setFromObject(solid);
        const center = box.getCenter(new THREE.Vector3());
        solid.position.sub(center);
        solid.position.y += 0.18;
        solid.rotation.y = Math.PI * 0.18;
        prop.add(solid);

        wireTwin = solid.clone(true);
        wireTwin.traverse((obj) => {
          const mesh = obj as THREE.Mesh;
          if (!mesh.isMesh) return;
          mesh.castShadow = false;
          mesh.material = new THREE.MeshBasicMaterial({
            color: intensity === "full" ? 0x0a0a0a : 0xc8ff00,
            wireframe: true,
            transparent: true,
            opacity: intensity === "full" ? cfg.wire : Math.min(0.45, cfg.wire + 0.12),
            depthWrite: false,
          });
          materials.push(mesh.material as THREE.Material);
        });
        wireTwin.scale.multiplyScalar(1.038);
        prop.add(wireTwin);

        modelReady = true;
      },
      undefined,
      () => {
        if (disposed) return;
        const geo = new THREE.IcosahedronGeometry(1.15, 2);
        geometries.push(geo);
        const mat = new THREE.MeshPhysicalMaterial({
          color: 0xe8e4dc,
          metalness: 1,
          roughness: 0.12,
          clearcoat: 1,
          envMapIntensity: 1.5,
        });
        materials.push(mat);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = true;
        prop.add(mesh);
        const wMesh = new THREE.Mesh(
          geo,
          new THREE.MeshBasicMaterial({
            color: 0x0a0a0a,
            wireframe: true,
            transparent: true,
            opacity: 0.35,
          })
        );
        materials.push(wMesh.material as THREE.Material);
        wMesh.scale.setScalar(1.04);
        prop.add(wMesh);
        modelReady = true;
      }
    );

    const count = cfg.dust;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 9;
      positions[i * 3 + 1] = (Math.random() - 0.35) * 4.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 7;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometries.push(pGeo);
    const pMat = new THREE.PointsMaterial({
      color: 0x6b8600,
      size: 0.018,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
      sizeAttenuation: true,
    });
    materials.push(pMat);
    const points = new THREE.Points(pGeo, pMat);
    root.add(points);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(w, h), cfg.bloom, 0.32, 0.88);
    composer.addPass(bloom);
    composer.addPass(new SMAAPass());
    composer.addPass(new OutputPass());

    let raf = 0;
    let running = true;
    const clock = new THREE.Clock();
    let targetParallaxX = 0;
    let targetParallaxY = 0;
    let parallaxX = 0;
    let parallaxY = 0;
    let scrollT = 0;
    let targetScrollT = 0;
    let orbitX = 0;
    let orbitY = 0;
    let targetOrbitX = intensity === "stage" ? 0.55 : 0.35;
    let targetOrbitY = intensity === "stage" ? -0.12 : -0.08;
    let dragging = false;
    let lastPtrX = 0;
    let lastPtrY = 0;

    const look = new THREE.Vector3(cfg.lookX, 0.05, 0);
    const canvas = renderer.domElement;

    const onPointer = (e: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
      const ny = ((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1;
      const amp = intensity === "full" ? 0.7 : intensity === "stage" ? 0.55 : 0.35;
      targetParallaxX = nx * amp;
      targetParallaxY = ny * amp * 0.55;
    };

    const onPointerDown = (e: PointerEvent) => {
      if (reduced) return;
      dragging = true;
      lastPtrX = e.clientX;
      lastPtrY = e.clientY;
      canvas.classList.add("is-dragging");
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      dragging = false;
      canvas.classList.remove("is-dragging");
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    };

    const onPointerDrag = (e: PointerEvent) => {
      onPointer(e);
      if (!dragging) return;
      const dx = (e.clientX - lastPtrX) / Math.max(1, window.innerWidth);
      const dy = (e.clientY - lastPtrY) / Math.max(1, window.innerHeight);
      lastPtrX = e.clientX;
      lastPtrY = e.clientY;
      targetOrbitX = Math.max(-1.6, Math.min(1.8, targetOrbitX + dx * 3.8));
      targetOrbitY = Math.max(-0.75, Math.min(0.75, targetOrbitY + dy * 2.2));
    };

    const onScroll = () => {
      if (intensity !== "full") {
        targetScrollT = 0;
        return;
      }
      targetScrollT = Math.min(1, window.scrollY / Math.min(window.innerHeight * 1.5, 860));
    };

    const onResize = () => {
      w = mount.clientWidth || window.innerWidth;
      h = mount.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      composer.setSize(w, h);
      bloom.setSize(w, h);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting && entry.intersectionRatio > 0.05;
      },
      { threshold: [0, 0.05, 0.2] }
    );
    io.observe(mount);

    canvas.addEventListener("pointermove", onPointerDrag, { passive: true });
    canvas.addEventListener("pointerdown", onPointerDown, { passive: true });
    canvas.addEventListener("pointerup", onPointerUp, { passive: true });
    canvas.addEventListener("pointercancel", onPointerUp, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    onScroll();

    const paintFrame = (t: number, animate: boolean) => {
      parallaxX += (targetParallaxX - parallaxX) * (animate ? 0.1 : 1);
      parallaxY += (targetParallaxY - parallaxY) * (animate ? 0.1 : 1);
      orbitX += (targetOrbitX - orbitX) * (animate ? 0.11 : 1);
      orbitY += (targetOrbitY - orbitY) * (animate ? 0.11 : 1);
      scrollT += (targetScrollT - scrollT) * (animate ? 0.08 : 1);

      prop.rotation.y = orbitX + (animate ? t * (intensity === "stage" ? 0.12 : 0.08) : 0);
      prop.rotation.x = orbitY * 0.65;
      prop.position.y = Math.sin(animate ? t * 0.9 : 0.4) * 0.055;

      if (wireTwin) {
        wireTwin.rotation.y = Math.sin(animate ? t * 0.4 : 0) * 0.05;
      }

      camera.position.x = camBase.x + parallaxX * 0.5 + orbitX * 0.1;
      camera.position.y = camBase.y + parallaxY * 0.32 + scrollT * 0.2;
      camera.position.z = camBase.z - scrollT * 1.4;
      look.set(cfg.lookX + parallaxX * 0.15, 0.05 + parallaxY * 0.12, 0);
      camera.lookAt(look);

      stage.position.x = cfg.stageX + parallaxX * 0.06;
      points.rotation.y = animate ? t * 0.018 : 0;
      kick.intensity = cfg.kick + Math.sin(animate ? t : 0) * 1.8;
      ring.rotation.z = animate ? t * 0.18 : 0;
      contact.scale.set(1.35 + Math.sin(animate ? t * 0.9 : 0) * 0.04, 0.7, 1);

      bloom.strength = modelReady ? cfg.bloom : 0.03;
      composer.render();
    };

    if (reduced) {
      const freeze = window.setTimeout(() => paintFrame(1, false), 400);
      return () => {
        disposed = true;
        window.clearTimeout(freeze);
        cleanup();
      };
    }

    const tick = () => {
      if (!running) return;
      if (visible) {
        paintFrame(clock.getElapsedTime(), true);
      }
      raf = requestAnimationFrame(tick);
    };
    tick();

    function cleanup() {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      canvas.removeEventListener("pointermove", onPointerDrag);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.isMesh) {
          mesh.geometry?.dispose();
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((m) => m?.dispose?.());
        }
      });
      envTex.dispose();
      pmrem.dispose();
      composer.dispose();
      renderer.dispose();
      const el = mountRef.current;
      if (el && renderer.domElement.parentElement === el) {
        el.removeChild(renderer.domElement);
      }
    }

    return () => {
      disposed = true;
      cleanup();
    };
  }, [intensity]);

  return (
    <div
      ref={mountRef}
      className={`cinematic-canvas cinematic-canvas-${intensity}`}
      aria-hidden="true"
    />
  );
}
