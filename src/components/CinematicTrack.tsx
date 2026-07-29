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

type Intensity = "full" | "quiet";

/**
 * Lando-style hero: real PBR GLB + wireframe twin, studio lights, right-weighted.
 * No placeholder cubes. Soft bloom only.
 */
export function CinematicTrack({ intensity = "full" }: { intensity?: Intensity }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const quiet = intensity === "quiet";
    let w = mount.clientWidth || window.innerWidth;
    let h = mount.clientHeight || window.innerHeight;
    let disposed = false;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, quiet ? 1.5 : 2));
    renderer.setSize(w, h, false);
    renderer.setClearColor(0x080808, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.domElement.style.cssText =
      "position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:auto;touch-action:none;";
    mount.appendChild(renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    const scene = new THREE.Scene();
    scene.environment = envTex;
    scene.background = new THREE.Color(0x080808);
    scene.fog = new THREE.FogExp2(0x080808, quiet ? 0.055 : 0.032);

    const camera = new THREE.PerspectiveCamera(quiet ? 40 : 44, w / h, 0.1, 80);
    // Bias camera so the model sits in the right half (copy stays left)
    const camBase = {
      x: quiet ? 0.35 : 0.85,
      y: quiet ? 0.15 : 0.25,
      z: quiet ? 4.6 : 5.4,
    };
    camera.position.set(camBase.x, camBase.y, camBase.z);

    const root = new THREE.Group();
    scene.add(root);

    const stage = new THREE.Group();
    // Push prop into the right side of frame
    stage.position.set(quiet ? 0.9 : 1.55, quiet ? -0.15 : -0.05, 0);
    root.add(stage);

    scene.add(new THREE.AmbientLight(0xffffff, 0.45));
    const key = new THREE.DirectionalLight(0xfff4ea, quiet ? 1.6 : 2.4);
    key.position.set(5, 6, 4);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xa8bdd0, 0.55);
    fill.position.set(-4, 2, 3);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xff5a1f, quiet ? 0.7 : 1.35);
    rim.position.set(-3, 2.5, -5);
    scene.add(rim);
    const kick = new THREE.PointLight(0xff5a1f, quiet ? 8 : 16, 12, 2);
    kick.position.set(2.2, 1.2, 2);
    stage.add(kick);

    const materials: THREE.Material[] = [];
    const geometries: THREE.BufferGeometry[] = [];

    // Soft pedestal
    const pedGeo = new THREE.CircleGeometry(quiet ? 1.8 : 2.35, 64);
    geometries.push(pedGeo);
    const ped = new THREE.Mesh(
      pedGeo,
      new THREE.MeshPhysicalMaterial({
        color: 0x0c0c0c,
        metalness: 0.95,
        roughness: 0.28,
        envMapIntensity: 0.85,
        transparent: true,
        opacity: 0.9,
      })
    );
    materials.push(ped.material as THREE.Material);
    ped.rotation.x = -Math.PI / 2;
    ped.position.y = -1.15;
    stage.add(ped);

    // Thin papaya ring under the prop
    const ringGeo = new THREE.TorusGeometry(quiet ? 1.35 : 1.7, 0.012, 12, 96);
    geometries.push(ringGeo);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xff5a1f,
      emissive: 0xff5a1f,
      emissiveIntensity: quiet ? 0.55 : 0.95,
      metalness: 0.5,
      roughness: 0.35,
    });
    materials.push(ringMat);
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -1.12;
    stage.add(ring);

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
          mesh.castShadow = false;
          mesh.receiveShadow = false;
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((m) => {
            const std = m as THREE.MeshStandardMaterial;
            if (std.envMapIntensity !== undefined) std.envMapIntensity = 1.25;
            if (std.roughness !== undefined) std.roughness = Math.min(std.roughness ?? 0.5, 0.55);
          });
        });

        // Fit + face camera
        const box = new THREE.Box3().setFromObject(solid);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const target = quiet ? 2.1 : 2.65;
        const s = target / maxDim;
        solid.scale.setScalar(s);
        box.setFromObject(solid);
        const center = box.getCenter(new THREE.Vector3());
        solid.position.sub(center);
        solid.position.y += 0.15;
        solid.rotation.y = Math.PI * 0.15;
        prop.add(solid);

        // Wireframe twin (Lando helmet overlay energy)
        wireTwin = solid.clone(true);
        wireTwin.traverse((obj) => {
          const mesh = obj as THREE.Mesh;
          if (!mesh.isMesh) return;
          mesh.material = new THREE.MeshBasicMaterial({
            color: 0xf5f2eb,
            wireframe: true,
            transparent: true,
            opacity: quiet ? 0.22 : 0.32,
            depthWrite: false,
          });
          materials.push(mesh.material as THREE.Material);
        });
        wireTwin.scale.multiplyScalar(1.035);
        prop.add(wireTwin);

        modelReady = true;
      },
      undefined,
      () => {
        // Fallback: polished chrome icosa if GLB fails
        if (disposed) return;
        const geo = new THREE.IcosahedronGeometry(1.15, 2);
        geometries.push(geo);
        const mat = new THREE.MeshPhysicalMaterial({
          color: 0xe8e4dc,
          metalness: 1,
          roughness: 0.15,
          clearcoat: 1,
          envMapIntensity: 1.4,
        });
        materials.push(mat);
        const mesh = new THREE.Mesh(geo, mat);
        prop.add(mesh);
        const wMesh = new THREE.Mesh(
          geo,
          new THREE.MeshBasicMaterial({
            color: 0xff5a1f,
            wireframe: true,
            transparent: true,
            opacity: 0.45,
          })
        );
        materials.push(wMesh.material as THREE.Material);
        wMesh.scale.setScalar(1.04);
        prop.add(wMesh);
        modelReady = true;
      }
    );

    // Sparse dust only — no cubes
    const count = quiet ? 80 : 160;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.35) * 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometries.push(pGeo);
    const pMat = new THREE.PointsMaterial({
      color: 0xffdcc8,
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
    // Soft bloom — never nuke the PBR textures
    const bloom = new UnrealBloomPass(new THREE.Vector2(w, h), quiet ? 0.18 : 0.28, 0.4, 0.85);
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
    let targetOrbitX = 0.35;
    let targetOrbitY = -0.08;
    let dragging = false;
    let lastPtrX = 0;
    let lastPtrY = 0;

    const look = new THREE.Vector3(quiet ? 0.7 : 1.3, 0.05, 0);
    const canvas = renderer.domElement;

    const onPointer = (e: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
      const ny = ((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1;
      targetParallaxX = nx * (quiet ? 0.4 : 0.7);
      targetParallaxY = ny * (quiet ? 0.25 : 0.4);
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

      prop.rotation.y = orbitX + (animate ? t * 0.08 : 0);
      prop.rotation.x = orbitY * 0.65;
      prop.position.y = Math.sin(animate ? t * 0.85 : 0.4) * 0.05;

      if (wireTwin) {
        wireTwin.rotation.y = Math.sin(animate ? t * 0.35 : 0) * 0.04;
      }

      camera.position.x = camBase.x + parallaxX * 0.55 + orbitX * 0.12;
      camera.position.y = camBase.y + parallaxY * 0.35 + scrollT * 0.25;
      camera.position.z = camBase.z - scrollT * 1.6;
      look.set(
        (quiet ? 0.7 : 1.3) + parallaxX * 0.2,
        0.05 + parallaxY * 0.15,
        0
      );
      camera.lookAt(look);

      stage.position.x = (quiet ? 0.9 : 1.55) + parallaxX * 0.08;
      points.rotation.y = animate ? t * 0.015 : 0;
      kick.intensity = (quiet ? 7 : 14) + Math.sin(animate ? t : 0) * 2;
      ring.rotation.z = animate ? t * 0.15 : 0;

      // Don't bloom until model is in — avoids white flash
      bloom.strength = modelReady ? (quiet ? 0.16 : 0.26) : 0.05;

      composer.render();
    };

    if (reduced) {
      // Wait briefly for GLB then freeze
      const freeze = window.setTimeout(() => paintFrame(1, false), 400);
      return () => {
        disposed = true;
        window.clearTimeout(freeze);
        cleanup();
      };
    }

    const tick = () => {
      if (!running) return;
      paintFrame(clock.getElapsedTime(), true);
      raf = requestAnimationFrame(tick);
    };
    tick();

    function cleanup() {
      running = false;
      cancelAnimationFrame(raf);
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
      className={`cinematic-canvas${intensity === "quiet" ? " cinematic-canvas-quiet" : ""}`}
      aria-hidden="true"
    />
  );
}
