"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type Intensity = "full" | "quiet";

/**
 * Cinematic vanishing-track WebGL world — dense ribbons, tunnel walls,
 * racing dashes, horizon punch, particle volume. Papaya on void.
 */
export function CinematicTrack({ intensity = "full" }: { intensity?: Intensity }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const quiet = intensity === "quiet";
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
    scene.fog = new THREE.FogExp2(0x030303, quiet ? 0.045 : 0.026);

    const camera = new THREE.PerspectiveCamera(quiet ? 52 : 62, w / h, 0.1, 180);
    camera.position.set(0, quiet ? 1.35 : 1.75, quiet ? 7.2 : 9.2);

    const root = new THREE.Group();
    scene.add(root);

    const ribbonMats = [
      new THREE.MeshBasicMaterial({
        color: 0xff5a1f,
        transparent: true,
        opacity: quiet ? 0.55 : 0.88,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
      new THREE.MeshBasicMaterial({
        color: 0xf5f2eb,
        transparent: true,
        opacity: quiet ? 0.22 : 0.42,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
      new THREE.MeshBasicMaterial({
        color: 0xff7a3d,
        transparent: true,
        opacity: quiet ? 0.32 : 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
      new THREE.MeshBasicMaterial({
        color: 0xff3d0a,
        transparent: true,
        opacity: quiet ? 0.28 : 0.48,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    ];

    const ribbons: THREE.Mesh[] = [];
    const offsets = quiet
      ? [-2.6, -1.4, -0.5, 0, 0.5, 1.4, 2.6]
      : [-4.2, -3.1, -2.0, -1.1, -0.45, 0, 0.45, 1.1, 2.0, 3.1, 4.2];
    offsets.forEach((xOff, i) => {
      const points: THREE.Vector3[] = [];
      for (let z = 26; z >= -48; z -= 0.7) {
        const t = (26 - z) / 74;
        const sway = Math.sin(t * Math.PI * 2.4 + i * 0.48) * (0.28 + t * 0.7);
        const rise = -0.4 + t * 1.55 + Math.sin(t * 4.2 + i) * 0.1;
        points.push(new THREE.Vector3(xOff * (1 - t * 0.88) + sway, rise, z));
      }
      const curve = new THREE.CatmullRomCurve3(points);
      const mid = Math.floor(offsets.length / 2);
      const radius = i === mid ? (quiet ? 0.05 : 0.07) : i % 2 === 0 ? 0.028 : 0.016;
      const geo = new THREE.TubeGeometry(curve, quiet ? 120 : 180, radius, 7, false);
      const mesh = new THREE.Mesh(geo, ribbonMats[i % ribbonMats.length]);
      root.add(mesh);
      ribbons.push(mesh);
    });

    // Racing dash markers
    const dashGroup = new THREE.Group();
    root.add(dashGroup);
    const dashMat = new THREE.MeshBasicMaterial({
      color: 0xff5a1f,
      transparent: true,
      opacity: quiet ? 0.5 : 0.78,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const dashCount = quiet ? 42 : 96;
    for (let i = 0; i < dashCount; i++) {
      const dash = new THREE.Mesh(
        new THREE.BoxGeometry(0.05 + (i % 3) * 0.02, 0.012, 0.45 + (i % 4) * 0.12),
        dashMat
      );
      const lane = (i % 5) - 2;
      dash.position.set(lane * 0.72, -0.32 + (i % 2) * 0.04, -i * 0.95);
      dashGroup.add(dash);
    }

    // Secondary lane dashes (cream)
    const dashMatAlt = new THREE.MeshBasicMaterial({
      color: 0xf5f2eb,
      transparent: true,
      opacity: quiet ? 0.18 : 0.32,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    for (let i = 0; i < (quiet ? 18 : 40); i++) {
      const dash = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.008, 0.35), dashMatAlt);
      dash.position.set(((i % 2) * 2 - 1) * 1.55, -0.2, -i * 1.8 - 0.5);
      dashGroup.add(dash);
    }

    // Horizon sun / punch disc — strong enough to read in screenshots
    const horizonGeo = new THREE.CircleGeometry(quiet ? 3.6 : 5.6, 64);
    const horizonMat = new THREE.MeshBasicMaterial({
      color: 0xff5a1f,
      transparent: true,
      opacity: quiet ? 0.28 : 0.42,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const horizon = new THREE.Mesh(horizonGeo, horizonMat);
    horizon.position.set(0, 0.95, -30);
    root.add(horizon);

    const coreGeo = new THREE.CircleGeometry(quiet ? 1.2 : 1.8, 48);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xff8a4a,
      transparent: true,
      opacity: quiet ? 0.22 : 0.38,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.copy(horizon.position);
    core.position.z += 0.15;
    root.add(core);

    const ringGeo = new THREE.RingGeometry(2.4, 4.4, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xff5a1f,
      transparent: true,
      opacity: quiet ? 0.18 : 0.32,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.copy(horizon.position);
    ring.position.z += 0.25;
    root.add(ring);

    // Tunnel gate rings along Z
    const gateMat = new THREE.MeshBasicMaterial({
      color: 0xff5a1f,
      transparent: true,
      opacity: quiet ? 0.1 : 0.18,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const gates: THREE.Mesh[] = [];
    for (let i = 0; i < (quiet ? 5 : 9); i++) {
      const gate = new THREE.Mesh(new THREE.RingGeometry(2.8, 3.15, 48), gateMat);
      gate.position.set(0, 0.6, -4 - i * 5.5);
      gate.rotation.x = Math.PI * 0.08;
      root.add(gate);
      gates.push(gate);
    }

    // Dense particle volume
    const count = quiet ? 700 : 1600;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 28;
      positions[i * 3 + 1] = Math.random() * 10 - 1.2;
      positions[i * 3 + 2] = Math.random() * -70 + 14;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xf5f2eb,
      size: quiet ? 0.05 : 0.065,
      transparent: true,
      opacity: quiet ? 0.45 : 0.7,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const points = new THREE.Points(pGeo, pMat);
    root.add(points);

    // Ember particles (papaya)
    const emberCount = quiet ? 180 : 420;
    const emberPos = new Float32Array(emberCount * 3);
    for (let i = 0; i < emberCount; i++) {
      emberPos[i * 3] = (Math.random() - 0.5) * 16;
      emberPos[i * 3 + 1] = Math.random() * 6 - 0.4;
      emberPos[i * 3 + 2] = Math.random() * -55 + 8;
    }
    const eGeo = new THREE.BufferGeometry();
    eGeo.setAttribute("position", new THREE.BufferAttribute(emberPos, 3));
    const eMat = new THREE.PointsMaterial({
      color: 0xff5a1f,
      size: quiet ? 0.06 : 0.09,
      transparent: true,
      opacity: quiet ? 0.4 : 0.65,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const embers = new THREE.Points(eGeo, eMat);
    root.add(embers);

    // Side wall planes + grid lines for tunnel feel
    const wallMat = new THREE.MeshBasicMaterial({
      color: 0xff5a1f,
      transparent: true,
      opacity: quiet ? 0.06 : 0.1,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    [-1, 1].forEach((side) => {
      const wall = new THREE.Mesh(new THREE.PlaneGeometry(70, 12), wallMat);
      wall.position.set(side * (quiet ? 4.8 : 6.2), 1.4, -10);
      wall.rotation.y = side * 0.42;
      root.add(wall);
    });

    const wallLineMat = new THREE.LineBasicMaterial({
      color: 0xff5a1f,
      transparent: true,
      opacity: quiet ? 0.18 : 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const wallLines: THREE.Line[] = [];
    for (let s = -1; s <= 1; s += 2) {
      for (let i = 0; i < (quiet ? 8 : 14); i++) {
        const pts = [
          new THREE.Vector3(s * 4.2, -0.3, 8 - i * 4),
          new THREE.Vector3(s * 5.8, 3.2, 8 - i * 4 - 2),
        ];
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        const line = new THREE.Line(geo, wallLineMat);
        root.add(line);
        wallLines.push(line);
      }
    }

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 90),
      new THREE.MeshBasicMaterial({
        color: 0x060606,
        transparent: true,
        opacity: 0.82,
      })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.45;
    ground.position.z = -12;
    root.add(ground);

    // Center guide stripe
    const stripe = new THREE.Mesh(
      new THREE.PlaneGeometry(0.12, 80),
      new THREE.MeshBasicMaterial({
        color: 0xff5a1f,
        transparent: true,
        opacity: quiet ? 0.2 : 0.35,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    stripe.rotation.x = -Math.PI / 2;
    stripe.position.set(0, -0.43, -12);
    root.add(stripe);

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
      targetParallaxX = nx * (quiet ? 0.35 : 0.7);
      targetParallaxY = ny * (quiet ? 0.18 : 0.35);
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
      parallaxX += (targetParallaxX - parallaxX) * 0.06;
      parallaxY += (targetParallaxY - parallaxY) * 0.06;

      const speed = (quiet ? 2.6 : 4.2) + scrollBoost * 2.8;
      root.position.z = ((t * speed) % 16) - 4;
      dashGroup.position.z = ((t * speed * 1.85) % 5.2) - 1.2;
      root.rotation.y = parallaxX * 0.18;
      root.rotation.x = -0.12 + parallaxY * 0.1 - scrollBoost * 0.18;
      camera.position.x = parallaxX * 0.7;
      camera.position.y = (quiet ? 1.35 : 1.7) + parallaxY * 0.28 + scrollBoost * 0.5;
      camera.lookAt(0, 0.55 + scrollBoost * 0.3, -16);

      horizonMat.opacity = (quiet ? 0.24 : 0.36) + Math.sin(t * 0.9) * 0.1;
      coreMat.opacity = (quiet ? 0.18 : 0.3) + Math.sin(t * 1.2) * 0.08;
      ringMat.opacity = (quiet ? 0.14 : 0.26) + Math.sin(t * 1.15) * 0.08;
      ring.rotation.z = t * 0.22;
      points.rotation.y = t * 0.04;
      embers.rotation.y = -t * 0.055;
      embers.position.z = Math.sin(t * 0.35) * 1.2;

      for (let i = 0; i < ribbons.length; i++) {
        ribbons[i].rotation.z = Math.sin(t * 0.45 + i) * 0.028;
      }
      for (let i = 0; i < gates.length; i++) {
        gates[i].rotation.z = t * (0.08 + i * 0.01);
        const gm = gates[i].material as THREE.MeshBasicMaterial;
        gm.opacity = (quiet ? 0.08 : 0.14) + Math.sin(t * 1.4 + i) * 0.06;
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
      dashMatAlt.dispose();
      horizonGeo.dispose();
      horizonMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      gates.forEach((g) => {
        g.geometry.dispose();
      });
      gateMat.dispose();
      pGeo.dispose();
      pMat.dispose();
      eGeo.dispose();
      eMat.dispose();
      wallMat.dispose();
      wallLines.forEach((l) => l.geometry.dispose());
      wallLineMat.dispose();
      ground.geometry.dispose();
      (ground.material as THREE.Material).dispose();
      stripe.geometry.dispose();
      (stripe.material as THREE.Material).dispose();
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
