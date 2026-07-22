"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type Intensity = "full" | "quiet";

/**
 * Interactive 3D track world — lit road plane, barriers, floating score slabs.
 * Pointer parallax rotates the camera; scroll dollies depth. Reduced-motion
 * still paints one rich static frame (never an empty mount).
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
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, quiet ? 1.5 : 2));
    renderer.setSize(w, h, false);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = quiet ? 1.05 : 1.2;
    renderer.domElement.style.cssText =
      "position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;";
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, quiet ? 0.038 : 0.022);

    const camera = new THREE.PerspectiveCamera(quiet ? 48 : 55, w / h, 0.1, 200);
    const camBase = {
      x: 0,
      y: quiet ? 2.05 : 2.35,
      z: quiet ? 9.5 : 11.2,
    };
    camera.position.set(camBase.x, camBase.y, camBase.z);

    const root = new THREE.Group();
    scene.add(root);

    // Depth layers for differential parallax (near moves more than far)
    const nearLayer = new THREE.Group();
    const midLayer = new THREE.Group();
    const farLayer = new THREE.Group();
    root.add(farLayer);
    root.add(midLayer);
    root.add(nearLayer);

    // Lighting — real form, not flat additive wallpaper
    const ambient = new THREE.AmbientLight(0x2a2a28, quiet ? 0.55 : 0.42);
    scene.add(ambient);

    const key = new THREE.DirectionalLight(0xfff2e8, quiet ? 1.1 : 1.45);
    key.position.set(-4.5, 8, 6);
    scene.add(key);

    const fill = new THREE.DirectionalLight(0x8899aa, quiet ? 0.25 : 0.35);
    fill.position.set(5, 2.5, 3);
    scene.add(fill);

    const horizonLight = new THREE.PointLight(0xff5a1f, quiet ? 18 : 32, 55, 2);
    horizonLight.position.set(0, 2.2, -28);
    farLayer.add(horizonLight);

    const rim = new THREE.PointLight(0xff8a4a, quiet ? 4 : 8, 22, 2);
    rim.position.set(0, 1.4, -6);
    midLayer.add(rim);

    const disposables: THREE.Object3D[] = [];
    const materials: THREE.Material[] = [];

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

    // Road plane
    const road = new THREE.Mesh(
      new THREE.PlaneGeometry(14, 90),
      trackMat({ color: 0x0c0c0c, metalness: 0.15, roughness: 0.92 })
    );
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0, -18);
    midLayer.add(road);
    disposables.push(road);

    // Center dashes as real boxes racing along Z
    const dashMat = trackMat({
      color: 0xff5a1f,
      metalness: 0.2,
      roughness: 0.4,
      emissive: 0xff5a1f,
      emissiveIntensity: quiet ? 0.35 : 0.7,
    });
    const dashGroup = new THREE.Group();
    midLayer.add(dashGroup);
    const dashCount = quiet ? 28 : 48;
    for (let i = 0; i < dashCount; i++) {
      const dash = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 0.9), dashMat);
      dash.position.set(0, 0.03, 8 - i * 1.7);
      dashGroup.add(dash);
      disposables.push(dash);
    }

    // Lane edge lines
    const edgeMat = trackMat({
      color: 0xf5f2eb,
      metalness: 0.1,
      roughness: 0.5,
      emissive: 0xf5f2eb,
      emissiveIntensity: quiet ? 0.08 : 0.18,
    });
    [-3.4, 3.4].forEach((x) => {
      const edge = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.03, 88), edgeMat);
      edge.position.set(x, 0.02, -18);
      midLayer.add(edge);
      disposables.push(edge);
    });

    // Side barriers — chunky extruded walls with posts
    const barrierMat = trackMat({
      color: 0x161616,
      metalness: 0.55,
      roughness: 0.4,
      emissive: 0xff5a1f,
      emissiveIntensity: quiet ? 0.04 : 0.09,
    });
    const railMat = trackMat({
      color: 0xff5a1f,
      metalness: 0.4,
      roughness: 0.35,
      emissive: 0xff5a1f,
      emissiveIntensity: quiet ? 0.25 : 0.55,
    });

    [-1, 1].forEach((side) => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(0.45, 1.15, 78), barrierMat);
      wall.position.set(side * 5.1, 0.58, -14);
      nearLayer.add(wall);
      disposables.push(wall);

      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 78), railMat);
      rail.position.set(side * 5.1, 1.2, -14);
      nearLayer.add(rail);
      disposables.push(rail);

      const postCount = quiet ? 10 : 16;
      for (let i = 0; i < postCount; i++) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.4, 0.22), barrierMat);
        post.position.set(side * 5.35, 0.7, 6 - i * 4.2);
        nearLayer.add(post);
        disposables.push(post);

        const cap = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.08, 0.28), railMat);
        cap.position.set(side * 5.35, 1.42, 6 - i * 4.2);
        nearLayer.add(cap);
        disposables.push(cap);
      }
    });

    // Floating score / vault slabs — thin cards with depth
    const slabMatA = trackMat({
      color: 0x121212,
      metalness: 0.45,
      roughness: 0.35,
      emissive: 0xff5a1f,
      emissiveIntensity: quiet ? 0.12 : 0.22,
    });
    const slabMatB = trackMat({
      color: 0x1a1a18,
      metalness: 0.5,
      roughness: 0.3,
      emissive: 0xf5f2eb,
      emissiveIntensity: quiet ? 0.05 : 0.1,
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
          { x: -2.8, y: 1.6, z: -4, w: 1.6, h: 1.05, d: 0.08, rotY: 0.35, mat: slabMatA, spin: 0.12 },
          { x: 3.0, y: 2.1, z: -9, w: 1.35, h: 0.9, d: 0.08, rotY: -0.4, mat: slabMatB, spin: -0.08 },
          { x: -1.4, y: 2.6, z: -16, w: 1.1, h: 0.75, d: 0.07, rotY: 0.2, mat: slabMatA, spin: 0.06 },
        ]
      : [
          { x: -3.2, y: 1.55, z: -2.5, w: 1.85, h: 1.2, d: 0.09, rotY: 0.42, mat: slabMatA, spin: 0.15 },
          { x: 3.4, y: 2.0, z: -7, w: 1.55, h: 1.05, d: 0.09, rotY: -0.48, mat: slabMatB, spin: -0.1 },
          { x: -2.4, y: 2.55, z: -12, w: 1.4, h: 0.95, d: 0.08, rotY: 0.28, mat: slabMatA, spin: 0.08 },
          { x: 2.6, y: 3.0, z: -18, w: 1.25, h: 0.85, d: 0.08, rotY: -0.32, mat: slabMatB, spin: -0.06 },
          { x: -1.1, y: 3.4, z: -24, w: 1.1, h: 0.7, d: 0.07, rotY: 0.18, mat: slabMatA, spin: 0.05 },
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

      // Score bar accents on each slab face
      const bar = new THREE.Mesh(
        new THREE.BoxGeometry(s.w * 0.55, 0.06, 0.02),
        railMat
      );
      bar.position.set(0, s.h * 0.22, s.d / 2 + 0.02);
      mesh.add(bar);
      disposables.push(bar);
    });

    // Foundry / vault geometric monoliths in the distance
    const monoMat = trackMat({
      color: 0x101010,
      metalness: 0.65,
      roughness: 0.28,
      emissive: 0xff5a1f,
      emissiveIntensity: quiet ? 0.08 : 0.16,
    });
    const monoliths: THREE.Mesh[] = [];
    const monoSpecs = quiet
      ? [
          { x: -6.5, z: -20, h: 3.2 },
          { x: 6.8, z: -24, h: 4.0 },
        ]
      : [
          { x: -7.2, z: -16, h: 3.6 },
          { x: 7.5, z: -22, h: 4.4 },
          { x: -8.0, z: -30, h: 5.2 },
          { x: 8.2, z: -34, h: 3.8 },
        ];
    monoSpecs.forEach((m) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(1.1, m.h, 1.1), monoMat);
      mesh.position.set(m.x, m.h / 2, m.z);
      farLayer.add(mesh);
      monoliths.push(mesh);
      disposables.push(mesh);

      const beacon = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 0.12, 0.35),
        railMat
      );
      beacon.position.set(0, m.h / 2 + 0.1, 0);
      mesh.add(beacon);
      disposables.push(beacon);
    });

    // Horizon punch disc (lit geometry, not a 2D sticker)
    const sun = new THREE.Mesh(
      new THREE.CircleGeometry(quiet ? 3.2 : 4.6, 48),
      trackMat({
        color: 0xff5a1f,
        metalness: 0,
        roughness: 1,
        emissive: 0xff5a1f,
        emissiveIntensity: quiet ? 0.9 : 1.4,
        transparent: true,
        opacity: quiet ? 0.55 : 0.72,
      })
    );
    sun.position.set(0, 2.4, -36);
    farLayer.add(sun);
    disposables.push(sun);

    const sunCore = new THREE.Mesh(
      new THREE.CircleGeometry(quiet ? 1.1 : 1.6, 32),
      trackMat({
        color: 0xffb08a,
        metalness: 0,
        roughness: 1,
        emissive: 0xff8a4a,
        emissiveIntensity: quiet ? 1.1 : 1.8,
        transparent: true,
        opacity: 0.85,
      })
    );
    sunCore.position.set(0, 2.4, -35.7);
    farLayer.add(sunCore);
    disposables.push(sunCore);

    // Gate rings — thin tori for depth cues
    const gateMat = trackMat({
      color: 0xff5a1f,
      metalness: 0.5,
      roughness: 0.35,
      emissive: 0xff5a1f,
      emissiveIntensity: quiet ? 0.2 : 0.4,
      transparent: true,
      opacity: quiet ? 0.35 : 0.55,
    });
    const gates: THREE.Mesh[] = [];
    for (let i = 0; i < (quiet ? 4 : 7); i++) {
      const gate = new THREE.Mesh(new THREE.TorusGeometry(3.4, 0.045, 8, 48), gateMat);
      gate.position.set(0, 1.6, -3 - i * 6.5);
      gate.rotation.x = Math.PI / 2;
      midLayer.add(gate);
      gates.push(gate);
      disposables.push(gate);
    }

    // Sparse particles for atmosphere (kept light)
    const count = quiet ? 220 : 480;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 22;
      positions[i * 3 + 1] = Math.random() * 7 + 0.2;
      positions[i * 3 + 2] = Math.random() * -60 + 10;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xf5f2eb,
      size: quiet ? 0.045 : 0.055,
      transparent: true,
      opacity: quiet ? 0.4 : 0.55,
      depthWrite: false,
      sizeAttenuation: true,
    });
    materials.push(pMat);
    const points = new THREE.Points(pGeo, pMat);
    farLayer.add(points);

    let raf = 0;
    let running = true;
    const clock = new THREE.Clock();
    let targetParallaxX = 0;
    let targetParallaxY = 0;
    let parallaxX = 0;
    let parallaxY = 0;
    let scrollT = 0;
    let targetScrollT = 0;

    const lookTarget = new THREE.Vector3(0, 1.1, -18);

    const onPointer = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      // Strong enough to read in screenshots / feel interactive
      targetParallaxX = nx * (quiet ? 0.55 : 1.05);
      targetParallaxY = ny * (quiet ? 0.28 : 0.55);
    };

    const onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      targetScrollT = Math.min(1, window.scrollY / Math.min(max, window.innerHeight * 1.8));
    };

    const onResize = () => {
      const nw = mount.clientWidth || window.innerWidth;
      const nh = mount.clientHeight || window.innerHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh, false);
    };

    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    onScroll();

    const paintFrame = (t: number, animate: boolean) => {
      parallaxX += (targetParallaxX - parallaxX) * (animate ? 0.07 : 1);
      parallaxY += (targetParallaxY - parallaxY) * (animate ? 0.07 : 1);
      scrollT += (targetScrollT - scrollT) * (animate ? 0.08 : 1);

      // Differential layer parallax — near reacts hardest
      nearLayer.position.x = parallaxX * 0.55;
      nearLayer.position.y = -parallaxY * 0.22;
      midLayer.position.x = parallaxX * 0.28;
      midLayer.position.y = -parallaxY * 0.12;
      farLayer.position.x = parallaxX * 0.1;
      farLayer.position.y = -parallaxY * 0.04;

      // Camera orbit + scroll dolly into the track
      camera.position.x = camBase.x + parallaxX * 1.35;
      camera.position.y = camBase.y + parallaxY * 0.55 + scrollT * 0.85;
      camera.position.z = camBase.z - scrollT * 4.8;

      lookTarget.set(
        parallaxX * 1.8,
        1.15 + parallaxY * 0.35 + scrollT * 0.4,
        -18 - scrollT * 6
      );
      camera.lookAt(lookTarget);

      // Subtle root roll for presence
      root.rotation.z = -parallaxX * 0.04;
      root.rotation.x = parallaxY * 0.03;

      if (animate) {
        const speed = (quiet ? 2.2 : 3.6) + scrollT * 2.4;
        dashGroup.position.z = ((t * speed) % 1.7) - 0.2;

        slabMeshes.forEach((mesh, i) => {
          const spin = mesh.userData.spin as number;
          mesh.rotation.y += spin * 0.004;
          mesh.position.y =
            (mesh.userData.baseY as number) + Math.sin(t * 0.9 + i * 1.1) * 0.12;
        });

        monoliths.forEach((m, i) => {
          m.rotation.y = Math.sin(t * 0.25 + i) * 0.08;
        });

        gates.forEach((g, i) => {
          g.rotation.z = t * (0.12 + i * 0.015);
        });

        horizonLight.intensity = (quiet ? 16 : 28) + Math.sin(t * 0.8) * 4;
        points.rotation.y = t * 0.03;
      } else {
        // Rich static pose — slabs slightly tilted, dashes mid-frame
        dashGroup.position.z = -0.4;
        slabMeshes.forEach((mesh, i) => {
          mesh.rotation.y += (mesh.userData.spin as number) * 0.4;
          mesh.position.y = (mesh.userData.baseY as number) + (i % 2 === 0 ? 0.08 : -0.05);
        });
        gates.forEach((g, i) => {
          g.rotation.z = i * 0.2;
        });
      }

      renderer.render(scene, camera);
    };

    if (reduced) {
      // One rich static 3D frame — still feels like a world, not an empty void
      paintFrame(0.8, false);
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
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      disposables.forEach((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
        }
      });
      pGeo.dispose();
      materials.forEach((m) => m.dispose());
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
