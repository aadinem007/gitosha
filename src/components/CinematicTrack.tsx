"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/**
 * Real PBR hero prop — DamagedHelmet GLB, dark studio, NO bloom (bloom was the white blob).
 */
export function CinematicTrack({ intensity = "full" }: { intensity?: "full" | "quiet" | "stage" }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hero = intensity === "full";
    let w = mount.clientWidth || window.innerWidth;
    let h = mount.clientHeight || window.innerHeight;
    let disposed = false;
    let visible = true;
    let raf = 0;
    let running = true;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h, false);
    // Dark charcoal — metal reads; never wash to white
    const bg = 0x0e100c;
    renderer.setClearColor(bg, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.cssText =
      "position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:auto;touch-action:none;cursor:grab;";
    mount.appendChild(renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    const scene = new THREE.Scene();
    scene.environment = envTex;
    scene.background = new THREE.Color(bg);
    scene.fog = new THREE.FogExp2(bg, 0.028);

    const camera = new THREE.PerspectiveCamera(hero ? 42 : 38, w / h, 0.1, 60);
    const camBase = hero
      ? { x: 0.9, y: 0.2, z: 5.2 }
      : { x: 0.05, y: 0.1, z: 4.0 };
    camera.position.set(camBase.x, camBase.y, camBase.z);

    const root = new THREE.Group();
    scene.add(root);
    const stage = new THREE.Group();
    stage.position.set(hero ? 1.45 : 0, -0.05, 0);
    root.add(stage);

    // Soft studio lights — no neon blowout
    scene.add(new THREE.AmbientLight(0xb8c0b0, 0.28));
    const key = new THREE.DirectionalLight(0xfff2e0, 2.2);
    key.position.set(5, 7, 4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 28;
    key.shadow.camera.left = -7;
    key.shadow.camera.right = 7;
    key.shadow.camera.top = 7;
    key.shadow.camera.bottom = -7;
    key.shadow.bias = -0.00025;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x8aa0b8, 0.55);
    fill.position.set(-5, 2, 2);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xc8ff00, 0.55);
    rim.position.set(-2, 3, -6);
    scene.add(rim);

    const materials: THREE.Material[] = [];
    const geometries: THREE.BufferGeometry[] = [];

    // Dark metal ground disc
    const pedGeo = new THREE.CircleGeometry(2.2, 64);
    geometries.push(pedGeo);
    const pedMat = new THREE.MeshStandardMaterial({
      color: 0x1a1e18,
      metalness: 0.85,
      roughness: 0.35,
      envMapIntensity: 0.9,
    });
    materials.push(pedMat);
    const ped = new THREE.Mesh(pedGeo, pedMat);
    ped.rotation.x = -Math.PI / 2;
    ped.position.y = -1.2;
    ped.receiveShadow = true;
    stage.add(ped);

    const ringGeo = new THREE.TorusGeometry(1.55, 0.012, 12, 96);
    geometries.push(ringGeo);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xc8ff00,
      emissive: 0xc8ff00,
      emissiveIntensity: 0.35,
      metalness: 0.4,
      roughness: 0.4,
    });
    materials.push(ringMat);
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -1.17;
    stage.add(ring);

    const prop = new THREE.Group();
    stage.add(prop);

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
            if (std.envMapIntensity !== undefined) std.envMapIntensity = 1.15;
            // Keep PBR maps — do not force bright emissive
            if (std.emissiveIntensity !== undefined) {
              std.emissiveIntensity = Math.min(std.emissiveIntensity ?? 0, 0.35);
            }
          });
        });

        const box = new THREE.Box3().setFromObject(solid);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const target = hero ? 2.7 : 2.4;
        solid.scale.setScalar(target / maxDim);
        box.setFromObject(solid);
        solid.position.sub(box.getCenter(new THREE.Vector3()));
        solid.position.y += 0.2;
        solid.rotation.y = Math.PI * 0.18;
        prop.add(solid);
        modelReady = true;
      },
      undefined,
      () => {
        if (disposed) return;
        // Fallback: chrome icosa — still readable on dark
        const geo = new THREE.IcosahedronGeometry(1.2, 2);
        geometries.push(geo);
        const mat = new THREE.MeshPhysicalMaterial({
          color: 0xc8c4bc,
          metalness: 1,
          roughness: 0.18,
          clearcoat: 0.8,
          envMapIntensity: 1.3,
        });
        materials.push(mat);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = true;
        prop.add(mesh);
        modelReady = true;
      }
    );

    const canvas = renderer.domElement;
    let orbitX = 0.4;
    let orbitY = -0.1;
    let targetOrbitX = 0.4;
    let targetOrbitY = -0.1;
    let dragging = false;
    let lastPtrX = 0;
    let lastPtrY = 0;
    let parallaxX = 0;
    let parallaxY = 0;
    let targetParallaxX = 0;
    let targetParallaxY = 0;
    const look = new THREE.Vector3(hero ? 1.2 : 0, 0.05, 0);
    const clock = new THREE.Clock();

    const onPointer = (e: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      targetParallaxX = (((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1) * 0.5;
      targetParallaxY = (((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1) * 0.3;
    };

    const onDown = (e: PointerEvent) => {
      if (reduced) return;
      dragging = true;
      lastPtrX = e.clientX;
      lastPtrY = e.clientY;
      canvas.style.cursor = "grabbing";
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    };

    const onUp = (e: PointerEvent) => {
      dragging = false;
      canvas.style.cursor = "grab";
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    };

    const onDrag = (e: PointerEvent) => {
      onPointer(e);
      if (!dragging) return;
      targetOrbitX = Math.max(
        -1.8,
        Math.min(2, targetOrbitX + ((e.clientX - lastPtrX) / window.innerWidth) * 4)
      );
      targetOrbitY = Math.max(
        -0.7,
        Math.min(0.7, targetOrbitY + ((e.clientY - lastPtrY) / window.innerHeight) * 2.4)
      );
      lastPtrX = e.clientX;
      lastPtrY = e.clientY;
    };

    const onResize = () => {
      w = mount.clientWidth || window.innerWidth;
      h = mount.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting && entry.intersectionRatio > 0.04;
      },
      { threshold: [0, 0.04, 0.2] }
    );
    io.observe(mount);

    canvas.addEventListener("pointermove", onDrag, { passive: true });
    canvas.addEventListener("pointerdown", onDown, { passive: true });
    canvas.addEventListener("pointerup", onUp, { passive: true });
    canvas.addEventListener("pointercancel", onUp, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("resize", onResize);

    const paint = (t: number, animate: boolean) => {
      parallaxX += (targetParallaxX - parallaxX) * (animate ? 0.08 : 1);
      parallaxY += (targetParallaxY - parallaxY) * (animate ? 0.08 : 1);
      orbitX += (targetOrbitX - orbitX) * (animate ? 0.1 : 1);
      orbitY += (targetOrbitY - orbitY) * (animate ? 0.1 : 1);

      prop.rotation.y = orbitX + (animate && modelReady ? t * 0.12 : 0);
      prop.rotation.x = orbitY * 0.6;
      prop.position.y = Math.sin(animate ? t * 0.8 : 0) * 0.04;
      ring.rotation.z = animate ? t * 0.12 : 0;

      camera.position.x = camBase.x + parallaxX * 0.45 + orbitX * 0.08;
      camera.position.y = camBase.y + parallaxY * 0.3;
      camera.position.z = camBase.z;
      look.set((hero ? 1.2 : 0) + parallaxX * 0.1, 0.05, 0);
      camera.lookAt(look);

      renderer.render(scene, camera);
    };

    if (reduced) {
      const freeze = window.setTimeout(() => paint(1, false), 500);
      return () => {
        disposed = true;
        window.clearTimeout(freeze);
        cleanup();
      };
    }

    const tick = () => {
      if (!running) return;
      if (visible) paint(clock.getElapsedTime(), true);
      raf = requestAnimationFrame(tick);
    };
    tick();

    function cleanup() {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      canvas.removeEventListener("pointermove", onDrag);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      window.removeEventListener("pointermove", onPointer);
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
      renderer.dispose();
      if (mountRef.current && renderer.domElement.parentElement === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    }

    return () => {
      disposed = true;
      cleanup();
    };
  }, [intensity]);

  return <div ref={mountRef} className="cinematic-canvas" aria-hidden="true" />;
}
