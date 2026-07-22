"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Cinematic vanishing-track WebGL world — depth, tunnel speed, horizon punch.
 * Original abstract scene (not team IP). Papaya on void.
 */
export function CinematicTrack() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const w = mount.clientWidth || window.innerWidth;
    const h = mount.clientHeight || window.innerHeight;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h, false);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.cssText =
      "position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;";
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030303, 0.032);

    const camera = new THREE.PerspectiveCamera(58, w / h, 0.1, 160);
    camera.position.set(0, 1.6, 8.5);

    const root = new THREE.Group();
    scene.add(root);

    const ribbonMats = [
      new THREE.MeshBasicMaterial({
        color: 0xff5a1f,
        transparent: true,
        opacity: 0.72,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
      new THREE.MeshBasicMaterial({
        color: 0xf5f2eb,
        transparent: true,
        opacity: 0.28,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
      new THREE.MeshBasicMaterial({
        color: 0xff7a3d,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    ];

    const ribbons: THREE.Mesh[] = [];
    const offsets = [-3.2, -1.8, -0.7, 0, 0.7, 1.8, 3.2];
    offsets.forEach((xOff, i) => {
      const points: THREE.Vector3[] = [];
      for (let z = 22; z >= -36; z -= 0.9) {
        const t = (22 - z) / 58;
        const sway = Math.sin(t * Math.PI * 2.1 + i * 0.55) * (0.2 + t * 0.55);
        const rise = -0.35 + t * 1.35 + Math.sin(t * 4 + i) * 0.08;
        points.push(new THREE.Vector3(xOff * (1 - t * 0.9) + sway, rise, z));
      }
      const curve = new THREE.CatmullRomCurve3(points);
      const radius = i === 3 ? 0.04 : i % 2 === 0 ? 0.018 : 0.012;
      const geo = new THREE.TubeGeometry(curve, 140, radius, 6, false);
      const mesh = new THREE.Mesh(geo, ribbonMats[i % ribbonMats.length]);
      root.add(mesh);
      ribbons.push(mesh);
    });

    // Dash markers racing toward camera (depth cue)
    const dashGroup = new THREE.Group();
    root.add(dashGroup);
    const dashMat = new THREE.MeshBasicMaterial({
      color: 0xff5a1f,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    for (let i = 0; i < 48; i++) {
      const dash = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.01, 0.55), dashMat);
      const lane = (i % 3) - 1;
      dash.position.set(lane * 0.85, -0.28, -i * 1.4);
      dashGroup.add(dash);
    }

    // Horizon sun / punch disc
    const horizonGeo = new THREE.CircleGeometry(4.4, 64);
    const horizonMat = new THREE.MeshBasicMaterial({
      color: 0xff5a1f,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const horizon = new THREE.Mesh(horizonGeo, horizonMat);
    horizon.position.set(0, 0.85, -28);
    root.add(horizon);

    const ringGeo = new THREE.RingGeometry(2.2, 3.6, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xff5a1f,
      transparent: true,
      opacity: 0.14,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.copy(horizon.position);
    ring.position.z += 0.2;
    root.add(ring);

    // Dense particle volume
    const count = 900;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 22;
      positions[i * 3 + 1] = Math.random() * 8 - 0.8;
      positions[i * 3 + 2] = Math.random() * -55 + 10;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xf5f2eb,
      size: 0.045,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const points = new THREE.Points(pGeo, pMat);
    root.add(points);

    // Side wall planes for tunnel feel
    const wallMat = new THREE.MeshBasicMaterial({
      color: 0xff5a1f,
      transparent: true,
      opacity: 0.04,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    [-1, 1].forEach((side) => {
      const wall = new THREE.Mesh(new THREE.PlaneGeometry(60, 10), wallMat);
      wall.position.set(side * 5.5, 1.2, -8);
      wall.rotation.y = side * 0.35;
      root.add(wall);
    });

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(50, 70),
      new THREE.MeshBasicMaterial({
        color: 0x050505,
        transparent: true,
        opacity: 0.75,
      })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.42;
    ground.position.z = -10;
    root.add(ground);

    let raf = 0;
    let running = true;
    const clock = new THREE.Clock();
    let targetParallaxX = 0;
    let targetParallaxY = 0;
    let parallaxX = 0;
    let parallaxY = 0;
    let scrollBoost = 0;

    const onPointer = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      targetParallaxX = nx * 0.55;
      targetParallaxY = ny * 0.28;
    };

    const onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      scrollBoost = Math.min(1, window.scrollY / max);
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

    const tick = () => {
      if (!running) return;
      const t = clock.getElapsedTime();
      parallaxX += (targetParallaxX - parallaxX) * 0.05;
      parallaxY += (targetParallaxY - parallaxY) * 0.05;

      const speed = 3.4 + scrollBoost * 2.2;
      root.position.z = ((t * speed) % 14) - 3;
      dashGroup.position.z = ((t * speed * 1.6) % 4.2) - 1;
      root.rotation.y = parallaxX * 0.16;
      root.rotation.x = -0.1 + parallaxY * 0.08 - scrollBoost * 0.16;
      camera.position.x = parallaxX * 0.55;
      camera.position.y = 1.55 + parallaxY * 0.22 + scrollBoost * 0.45;
      camera.lookAt(0, 0.5 + scrollBoost * 0.25, -14);

      horizon.material.opacity = 0.12 + Math.sin(t * 0.85) * 0.06;
      ring.material.opacity = 0.1 + Math.sin(t * 1.1) * 0.05;
      ring.rotation.z = t * 0.15;
      points.rotation.y = t * 0.03;

      for (let i = 0; i < ribbons.length; i++) {
        ribbons[i].rotation.z = Math.sin(t * 0.4 + i) * 0.02;
      }

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      ribbons.forEach((m) => {
        m.geometry.dispose();
        (m.material as THREE.Material).dispose();
      });
      dashGroup.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
        }
      });
      dashMat.dispose();
      horizonGeo.dispose();
      horizonMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      pGeo.dispose();
      pMat.dispose();
      wallMat.dispose();
      ground.geometry.dispose();
      (ground.material as THREE.Material).dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="cinematic-canvas" aria-hidden="true" />;
}
