"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/**
 * Abstract chrome / glass sculpture — twisted ribbon, crystal prism, glass orbs, lime orbits.
 * Floating void (no product pedestal). Impossible to read as a helmet/head.
 * No external GLB.
 */
export function CinematicTrack({ intensity = "full" }: { intensity?: "full" | "quiet" | "stage" }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const narrow = window.matchMedia("(max-width: 767px)").matches;
    const hero = intensity === "full";
    const quiet = intensity === "quiet";
    let w = mount.clientWidth || window.innerWidth;
    let h = mount.clientHeight || window.innerHeight;
    let visible = true;
    let raf = 0;
    let running = true;

    const bg = 0x0c0c0c;
    const maxDpr = narrow ? 1.25 : 2;

    const renderer = new THREE.WebGLRenderer({
      antialias: !narrow,
      alpha: false,
      powerPreference: narrow ? "low-power" : "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
    renderer.setSize(w, h, false);
    renderer.setClearColor(bg, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9;
    renderer.shadowMap.enabled = !narrow;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // Hero CTAs sit above; canvas only captures orbit on wider viewports
    const allowOrbit = hero && !narrow && !reduced;
    renderer.domElement.style.cssText = allowOrbit
      ? "position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:auto;touch-action:none;cursor:grab;"
      : "position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;touch-action:auto;cursor:default;";
    mount.appendChild(renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    const scene = new THREE.Scene();
    scene.environment = envTex;
    scene.background = new THREE.Color(bg);
    scene.fog = new THREE.FogExp2(bg, quiet ? 0.048 : 0.02);

    const camera = new THREE.PerspectiveCamera(hero ? 38 : 34, w / h, 0.1, 60);
    const camBase = hero
      ? { x: 0.15, y: 0.4, z: 6.4 }
      : { x: 0.05, y: 0.25, z: 4.8 };
    camera.position.set(camBase.x, camBase.y, camBase.z);

    const root = new THREE.Group();
    scene.add(root);
    const stage = new THREE.Group();
    // Keep sculpture on the right so the brand mark stays readable
    stage.position.set(hero ? 1.95 : 0, hero ? 0.12 : 0, 0);
    root.add(stage);

    // Soft studio — metal reads chrome, no white clay flood
    scene.add(new THREE.AmbientLight(0x9aa29a, 0.18));
    const key = new THREE.DirectionalLight(0xffefe2, 1.15);
    key.position.set(5, 7, 4);
    key.castShadow = !narrow;
    if (!narrow) {
      key.shadow.mapSize.set(1024, 1024);
      key.shadow.camera.near = 0.5;
      key.shadow.camera.far = 30;
      key.shadow.camera.left = -10;
      key.shadow.camera.right = 10;
      key.shadow.camera.top = 10;
      key.shadow.camera.bottom = -10;
      key.shadow.bias = -0.0003;
    }
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x6a8098, 0.38);
    fill.position.set(-6, 1.2, 3);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xc8ff00, 0.32);
    rim.position.set(-2, 3, -6);
    scene.add(rim);

    const materials: THREE.Material[] = [];
    const geometries: THREE.BufferGeometry[] = [];
    const floaters: THREE.Object3D[] = [];

    const track = (geo: THREE.BufferGeometry, mat: THREE.Material) => {
      geometries.push(geo);
      materials.push(mat);
    };

    // Soft dark ground plane — large, low-contrast, NOT a circular product pedestal
    const groundGeo = new THREE.PlaneGeometry(18, 18);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0a0a0a,
      metalness: 0.55,
      roughness: 0.82,
      envMapIntensity: 0.25,
    });
    track(groundGeo, groundMat);
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.85;
    ground.receiveShadow = true;
    stage.add(ground);

    const cluster = new THREE.Group();
    stage.add(cluster);

    // ── Chrome twisted ribbon (Tube along helix) — unmistakably abstract ──
    const helixPts: THREE.Vector3[] = [];
    for (let i = 0; i <= 160; i++) {
      const t = i / 160;
      const a = t * Math.PI * 2 * 3.25;
      const r = 0.95 + Math.sin(t * Math.PI * 2) * 0.18;
      helixPts.push(
        new THREE.Vector3(Math.cos(a) * r, (t - 0.5) * 2.85, Math.sin(a) * r * 0.72)
      );
    }
    const helixCurve = new THREE.CatmullRomCurve3(helixPts);
    const ribbonGeo = new THREE.TubeGeometry(helixCurve, 220, 0.11, 10, false);
    const chromeMat = new THREE.MeshPhysicalMaterial({
      color: 0xc8ccd2,
      metalness: 1,
      roughness: 0.14,
      clearcoat: 0.7,
      clearcoatRoughness: 0.18,
      envMapIntensity: 1.25,
    });
    track(ribbonGeo, chromeMat);
    const ribbon = new THREE.Mesh(ribbonGeo, chromeMat);
    ribbon.castShadow = true;
    ribbon.receiveShadow = true;
    ribbon.position.set(-0.15, 0.2, 0);
    ribbon.rotation.set(0.15, 0.35, -0.08);
    cluster.add(ribbon);
    floaters.push(ribbon);

    // ── Vertical crystal / prism ──
    const prismGeo = new THREE.CylinderGeometry(0.18, 0.28, 2.35, 6, 1, false);
    const prismMat = new THREE.MeshPhysicalMaterial({
      color: 0xdde4ea,
      metalness: 0.15,
      roughness: 0.06,
      transmission: 0.55,
      thickness: 1.4,
      ior: 1.55,
      transparent: true,
      opacity: 1,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      envMapIntensity: 1.35,
    });
    track(prismGeo, prismMat);
    const prism = new THREE.Mesh(prismGeo, prismMat);
    prism.castShadow = true;
    prism.position.set(0.55, 0.25, -0.35);
    prism.rotation.y = Math.PI / 12;
    cluster.add(prism);
    floaters.push(prism);

    // Prism tip accents (octahedra)
    const tipGeo = new THREE.OctahedronGeometry(0.22, 0);
    const tipMat = new THREE.MeshPhysicalMaterial({
      color: 0xb8c0c8,
      metalness: 0.95,
      roughness: 0.12,
      envMapIntensity: 1.2,
    });
    track(tipGeo, tipMat);
    const tipTop = new THREE.Mesh(tipGeo, tipMat);
    tipTop.position.set(0.55, 1.55, -0.35);
    tipTop.castShadow = true;
    cluster.add(tipTop);
    floaters.push(tipTop);
    const tipBot = tipTop.clone();
    tipBot.position.set(0.55, -1.05, -0.35);
    tipBot.rotation.z = Math.PI;
    cluster.add(tipBot);

    // ── Floating glass spheres ──
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xeaf0ec,
      metalness: 0.02,
      roughness: 0.05,
      transmission: 0.78,
      thickness: 1.1,
      ior: 1.45,
      transparent: true,
      opacity: 1,
      envMapIntensity: 1.3,
    });
    materials.push(glassMat);

    const orbSpecs = [
      { r: 0.58, x: hero ? -1.55 : -1.25, y: 0.95, z: 0.7, seg: 48 },
      { r: 0.32, x: 1.35, y: -0.35, z: 0.95, seg: 40 },
      { r: 0.22, x: -0.85, y: -0.75, z: -0.9, seg: 32 },
    ];
    const orbs: THREE.Mesh[] = [];
    orbSpecs.forEach((spec) => {
      const geo = new THREE.SphereGeometry(spec.r, spec.seg, spec.seg);
      geometries.push(geo);
      const mesh = new THREE.Mesh(geo, glassMat);
      mesh.castShadow = true;
      mesh.position.set(spec.x, spec.y, spec.z);
      mesh.userData.baseY = spec.y;
      mesh.userData.float = true;
      mesh.userData.spin = 0.35;
      cluster.add(mesh);
      orbs.push(mesh);
      floaters.push(mesh);
    });

    // Small chrome bead
    const beadGeo = new THREE.SphereGeometry(0.16, 32, 32);
    const beadMat = new THREE.MeshPhysicalMaterial({
      color: 0xa8a49c,
      metalness: 1,
      roughness: 0.1,
      clearcoat: 0.5,
      envMapIntensity: 1.2,
    });
    track(beadGeo, beadMat);
    const bead = new THREE.Mesh(beadGeo, beadMat);
    bead.castShadow = true;
    bead.position.set(1.05, 1.15, 0.35);
    bead.userData.baseY = 1.15;
    bead.userData.float = true;
    bead.userData.spin = 0.55;
    cluster.add(bead);
    floaters.push(bead);

    // ── Thin lime orbit rings ──
    const limeMat = new THREE.MeshStandardMaterial({
      color: 0xc8ff00,
      emissive: 0xc8ff00,
      emissiveIntensity: 0.35,
      metalness: 0.4,
      roughness: 0.35,
      envMapIntensity: 0.7,
    });
    materials.push(limeMat);

    const orbitRingSpecs = [
      { r: 1.55, tube: 0.012, rx: Math.PI / 2.35, ry: 0.25, rz: 0, y: 0.15 },
      { r: 1.15, tube: 0.01, rx: 0.55, ry: 1.1, rz: 0.4, y: 0.4 },
      { r: 1.85, tube: 0.008, rx: 1.35, ry: -0.4, rz: 0.2, y: -0.1 },
    ];
    const limeRings: THREE.Mesh[] = [];
    orbitRingSpecs.forEach((spec) => {
      const geo = new THREE.TorusGeometry(spec.r, spec.tube, 12, 96);
      geometries.push(geo);
      const mesh = new THREE.Mesh(geo, limeMat);
      mesh.rotation.set(spec.rx, spec.ry, spec.rz);
      mesh.position.y = spec.y;
      cluster.add(mesh);
      limeRings.push(mesh);
      floaters.push(mesh);
    });

    // Chrome torus knot accent — secondary, clearly knot-shaped
    const knotGeo = new THREE.TorusKnotGeometry(0.42, 0.1, 140, 16, 2, 3);
    const knotMat = new THREE.MeshPhysicalMaterial({
      color: 0xb4b8be,
      metalness: 1,
      roughness: 0.16,
      clearcoat: 0.6,
      clearcoatRoughness: 0.2,
      envMapIntensity: 1.2,
    });
    track(knotGeo, knotMat);
    const knot = new THREE.Mesh(knotGeo, knotMat);
    knot.castShadow = true;
    knot.position.set(-1.05, -0.15, 0.15);
    knot.rotation.set(0.8, 0.3, 0.5);
    cluster.add(knot);
    floaters.push(knot);

    if (hero || intensity === "stage") {
      const specs = [
        { geo: new THREE.OctahedronGeometry(0.12, 0), x: -1.75, y: 0.45, z: -0.55, spin: 0.7, lime: true },
        { geo: new THREE.BoxGeometry(0.14, 0.14, 0.14), x: 1.55, y: 0.75, z: -0.65, spin: -0.55, lime: false },
        { geo: new THREE.IcosahedronGeometry(0.11, 0), x: 0.15, y: 1.55, z: 0.85, spin: 0.85, lime: false },
      ];
      specs.forEach((spec) => {
        const mat = new THREE.MeshStandardMaterial({
          color: spec.lime ? 0xc8ff00 : 0xb0aea8,
          metalness: 0.95,
          roughness: 0.18,
          emissive: spec.lime ? 0xc8ff00 : 0x000000,
          emissiveIntensity: spec.lime ? 0.2 : 0,
          envMapIntensity: 1.1,
        });
        track(spec.geo, mat);
        const mesh = new THREE.Mesh(spec.geo, mat);
        mesh.position.set(spec.x, spec.y, spec.z);
        mesh.castShadow = true;
        mesh.userData.spin = spec.spin;
        mesh.userData.baseY = spec.y;
        mesh.userData.float = true;
        cluster.add(mesh);
        floaters.push(mesh);
      });
    }

    const canvas = renderer.domElement;
    let orbitX = 0.4;
    let orbitY = -0.06;
    let targetOrbitX = 0.4;
    let targetOrbitY = -0.06;
    let dragging = false;
    let lastPtrX = 0;
    let lastPtrY = 0;
    let parallaxX = 0;
    let parallaxY = 0;
    let targetParallaxX = 0;
    let targetParallaxY = 0;
    const look = new THREE.Vector3(hero ? 1.05 : 0, 0.15, 0);
    const clock = new THREE.Clock();

    const onPointer = (e: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      targetParallaxX = (((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1) * 0.55;
      targetParallaxY = (((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1) * 0.32;
    };

    const onDown = (e: PointerEvent) => {
      if (!allowOrbit || reduced) return;
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
        -2.0,
        Math.min(2.2, targetOrbitX + ((e.clientX - lastPtrX) / window.innerWidth) * 4.2)
      );
      targetOrbitY = Math.max(
        -0.75,
        Math.min(0.75, targetOrbitY + ((e.clientY - lastPtrY) / window.innerHeight) * 2.5)
      );
      lastPtrX = e.clientX;
      lastPtrY = e.clientY;
    };

    const onResize = () => {
      w = mount.clientWidth || window.innerWidth;
      h = mount.clientHeight || window.innerHeight;
      const isNarrow = w < 768;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isNarrow ? 1.25 : 2));
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
    if (allowOrbit) {
      window.addEventListener("pointermove", onPointer, { passive: true });
    }
    window.addEventListener("resize", onResize);

    const paint = (t: number, animate: boolean) => {
      parallaxX += (targetParallaxX - parallaxX) * (animate ? 0.07 : 1);
      parallaxY += (targetParallaxY - parallaxY) * (animate ? 0.07 : 1);
      orbitX += (targetOrbitX - orbitX) * (animate ? 0.1 : 1);
      orbitY += (targetOrbitY - orbitY) * (animate ? 0.1 : 1);

      cluster.rotation.y = orbitX + (animate ? t * 0.09 : 0);
      cluster.rotation.x = orbitY * 0.55;
      cluster.position.y = Math.sin(animate ? t * 0.65 : 0) * 0.06;

      ribbon.rotation.y = 0.35 + (animate ? t * 0.12 : 0);
      prism.rotation.y = Math.PI / 12 + (animate ? t * 0.18 : 0);
      tipTop.rotation.y = animate ? t * 0.4 : 0;
      tipBot.rotation.y = animate ? -t * 0.35 : 0;
      knot.rotation.x = 0.8 + (animate ? t * 0.28 : 0);
      knot.rotation.y = 0.3 + (animate ? t * 0.35 : 0);

      limeRings.forEach((ring, i) => {
        ring.rotation.z = (animate ? t : 0) * (0.12 + i * 0.08) * (i % 2 === 0 ? 1 : -1);
      });

      orbs.forEach((orb, i) => {
        const baseY = orb.userData.baseY as number;
        orb.position.y = baseY + Math.sin((animate ? t : 0) * (0.9 + i * 0.15) + i) * 0.1;
      });

      floaters.forEach((obj, i) => {
        if (!obj.userData.float) return;
        const spin = obj.userData.spin as number;
        const baseY = obj.userData.baseY as number;
        obj.rotation.x = animate ? t * spin : 0;
        obj.rotation.y = animate ? t * spin * 0.85 : 0;
        obj.position.y = baseY + Math.sin((animate ? t : 0) * 1.05 + i) * 0.09;
      });

      stage.rotation.y = parallaxX * 0.12;
      stage.rotation.x = -parallaxY * 0.08;

      camera.position.x = camBase.x + parallaxX * 0.4 + orbitX * 0.06;
      camera.position.y = camBase.y + parallaxY * 0.28;
      camera.position.z = camBase.z;
      look.set((hero ? 1.05 : 0) + parallaxX * 0.08, 0.15, 0);
      camera.lookAt(look);

      renderer.render(scene, camera);
    };

    if (reduced) {
      const freeze = window.setTimeout(() => paint(1, false), 400);
      return () => {
        running = false;
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
      if (allowOrbit) {
        window.removeEventListener("pointermove", onPointer);
      }
      window.removeEventListener("resize", onResize);
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
      if (mountRef.current && renderer.domElement.parentElement === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    }

    return () => {
      running = false;
      cleanup();
    };
  }, [intensity]);

  return <div ref={mountRef} className="cinematic-canvas" aria-hidden="true" />;
}
