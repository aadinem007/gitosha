"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

type Intensity = "full" | "quiet";

/**
 * God-tier interactive track world — bloom, tunnel gates, particle rush,
 * pointer parallax + drag orbit, scroll dolly. Reduced-motion → one rich frame.
 */
export function CinematicTrack({ intensity = "full" }: { intensity?: Intensity }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const quiet = intensity === "quiet";
    const w = mount.clientWidth || window.innerWidth;
    const h = mount.clientHeight || window.innerHeight;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, quiet ? 1.4 : 2));
    renderer.setSize(w, h, false);
    renderer.setClearColor(0x050505, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = quiet ? 1.05 : 1.28;
    renderer.domElement.style.cssText =
      "position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:auto;touch-action:none;";
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, quiet ? 0.034 : 0.018);

    const camera = new THREE.PerspectiveCamera(quiet ? 46 : 58, w / h, 0.1, 220);
    const camBase = {
      x: 0,
      y: quiet ? 2.05 : 2.45,
      z: quiet ? 9.2 : 11.8,
    };
    camera.position.set(camBase.x, camBase.y, camBase.z);

    const root = new THREE.Group();
    scene.add(root);

    const nearLayer = new THREE.Group();
    const midLayer = new THREE.Group();
    const farLayer = new THREE.Group();
    root.add(farLayer);
    root.add(midLayer);
    root.add(nearLayer);

    scene.add(new THREE.AmbientLight(0x2a2a28, quiet ? 0.5 : 0.38));

    const key = new THREE.DirectionalLight(0xfff2e8, quiet ? 1.05 : 1.5);
    key.position.set(-4.5, 9, 6);
    scene.add(key);

    const fill = new THREE.DirectionalLight(0x8899aa, quiet ? 0.22 : 0.38);
    fill.position.set(5, 2.5, 3);
    scene.add(fill);

    const horizonLight = new THREE.PointLight(0xff5a1f, quiet ? 22 : 42, 60, 2);
    horizonLight.position.set(0, 2.4, -30);
    farLayer.add(horizonLight);

    const rim = new THREE.PointLight(0xff8a4a, quiet ? 5 : 12, 26, 2);
    rim.position.set(0, 1.5, -5);
    midLayer.add(rim);

    const noseLight = new THREE.SpotLight(0xff5a1f, quiet ? 8 : 18, 40, Math.PI / 7, 0.45, 1.4);
    noseLight.position.set(0, 3.2, 6);
    noseLight.target.position.set(0, 0, -20);
    nearLayer.add(noseLight);
    nearLayer.add(noseLight.target);

    const disposables: THREE.Object3D[] = [];
    const materials: THREE.Material[] = [];
    const geometries: THREE.BufferGeometry[] = [];

    const trackMat = (opts: {
      color: number;
      metalness?: number;
      roughness?: number;
      emissive?: number;
      emissiveIntensity?: number;
      transparent?: boolean;
      opacity?: number;
    }) => {
      const mat = new THREE.MeshStandardMaterial({
        color: opts.color,
        metalness: opts.metalness ?? 0.35,
        roughness: opts.roughness ?? 0.55,
        emissive: opts.emissive ?? 0x000000,
        emissiveIntensity: opts.emissiveIntensity ?? 0,
        transparent: opts.transparent ?? false,
        opacity: opts.opacity ?? 1,
      });
      materials.push(mat);
      return mat;
    };

    // Asphalt
    const roadGeo = new THREE.PlaneGeometry(16, 110, 1, 24);
    geometries.push(roadGeo);
    const road = new THREE.Mesh(
      roadGeo,
      trackMat({ color: 0x0a0a0a, metalness: 0.18, roughness: 0.94 })
    );
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0, -22);
    midLayer.add(road);
    disposables.push(road);

    // Center dashes
    const dashMat = trackMat({
      color: 0xff5a1f,
      metalness: 0.25,
      roughness: 0.35,
      emissive: 0xff5a1f,
      emissiveIntensity: quiet ? 0.55 : 1.15,
    });
    const dashGroup = new THREE.Group();
    midLayer.add(dashGroup);
    const dashCount = quiet ? 32 : 56;
    const dashGeo = new THREE.BoxGeometry(0.16, 0.045, 1.05);
    geometries.push(dashGeo);
    for (let i = 0; i < dashCount; i++) {
      const dash = new THREE.Mesh(dashGeo, dashMat);
      dash.position.set(0, 0.035, 10 - i * 1.65);
      dashGroup.add(dash);
      disposables.push(dash);
    }

    // Edge lines
    const edgeMat = trackMat({
      color: 0xf5f2eb,
      metalness: 0.12,
      roughness: 0.45,
      emissive: 0xf5f2eb,
      emissiveIntensity: quiet ? 0.12 : 0.28,
    });
    const edgeGeo = new THREE.BoxGeometry(0.09, 0.035, 100);
    geometries.push(edgeGeo);
    [-3.6, 3.6].forEach((x) => {
      const edge = new THREE.Mesh(edgeGeo, edgeMat);
      edge.position.set(x, 0.025, -20);
      midLayer.add(edge);
      disposables.push(edge);
    });

    // Barriers
    const barrierMat = trackMat({
      color: 0x141414,
      metalness: 0.6,
      roughness: 0.38,
      emissive: 0xff5a1f,
      emissiveIntensity: quiet ? 0.06 : 0.12,
    });
    const railMat = trackMat({
      color: 0xff5a1f,
      metalness: 0.45,
      roughness: 0.3,
      emissive: 0xff5a1f,
      emissiveIntensity: quiet ? 0.4 : 0.95,
    });

    [-1, 1].forEach((side) => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.25, 88), barrierMat);
      wall.position.set(side * 5.25, 0.62, -16);
      nearLayer.add(wall);
      disposables.push(wall);

      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 88), railMat);
      rail.position.set(side * 5.25, 1.28, -16);
      nearLayer.add(rail);
      disposables.push(rail);

      const postCount = quiet ? 12 : 20;
      for (let i = 0; i < postCount; i++) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.24, 1.5, 0.24), barrierMat);
        post.position.set(side * 5.5, 0.75, 8 - i * 4);
        nearLayer.add(post);
        disposables.push(post);

        const cap = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.09, 0.3), railMat);
        cap.position.set(side * 5.5, 1.52, 8 - i * 4);
        nearLayer.add(cap);
        disposables.push(cap);
      }
    });

    // Floating score slabs
    const slabMatA = trackMat({
      color: 0x101010,
      metalness: 0.5,
      roughness: 0.32,
      emissive: 0xff5a1f,
      emissiveIntensity: quiet ? 0.18 : 0.35,
    });
    const slabMatB = trackMat({
      color: 0x181816,
      metalness: 0.55,
      roughness: 0.28,
      emissive: 0xf5f2eb,
      emissiveIntensity: quiet ? 0.08 : 0.16,
    });
    const slabGroup = new THREE.Group();
    midLayer.add(slabGroup);

    type SlabSpec = {
      x: number;
      y: number;
      z: number;
      w: number;
      h: number;
      d: number;
      rotY: number;
      mat: THREE.MeshStandardMaterial;
      spin: number;
    };
    const slabs: SlabSpec[] = quiet
      ? [
          { x: -2.9, y: 1.65, z: -4, w: 1.7, h: 1.1, d: 0.09, rotY: 0.38, mat: slabMatA, spin: 0.14 },
          { x: 3.1, y: 2.15, z: -9, w: 1.4, h: 0.95, d: 0.09, rotY: -0.42, mat: slabMatB, spin: -0.1 },
          { x: -1.5, y: 2.7, z: -16, w: 1.15, h: 0.8, d: 0.08, rotY: 0.22, mat: slabMatA, spin: 0.07 },
        ]
      : [
          { x: -3.4, y: 1.6, z: -2, w: 2.0, h: 1.3, d: 0.1, rotY: 0.45, mat: slabMatA, spin: 0.18 },
          { x: 3.6, y: 2.1, z: -6.5, w: 1.65, h: 1.1, d: 0.1, rotY: -0.5, mat: slabMatB, spin: -0.12 },
          { x: -2.6, y: 2.65, z: -11.5, w: 1.5, h: 1.0, d: 0.09, rotY: 0.3, mat: slabMatA, spin: 0.1 },
          { x: 2.8, y: 3.15, z: -17.5, w: 1.35, h: 0.9, d: 0.09, rotY: -0.35, mat: slabMatB, spin: -0.08 },
          { x: -1.2, y: 3.55, z: -24, w: 1.2, h: 0.75, d: 0.08, rotY: 0.2, mat: slabMatA, spin: 0.06 },
          { x: 1.8, y: 3.9, z: -30, w: 1.05, h: 0.65, d: 0.07, rotY: -0.18, mat: slabMatB, spin: -0.05 },
        ];

    const slabMeshes: THREE.Mesh[] = [];
    slabs.forEach((s) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(s.w, s.h, s.d), s.mat);
      mesh.position.set(s.x, s.y, s.z);
      mesh.rotation.y = s.rotY;
      mesh.userData.spin = s.spin;
      mesh.userData.baseY = s.y;
      slabGroup.add(mesh);
      slabMeshes.push(mesh);
      disposables.push(mesh);

      const bar = new THREE.Mesh(new THREE.BoxGeometry(s.w * 0.58, 0.07, 0.025), railMat);
      bar.position.set(0, s.h * 0.24, s.d / 2 + 0.025);
      mesh.add(bar);
      disposables.push(bar);
    });

    // Distant monoliths
    const monoMat = trackMat({
      color: 0x0e0e0e,
      metalness: 0.7,
      roughness: 0.25,
      emissive: 0xff5a1f,
      emissiveIntensity: quiet ? 0.12 : 0.28,
    });
    const monoliths: THREE.Mesh[] = [];
    const monoSpecs = quiet
      ? [
          { x: -6.8, z: -20, h: 3.4 },
          { x: 7.0, z: -25, h: 4.2 },
        ]
      : [
          { x: -7.5, z: -15, h: 3.8 },
          { x: 7.8, z: -21, h: 4.8 },
          { x: -8.4, z: -29, h: 5.6 },
          { x: 8.6, z: -35, h: 4.0 },
          { x: -6.2, z: -42, h: 6.2 },
        ];
    monoSpecs.forEach((m) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(1.15, m.h, 1.15), monoMat);
      mesh.position.set(m.x, m.h / 2, m.z);
      farLayer.add(mesh);
      monoliths.push(mesh);
      disposables.push(mesh);

      const beacon = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.14, 0.4), railMat);
      beacon.position.set(0, m.h / 2 + 0.12, 0);
      mesh.add(beacon);
      disposables.push(beacon);
    });

    // Horizon sun
    const sun = new THREE.Mesh(
      new THREE.CircleGeometry(quiet ? 3.4 : 5.2, 64),
      trackMat({
        color: 0xff5a1f,
        metalness: 0,
        roughness: 1,
        emissive: 0xff5a1f,
        emissiveIntensity: quiet ? 1.2 : 2.2,
        transparent: true,
        opacity: quiet ? 0.6 : 0.82,
      })
    );
    sun.position.set(0, 2.6, -40);
    farLayer.add(sun);
    disposables.push(sun);

    const sunCore = new THREE.Mesh(
      new THREE.CircleGeometry(quiet ? 1.2 : 1.85, 48),
      trackMat({
        color: 0xffc8a8,
        metalness: 0,
        roughness: 1,
        emissive: 0xff8a4a,
        emissiveIntensity: quiet ? 1.4 : 2.4,
        transparent: true,
        opacity: 0.9,
      })
    );
    sunCore.position.set(0, 2.6, -39.6);
    farLayer.add(sunCore);
    disposables.push(sunCore);

    // Tunnel gate rings
    const gateMat = trackMat({
      color: 0xff5a1f,
      metalness: 0.55,
      roughness: 0.28,
      emissive: 0xff5a1f,
      emissiveIntensity: quiet ? 0.35 : 0.85,
      transparent: true,
      opacity: quiet ? 0.4 : 0.65,
    });
    const gates: THREE.Mesh[] = [];
    for (let i = 0; i < (quiet ? 5 : 10); i++) {
      const gate = new THREE.Mesh(new THREE.TorusGeometry(3.6 + i * 0.05, 0.05, 10, 64), gateMat);
      gate.position.set(0, 1.7, -2 - i * 5.8);
      gate.rotation.x = Math.PI / 2;
      midLayer.add(gate);
      gates.push(gate);
      disposables.push(gate);
    }

    // Speed-line ribbons (thin emissive boxes streaking)
    const streakMat = trackMat({
      color: 0xff5a1f,
      metalness: 0.2,
      roughness: 0.4,
      emissive: 0xff5a1f,
      emissiveIntensity: quiet ? 0.5 : 1.4,
      transparent: true,
      opacity: quiet ? 0.25 : 0.45,
    });
    const streaks: THREE.Mesh[] = [];
    if (!quiet) {
      for (let i = 0; i < 18; i++) {
        const streak = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 2.4 + Math.random() * 2), streakMat);
        streak.position.set((Math.random() - 0.5) * 10, 0.4 + Math.random() * 3.5, -Math.random() * 40);
        streak.userData.speed = 8 + Math.random() * 14;
        nearLayer.add(streak);
        streaks.push(streak);
        disposables.push(streak);
      }
    }

    // Particle field
    const count = quiet ? 280 : 900;
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 28;
      positions[i * 3 + 1] = Math.random() * 9 + 0.15;
      positions[i * 3 + 2] = Math.random() * -70 + 12;
      velocities[i] = 2 + Math.random() * 6;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometries.push(pGeo);
    const pMat = new THREE.PointsMaterial({
      color: 0xffe8d8,
      size: quiet ? 0.048 : 0.062,
      transparent: true,
      opacity: quiet ? 0.45 : 0.7,
      depthWrite: false,
      sizeAttenuation: true,
    });
    materials.push(pMat);
    const points = new THREE.Points(pGeo, pMat);
    farLayer.add(points);

    // Post-processing bloom
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(w, h),
      quiet ? 0.55 : 0.95,
      quiet ? 0.55 : 0.72,
      quiet ? 0.35 : 0.22
    );
    composer.addPass(bloom);
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

    const lookTarget = new THREE.Vector3(0, 1.15, -20);
    const canvas = renderer.domElement;

    const onPointer = (e: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
      const ny = ((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1;
      const gain = quiet ? 0.75 : 1.65;
      targetParallaxX = nx * gain;
      targetParallaxY = ny * (quiet ? 0.4 : 0.85);
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
      targetOrbitX = Math.max(-1.35, Math.min(1.35, targetOrbitX + dx * (quiet ? 2.6 : 4.2)));
      targetOrbitY = Math.max(-0.6, Math.min(0.6, targetOrbitY + dy * (quiet ? 1.5 : 2.4)));
    };

    const onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      targetScrollT = Math.min(1, window.scrollY / Math.min(max, window.innerHeight * 2.1));
    };

    const onResize = () => {
      const nw = mount.clientWidth || window.innerWidth;
      const nh = mount.clientHeight || window.innerHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh, false);
      composer.setSize(nw, nh);
      bloom.setSize(nw, nh);
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
      scrollT += (targetScrollT - scrollT) * (animate ? 0.085 : 1);

      nearLayer.position.x = parallaxX * 0.85 + orbitX * 0.4;
      nearLayer.position.y = -parallaxY * 0.36 - orbitY * 0.22;
      midLayer.position.x = parallaxX * 0.42 + orbitX * 0.2;
      midLayer.position.y = -parallaxY * 0.18 - orbitY * 0.12;
      farLayer.position.x = parallaxX * 0.16 + orbitX * 0.07;
      farLayer.position.y = -parallaxY * 0.07 - orbitY * 0.05;

      camera.position.x = camBase.x + parallaxX * 2.1 + orbitX * 2.8;
      camera.position.y = camBase.y + parallaxY * 0.85 + orbitY * 1.2 + scrollT * 1.05;
      camera.position.z = camBase.z - scrollT * 6.4 - Math.abs(orbitX) * 0.75;

      lookTarget.set(
        parallaxX * 2.6 + orbitX * 3.6,
        1.2 + parallaxY * 0.5 + orbitY * 0.8 + scrollT * 0.5,
        -20 - scrollT * 8
      );
      camera.lookAt(lookTarget);

      root.rotation.z = -parallaxX * 0.065 - orbitX * 0.09;
      root.rotation.x = parallaxY * 0.045 + orbitY * 0.07;

      if (animate) {
        const speed = (quiet ? 2.6 : 4.4) + scrollT * 3.2;
        dashGroup.position.z = ((t * speed) % 1.65) - 0.2;

        slabMeshes.forEach((mesh, i) => {
          const spin = mesh.userData.spin as number;
          mesh.rotation.y += spin * 0.005;
          mesh.position.y =
            (mesh.userData.baseY as number) + Math.sin(t * 1.05 + i * 1.15) * 0.14;
        });

        monoliths.forEach((m, i) => {
          m.rotation.y = Math.sin(t * 0.28 + i) * 0.1;
        });

        gates.forEach((g, i) => {
          g.rotation.z = t * (0.15 + i * 0.018);
          g.scale.setScalar(1 + Math.sin(t * 0.9 + i * 0.4) * 0.03);
        });

        streaks.forEach((s) => {
          s.position.z += (s.userData.speed as number) * 0.016;
          if (s.position.z > 8) s.position.z = -45 - Math.random() * 10;
        });

        const pos = pGeo.getAttribute("position") as THREE.BufferAttribute;
        for (let i = 0; i < count; i++) {
          let z = pos.getZ(i) + velocities[i] * 0.02 * (1 + scrollT);
          if (z > 12) z = -70;
          pos.setZ(i, z);
        }
        pos.needsUpdate = true;

        horizonLight.intensity = (quiet ? 18 : 36) + Math.sin(t * 0.9) * 6;
        noseLight.intensity = (quiet ? 6 : 14) + Math.sin(t * 1.4) * 3;
        bloom.strength = (quiet ? 0.5 : 0.88) + Math.sin(t * 0.7) * 0.08;
      } else {
        dashGroup.position.z = -0.35;
        slabMeshes.forEach((mesh, i) => {
          mesh.rotation.y += (mesh.userData.spin as number) * 0.45;
          mesh.position.y = (mesh.userData.baseY as number) + (i % 2 === 0 ? 0.1 : -0.06);
        });
        gates.forEach((g, i) => {
          g.rotation.z = i * 0.22;
        });
      }

      composer.render();
    };

    if (reduced) {
      paintFrame(0.9, false);
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
      disposables.forEach((obj) => {
        if (obj instanceof THREE.Mesh) obj.geometry.dispose();
      });
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
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
