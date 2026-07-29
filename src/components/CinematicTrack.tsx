"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/**
 * Abstract chrome / glass sculpture cluster — dark studio, drag orbit.
 * No helmet. No external GLB.
 */
export function CinematicTrack({ intensity = "full" }: { intensity?: "full" | "quiet" | "stage" }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hero = intensity === "full";
    const quiet = intensity === "quiet";
    let w = mount.clientWidth || window.innerWidth;
    let h = mount.clientHeight || window.innerHeight;
    let disposed = false;
    let visible = true;
    let raf = 0;
    let running = true;

    const bg = 0x0c0c0c;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h, false);
    renderer.setClearColor(bg, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.92;
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
    scene.fog = new THREE.FogExp2(bg, quiet ? 0.045 : 0.022);

    const camera = new THREE.PerspectiveCamera(hero ? 40 : 36, w / h, 0.1, 60);
    const camBase = hero
      ? { x: 0.55, y: 0.35, z: 5.6 }
      : { x: 0.1, y: 0.2, z: 4.4 };
    camera.position.set(camBase.x, camBase.y, camBase.z);

    const root = new THREE.Group();
    scene.add(root);
    const stage = new THREE.Group();
    stage.position.set(hero ? 1.35 : 0, hero ? 0.05 : 0, 0);
    root.add(stage);

    // Soft studio — metal reads, no bleach
    scene.add(new THREE.AmbientLight(0xa8b0a4, 0.22));
    const key = new THREE.DirectionalLight(0xfff1e4, 1.35);
    key.position.set(4.5, 6.5, 3.5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 28;
    key.shadow.camera.left = -8;
    key.shadow.camera.right = 8;
    key.shadow.camera.top = 8;
    key.shadow.camera.bottom = -8;
    key.shadow.bias = -0.0003;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x7a90a8, 0.42);
    fill.position.set(-5, 1.5, 2);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xc8ff00, 0.38);
    rim.position.set(-2.5, 2.5, -5);
    scene.add(rim);

    const materials: THREE.Material[] = [];
    const geometries: THREE.BufferGeometry[] = [];
    const floaters: THREE.Object3D[] = [];

    const track = (geo: THREE.BufferGeometry, mat: THREE.Material) => {
      geometries.push(geo);
      materials.push(mat);
    };

    // Soft contact disc
    const pedGeo = new THREE.CircleGeometry(2.4, 64);
    const pedMat = new THREE.MeshStandardMaterial({
      color: 0x141414,
      metalness: 0.7,
      roughness: 0.55,
      envMapIntensity: 0.55,
    });
    track(pedGeo, pedMat);
    const ped = new THREE.Mesh(pedGeo, pedMat);
    ped.rotation.x = -Math.PI / 2;
    ped.position.y = -1.35;
    ped.receiveShadow = true;
    stage.add(ped);

    const ringGeo = new THREE.TorusGeometry(1.65, 0.01, 12, 96);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xc8ff00,
      emissive: 0xc8ff00,
      emissiveIntensity: 0.28,
      metalness: 0.35,
      roughness: 0.45,
    });
    track(ringGeo, ringMat);
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -1.32;
    stage.add(ring);

    const cluster = new THREE.Group();
    stage.add(cluster);

    // Hero knot — chrome
    const knotGeo = new THREE.TorusKnotGeometry(0.85, 0.28, 180, 24);
    const chromeMat = new THREE.MeshPhysicalMaterial({
      color: 0xc4c8ce,
      metalness: 1,
      roughness: 0.18,
      clearcoat: 0.55,
      clearcoatRoughness: 0.2,
      envMapIntensity: 1.15,
    });
    track(knotGeo, chromeMat);
    const knot = new THREE.Mesh(knotGeo, chromeMat);
    knot.castShadow = true;
    knot.receiveShadow = true;
    knot.position.set(0, 0.15, 0);
    knot.rotation.set(0.35, 0.4, 0.15);
    cluster.add(knot);
    floaters.push(knot);

    // Glass orb
    const orbGeo = new THREE.IcosahedronGeometry(0.55, 2);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xe8ece8,
      metalness: 0.05,
      roughness: 0.08,
      transmission: 0.72,
      thickness: 0.9,
      ior: 1.45,
      transparent: true,
      opacity: 1,
      envMapIntensity: 1.2,
    });
    track(orbGeo, glassMat);
    const orb = new THREE.Mesh(orbGeo, glassMat);
    orb.castShadow = true;
    orb.position.set(hero ? -1.35 : -1.1, 0.85, 0.55);
    cluster.add(orb);
    floaters.push(orb);

    // Smaller chrome sphere
    const ballGeo = new THREE.SphereGeometry(0.32, 48, 48);
    const ballMat = new THREE.MeshStandardMaterial({
      color: 0xb8b4ac,
      metalness: 0.98,
      roughness: 0.14,
      envMapIntensity: 1.2,
    });
    track(ballGeo, ballMat);
    const ball = new THREE.Mesh(ballGeo, ballMat);
    ball.castShadow = true;
    ball.position.set(1.15, -0.15, 0.85);
    cluster.add(ball);
    floaters.push(ball);

    // Lime-rim ring (vertical)
    const accentRingGeo = new THREE.TorusGeometry(0.72, 0.028, 16, 80);
    const accentRingMat = new THREE.MeshStandardMaterial({
      color: 0xc8ff00,
      emissive: 0xc8ff00,
      emissiveIntensity: 0.22,
      metalness: 0.55,
      roughness: 0.3,
      envMapIntensity: 0.9,
    });
    track(accentRingGeo, accentRingMat);
    const accentRing = new THREE.Mesh(accentRingGeo, accentRingMat);
    accentRing.position.set(0.95, 0.95, -0.4);
    accentRing.rotation.set(1.1, 0.3, 0.5);
    cluster.add(accentRing);
    floaters.push(accentRing);

    // Thin orbit ring
    const orbitGeo = new THREE.TorusGeometry(1.35, 0.012, 12, 96);
    const orbitMat = new THREE.MeshStandardMaterial({
      color: 0x9aa3ab,
      metalness: 0.95,
      roughness: 0.25,
      envMapIntensity: 1.1,
    });
    track(orbitGeo, orbitMat);
    const orbit = new THREE.Mesh(orbitGeo, orbitMat);
    orbit.rotation.set(Math.PI / 2.4, 0.2, 0);
    orbit.position.y = 0.2;
    cluster.add(orbit);
    floaters.push(orbit);

    if (hero || intensity === "stage") {
      const specs = [
        { geo: new THREE.OctahedronGeometry(0.16, 0), x: -1.6, y: -0.2, z: 0.9, spin: 0.6, lime: false },
        { geo: new THREE.IcosahedronGeometry(0.14, 0), x: 1.45, y: 1.15, z: -0.55, spin: -0.45, lime: true },
        { geo: new THREE.BoxGeometry(0.2, 0.2, 0.2), x: -0.55, y: 1.35, z: 0.75, spin: 0.75, lime: false },
      ];
      specs.forEach((spec) => {
        const mat = new THREE.MeshStandardMaterial({
          color: spec.lime ? 0xc8ff00 : 0xb0aea8,
          metalness: 0.95,
          roughness: 0.2,
          emissive: spec.lime ? 0xc8ff00 : 0x000000,
          emissiveIntensity: spec.lime ? 0.16 : 0,
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
    let orbitX = 0.35;
    let orbitY = -0.08;
    let targetOrbitX = 0.35;
    let targetOrbitY = -0.08;
    let dragging = false;
    let lastPtrX = 0;
    let lastPtrY = 0;
    let parallaxX = 0;
    let parallaxY = 0;
    let targetParallaxX = 0;
    let targetParallaxY = 0;
    const look = new THREE.Vector3(hero ? 1.15 : 0, 0.1, 0);
    const clock = new THREE.Clock();

    const onPointer = (e: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      targetParallaxX = (((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1) * 0.55;
      targetParallaxY = (((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1) * 0.32;
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
        -1.9,
        Math.min(2.1, targetOrbitX + ((e.clientX - lastPtrX) / window.innerWidth) * 4.2)
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
      parallaxX += (targetParallaxX - parallaxX) * (animate ? 0.07 : 1);
      parallaxY += (targetParallaxY - parallaxY) * (animate ? 0.07 : 1);
      orbitX += (targetOrbitX - orbitX) * (animate ? 0.1 : 1);
      orbitY += (targetOrbitY - orbitY) * (animate ? 0.1 : 1);

      cluster.rotation.y = orbitX + (animate ? t * 0.1 : 0);
      cluster.rotation.x = orbitY * 0.55;
      cluster.position.y = Math.sin(animate ? t * 0.7 : 0) * 0.05;
      ring.rotation.z = animate ? t * 0.1 : 0;

      knot.rotation.x = 0.35 + (animate ? t * 0.15 : 0);
      knot.rotation.y = 0.4 + (animate ? t * 0.22 : 0);
      orb.position.y = 0.85 + Math.sin(animate ? t * 1.1 : 0) * 0.1;
      ball.position.y = -0.15 + Math.cos(animate ? t * 0.9 : 0) * 0.08;
      accentRing.rotation.z = animate ? t * 0.35 : 0;
      orbit.rotation.z = animate ? t * -0.18 : 0;

      floaters.forEach((obj, i) => {
        if (!obj.userData.float) return;
        const spin = obj.userData.spin as number;
        const baseY = obj.userData.baseY as number;
        obj.rotation.x = animate ? t * spin : 0;
        obj.rotation.y = animate ? t * spin * 0.85 : 0;
        obj.position.y = baseY + Math.sin((animate ? t : 0) * 1.05 + i) * 0.09;
      });

      // Soft magnetic lean toward pointer
      stage.rotation.y = parallaxX * 0.12;
      stage.rotation.x = -parallaxY * 0.08;

      camera.position.x = camBase.x + parallaxX * 0.4 + orbitX * 0.06;
      camera.position.y = camBase.y + parallaxY * 0.28;
      camera.position.z = camBase.z;
      look.set((hero ? 1.15 : 0) + parallaxX * 0.08, 0.1, 0);
      camera.lookAt(look);

      renderer.render(scene, camera);
    };

    if (reduced) {
      const freeze = window.setTimeout(() => paint(1, false), 400);
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
