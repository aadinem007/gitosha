"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass.js";

type Intensity = "full" | "quiet";

/**
 * Lando-grade layered hero world:
 * studio reflections + chrome relic + wireframe twin + glass shards.
 * Pointer parallax / drag orbit / scroll dolly. Not a box highway.
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

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, quiet ? 1.5 : 2));
    renderer.setSize(w, h, false);
    renderer.setClearColor(0x070707, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = quiet ? 1.05 : 1.15;
    renderer.domElement.style.cssText =
      "position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:auto;touch-action:none;";
    mount.appendChild(renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    const scene = new THREE.Scene();
    scene.environment = envTex;
    scene.background = new THREE.Color(0x070707);
    scene.fog = new THREE.FogExp2(0x070707, quiet ? 0.045 : 0.028);

    const camera = new THREE.PerspectiveCamera(quiet ? 42 : 48, w / h, 0.1, 100);
    const camBase = { x: 0, y: quiet ? 0.35 : 0.55, z: quiet ? 6.2 : 7.4 };
    camera.position.set(camBase.x, camBase.y, camBase.z);

    const root = new THREE.Group();
    scene.add(root);

    const relic = new THREE.Group();
    root.add(relic);

    // Soft key / rim — studio lighting like a product shoot
    scene.add(new THREE.AmbientLight(0xffffff, quiet ? 0.35 : 0.28));
    const key = new THREE.DirectionalLight(0xfff5ea, quiet ? 1.4 : 2.1);
    key.position.set(4.5, 7, 5);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x9eb4c8, quiet ? 0.35 : 0.55);
    fill.position.set(-5, 2, 3);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xff5a1f, quiet ? 0.55 : 1.15);
    rim.position.set(-2, 3, -6);
    scene.add(rim);
    const punch = new THREE.PointLight(0xff5a1f, quiet ? 12 : 28, 18, 2);
    punch.position.set(1.2, 1.4, 2.5);
    relic.add(punch);

    const materials: THREE.Material[] = [];
    const geometries: THREE.BufferGeometry[] = [];

    const chrome = new THREE.MeshPhysicalMaterial({
      color: 0xf2f0ea,
      metalness: 1,
      roughness: 0.12,
      envMapIntensity: quiet ? 1.1 : 1.55,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
    });
    materials.push(chrome);

    const papayaGlass = new THREE.MeshPhysicalMaterial({
      color: 0xff5a1f,
      metalness: 0.15,
      roughness: 0.18,
      transmission: quiet ? 0.35 : 0.55,
      thickness: 1.2,
      ior: 1.45,
      transparent: true,
      opacity: 0.92,
      envMapIntensity: 1.3,
      emissive: 0xff5a1f,
      emissiveIntensity: quiet ? 0.25 : 0.45,
    });
    materials.push(papayaGlass);

    const darkShell = new THREE.MeshPhysicalMaterial({
      color: 0x121212,
      metalness: 0.85,
      roughness: 0.28,
      envMapIntensity: 0.9,
      clearcoat: 0.6,
      clearcoatRoughness: 0.2,
    });
    materials.push(darkShell);

    const wire = new THREE.MeshBasicMaterial({
      color: 0xf5f2eb,
      wireframe: true,
      transparent: true,
      opacity: quiet ? 0.35 : 0.55,
    });
    materials.push(wire);

    const hotWire = new THREE.MeshBasicMaterial({
      color: 0xff5a1f,
      wireframe: true,
      transparent: true,
      opacity: quiet ? 0.4 : 0.7,
    });
    materials.push(hotWire);

    // ── Core relic: chrome ring + glass crystal + dark chassis (Lando helmet energy) ──
    const torusGeo = new THREE.TorusGeometry(1.55, 0.18, 48, 160);
    geometries.push(torusGeo);
    const ring = new THREE.Mesh(torusGeo, chrome);
    ring.rotation.x = Math.PI / 2.35;
    relic.add(ring);

    const ringWire = new THREE.Mesh(torusGeo, hotWire);
    ringWire.rotation.copy(ring.rotation);
    ringWire.scale.setScalar(1.012);
    relic.add(ringWire);

    const crystalGeo = new THREE.IcosahedronGeometry(0.95, 1);
    geometries.push(crystalGeo);
    const crystal = new THREE.Mesh(crystalGeo, papayaGlass);
    crystal.position.y = 0.15;
    relic.add(crystal);

    const crystalWire = new THREE.Mesh(crystalGeo, wire);
    crystalWire.position.copy(crystal.position);
    crystalWire.scale.setScalar(1.04);
    relic.add(crystalWire);

    // Chin / visor bar — solid fragment floating like Lando's textured piece
    const barGeo = new THREE.BoxGeometry(2.1, 0.28, 0.55, 1, 1, 1);
    geometries.push(barGeo);
    const bar = new THREE.Mesh(barGeo, chrome);
    bar.position.set(0, -0.95, 0.55);
    bar.rotation.x = -0.35;
    relic.add(bar);

    const barAccentGeo = new THREE.BoxGeometry(1.35, 0.06, 0.08);
    geometries.push(barAccentGeo);
    const barAccent = new THREE.Mesh(
      barAccentGeo,
      new THREE.MeshStandardMaterial({
        color: 0xff5a1f,
        emissive: 0xff5a1f,
        emissiveIntensity: quiet ? 0.8 : 1.6,
        metalness: 0.4,
        roughness: 0.3,
      })
    );
    materials.push(barAccent.material as THREE.Material);
    barAccent.position.set(0, 0.02, 0.28);
    bar.add(barAccent);

    // Side cheek plates
    [-1, 1].forEach((side) => {
      const cheek = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.85, 0.2), darkShell);
      cheek.position.set(side * 1.35, -0.15, 0.15);
      cheek.rotation.y = side * -0.45;
      cheek.rotation.z = side * 0.12;
      relic.add(cheek);

      const cheekWire = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.85, 0.2), wire);
      cheekWire.position.copy(cheek.position);
      cheekWire.rotation.copy(cheek.rotation);
      cheekWire.scale.setScalar(1.03);
      relic.add(cheekWire);
    });

    // Outer halo torus (larger, thinner)
    if (!quiet) {
      const haloGeo = new THREE.TorusGeometry(2.45, 0.035, 16, 128);
      geometries.push(haloGeo);
      const halo = new THREE.Mesh(haloGeo, hotWire);
      halo.rotation.x = Math.PI / 2.1;
      relic.add(halo);
    }

    // Floating score shards around the relic
    const shards: THREE.Mesh[] = [];
    const shardCount = quiet ? 4 : 8;
    for (let i = 0; i < shardCount; i++) {
      const ang = (i / shardCount) * Math.PI * 2;
      const r = quiet ? 2.6 : 3.15;
      const shard = new THREE.Mesh(
        new THREE.BoxGeometry(0.55 + (i % 3) * 0.15, 0.7 + (i % 2) * 0.2, 0.06),
        i % 2 === 0 ? darkShell : chrome
      );
      shard.position.set(Math.cos(ang) * r, Math.sin(ang * 1.3) * 0.55, Math.sin(ang) * r * 0.55);
      shard.lookAt(0, 0, 0);
      shard.userData.base = shard.position.clone();
      shard.userData.spin = 0.2 + (i % 4) * 0.08;
      relic.add(shard);
      shards.push(shard);

      const sw = new THREE.Mesh(
        new THREE.BoxGeometry(0.55 + (i % 3) * 0.15, 0.7 + (i % 2) * 0.2, 0.06),
        wire
      );
      sw.position.copy(shard.position);
      sw.quaternion.copy(shard.quaternion);
      sw.scale.setScalar(1.04);
      shard.add(sw);
    }

    // Soft reflective floor disc (product pedestal)
    const floorGeo = new THREE.CircleGeometry(quiet ? 4.5 : 6.5, 96);
    geometries.push(floorGeo);
    const floor = new THREE.Mesh(
      floorGeo,
      new THREE.MeshPhysicalMaterial({
        color: 0x0a0a0a,
        metalness: 0.9,
        roughness: 0.35,
        envMapIntensity: 0.7,
        transparent: true,
        opacity: 0.85,
      })
    );
    materials.push(floor.material as THREE.Material);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.55;
    root.add(floor);

    // Contour / topo rings on floor (Lando background energy)
    const topoGroup = new THREE.Group();
    root.add(topoGroup);
    const topoMat = new THREE.MeshBasicMaterial({
      color: 0xff5a1f,
      transparent: true,
      opacity: quiet ? 0.08 : 0.14,
    });
    materials.push(topoMat);
    for (let i = 0; i < (quiet ? 5 : 9); i++) {
      const tGeo = new THREE.TorusGeometry(1.4 + i * 0.55, 0.008, 8, 96);
      geometries.push(tGeo);
      const t = new THREE.Mesh(tGeo, topoMat);
      t.rotation.x = -Math.PI / 2;
      t.position.y = -1.52;
      topoGroup.add(t);
    }

    // Micro dust
    const count = quiet ? 180 : 420;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometries.push(pGeo);
    const pMat = new THREE.PointsMaterial({
      color: 0xffe0cc,
      size: quiet ? 0.02 : 0.028,
      transparent: true,
      opacity: quiet ? 0.35 : 0.55,
      depthWrite: false,
      sizeAttenuation: true,
    });
    materials.push(pMat);
    const points = new THREE.Points(pGeo, pMat);
    root.add(points);

    // Post stack
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(w, h),
      quiet ? 0.35 : 0.62,
      0.5,
      0.18
    );
    composer.addPass(bloom);
    const smaa = new SMAAPass();
    composer.addPass(smaa);
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
    let targetOrbitX = 0;
    let targetOrbitY = 0;
    let dragging = false;
    let lastPtrX = 0;
    let lastPtrY = 0;

    const look = new THREE.Vector3(0, 0.1, 0);
    const canvas = renderer.domElement;

    const onPointer = (e: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
      const ny = ((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1;
      const gain = quiet ? 0.55 : 1.05;
      targetParallaxX = nx * gain;
      targetParallaxY = ny * (quiet ? 0.35 : 0.55);
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
      targetOrbitX = Math.max(-1.4, Math.min(1.4, targetOrbitX + dx * (quiet ? 2.8 : 4)));
      targetOrbitY = Math.max(-0.7, Math.min(0.7, targetOrbitY + dy * (quiet ? 1.6 : 2.4)));
    };

    const onScroll = () => {
      targetScrollT = Math.min(1, window.scrollY / Math.min(window.innerHeight * 1.6, 900));
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
      orbitX += (targetOrbitX - orbitX) * (animate ? 0.12 : 1);
      orbitY += (targetOrbitY - orbitY) * (animate ? 0.12 : 1);
      scrollT += (targetScrollT - scrollT) * (animate ? 0.08 : 1);

      // Relic responds like a product turntable
      relic.rotation.y = orbitX * 0.95 + parallaxX * 0.35 + (animate ? t * 0.12 : 0.4);
      relic.rotation.x = orbitY * 0.55 + parallaxY * 0.25;
      relic.position.y = Math.sin(animate ? t * 0.9 : 0.5) * 0.08;
      relic.position.x = parallaxX * 0.15;

      camera.position.x = camBase.x + parallaxX * 1.1 + orbitX * 0.45;
      camera.position.y = camBase.y + parallaxY * 0.55 + orbitY * 0.35 + scrollT * 0.35;
      camera.position.z = camBase.z - scrollT * 2.4 - Math.abs(orbitX) * 0.25;
      look.set(parallaxX * 0.4 + orbitX * 0.3, 0.05 + parallaxY * 0.2, 0);
      camera.lookAt(look);

      crystal.rotation.y = (animate ? t * 0.35 : 0.6) + orbitX * 0.2;
      crystal.rotation.z = (animate ? t * 0.18 : 0.2) - orbitY * 0.15;
      crystalWire.rotation.copy(crystal.rotation);

      shards.forEach((s, i) => {
        const base = s.userData.base as THREE.Vector3;
        const spin = s.userData.spin as number;
        s.position.y = base.y + Math.sin((animate ? t : 1) * spin + i) * 0.12;
        s.rotation.z += animate ? 0.003 * spin : 0;
      });

      topoGroup.rotation.z = (animate ? t * 0.04 : 0) + parallaxX * 0.05;
      points.rotation.y = animate ? t * 0.02 : 0;
      punch.intensity = (quiet ? 10 : 24) + Math.sin(animate ? t * 1.2 : 0) * 4;
      bloom.strength = (quiet ? 0.32 : 0.58) + Math.sin(animate ? t * 0.7 : 0) * 0.05;

      composer.render();
    };

    if (reduced) {
      paintFrame(1.2, false);
    } else {
      const tick = () => {
        if (!running) return;
        paintFrame(clock.getElapsedTime(), true);
        raf = requestAnimationFrame(tick);
      };
      tick();
    }

    return () => {
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
      envTex.dispose();
      pmrem.dispose();
      composer.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === mount) {
        mount.removeChild(renderer.domElement);
      }
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
