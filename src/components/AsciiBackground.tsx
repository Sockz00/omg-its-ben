import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import rawSettings from '@/data/background.json';
import { cameraDistanceForViewport, normalizeBackgroundSettings } from '@/lib/ascii-settings';
import { usePreview } from './PreviewContext';

const savedSettings = normalizeBackgroundSettings(rawSettings);

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.geometry.dispose();
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((material) => {
      for (const value of Object.values(material)) {
        if (value instanceof THREE.Texture) value.dispose();
      }
      material.dispose();
    });
  });
}

export function AsciiBackground() {
  const preview = usePreview();
  const settings = preview?.settings ?? savedSettings;
  const modelUrl = preview?.modelUrl || settings.model;
  const modelName = preview?.modelName || settings.model;
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    window.dispatchEvent(new Event('ascii-settings-change'));
  }, [settings]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !settings.enabled) return;
    const output = canvas.getContext('2d');
    if (!output) return;

    let renderer: THREE.WebGLRenderer | undefined;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' });
      renderer.setPixelRatio(1);
      renderer.setClearColor(0x000000, 0);
    } catch {
      // A small 2D fallback keeps a background visible when WebGL is unavailable.
    }
    const sampleCanvas = document.createElement('canvas');
    const sample = sampleCanvas.getContext('2d', { willReadFrequently: true });
    const scene = new THREE.Scene();
    const ambient = new THREE.AmbientLight(0xffffff, settings.ambientIntensity);
    scene.add(ambient);
    const light = new THREE.DirectionalLight(0xffffff, settings.lightIntensity);
    light.position.set(3, 5, 6);
    scene.add(light);
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.z = 4.8;
    const pivot = new THREE.Group();
    pivot.position.set(settings.offsetX, settings.offsetY, 0);
    scene.add(pivot);
    let object: THREE.Object3D = new THREE.Mesh(
      new THREE.TorusKnotGeometry(0.72, 0.24, 120, 16),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8, wireframe: settings.wireframe }),
    );
    pivot.add(object);
    let mixer: THREE.AnimationMixer | undefined;
    let active = true;
    let frame = 0;
    let cols = 0;
    let rows = 0;
    let charWidth = 0;
    let lineHeight = 0;
    let lastDraw = 0;
    let previousFrame = 0;
    let elapsed = 0;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const resize = () => {
      const settings = settingsRef.current;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      output.setTransform(dpr, 0, 0, dpr, 0, 0);
      const fontSize = Math.max(settings.fontSize, width / 240 / 0.6, height / 130 / 1.25);
      output.font = `${fontSize}px monospace`;
      output.textBaseline = 'top';
      charWidth = output.measureText('M').width;
      lineHeight = fontSize * 1.25;
      cols = Math.max(1, Math.ceil(width / charWidth));
      rows = Math.max(1, Math.ceil(height / lineHeight));
      sampleCanvas.width = cols;
      sampleCanvas.height = rows;
      renderer?.setSize(cols, rows, false);
      camera.aspect = width / Math.max(1, height);
      camera.position.z = cameraDistanceForViewport(width, height);
      camera.updateProjectionMatrix();
      draw();
    };

    const draw = () => {
      if (!active || !cols || !rows) return;
      const settings = settingsRef.current;
      const width = window.innerWidth;
      const height = window.innerHeight;
      output.clearRect(0, 0, width, height);
      if (settings.backgroundColor) {
        output.globalAlpha = 1;
        output.fillStyle = settings.backgroundColor;
        output.fillRect(0, 0, width, height);
      }
      output.fillStyle = settings.color;
      output.globalAlpha = settings.opacity;
      const ramp = settings.characters;
      ambient.intensity = settings.ambientIntensity;
      light.intensity = settings.lightIntensity;
      pivot.position.set(settings.offsetX, settings.offsetY, 0);
      pivot.rotation.set(settings.tiltX + elapsed * settings.rotationX, settings.tiltY + elapsed * settings.rotationY, elapsed * settings.rotationZ);
      pivot.scale.setScalar(settings.scale);

      let pixels: Uint8ClampedArray | undefined;
      if (renderer && sample) {
        renderer.render(scene, camera);
        sample.clearRect(0, 0, cols, rows);
        sample.drawImage(renderer.domElement, 0, 0);
        pixels = sample.getImageData(0, 0, cols, rows).data;
      }
      for (let y = 0; y < rows; y++) {
        let line = '';
        for (let x = 0; x < cols; x++) {
          let shade = -1;
          if (pixels) {
            const i = (y * cols + x) * 4;
            if (pixels[i + 3] > 16) shade = (0.2126 * pixels[i] + 0.7152 * pixels[i + 1] + 0.0722 * pixels[i + 2]) / 255;
          } else {
            const nx = (x * charWidth - width / 2 - settings.offsetX * height / 3.3) / (height * 0.29 * settings.scale);
            const ny = (y * lineHeight - height / 2 + settings.offsetY * height / 3.3) / (height * 0.24 * settings.scale);
            const radius = Math.sqrt(nx * nx + ny * ny);
            if (radius > 0.4 && radius < 1) shade = Math.max(0.1, 0.5 + 0.4 * Math.sin(nx * 5 + ny * 3 + elapsed));
          }
          if (shade < 0) line += ' ';
          else {
            const index = Math.min(ramp.length - 1, Math.floor((settings.invert ? 1 - shade : shade) * ramp.length));
            line += ramp[index];
          }
        }
        output.fillText(line, 0, y * lineHeight);
      }
      output.globalAlpha = 1;
    };

    const tick = (now: number) => {
      frame = 0;
      if (!active || document.hidden || motion.matches) return;
      if (previousFrame) {
        const delta = Math.min((now - previousFrame) / 1000, 0.1);
        elapsed += delta;
        mixer?.update(delta * settingsRef.current.animationSpeed);
      }
      previousFrame = now;
      if (now - lastDraw >= 50) { draw(); lastDraw = now; }
      frame = requestAnimationFrame(tick);
    };
    const restart = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      previousFrame = 0;
      draw();
      if (!document.hidden && !motion.matches) frame = requestAnimationFrame(tick);
    };

    if (renderer && modelUrl) {
      const load = modelName.toLowerCase().endsWith('.stl')
        ? new STLLoader().loadAsync(modelUrl).then((geometry) => ({
            model: new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 })),
            animations: [] as THREE.AnimationClip[],
          }))
        : new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(modelUrl).then((gltf) => ({ model: gltf.scene, animations: gltf.animations }));
      load.then(({ model, animations }) => {
        if (!active) { disposeObject(model); return; }
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const largest = Math.max(size.x, size.y, size.z);
        if (!Number.isFinite(largest) || largest <= 0) { disposeObject(model); return; }
        const center = box.getCenter(new THREE.Vector3());
        const holder = new THREE.Group();
        model.position.sub(center);
        holder.add(model);
        holder.scale.setScalar(2 / largest);
        if (settings.wireframe) model.traverse((child) => {
          if (!(child instanceof THREE.Mesh)) return;
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach((material) => { if ('wireframe' in material) material.wireframe = true; });
        });
        pivot.remove(object);
        disposeObject(object);
        object = holder;
        pivot.add(object);
        if (settings.playModelAnimation && animations.length) {
          mixer = new THREE.AnimationMixer(model);
          const clip = animations.find((candidate) => candidate.name === settings.animationClip) ?? animations[0];
          mixer.clipAction(clip).play();
        }
        restart();
      }).catch((error: unknown) => { console.warn('Could not load the background model; using the built-in shape.', error); });
    }

    resize();
    restart();
    window.addEventListener('resize', resize);
    window.addEventListener('ascii-settings-change', resize);
    document.addEventListener('visibilitychange', restart);
    motion.addEventListener('change', restart);
    return () => {
      active = false;
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('ascii-settings-change', resize);
      document.removeEventListener('visibilitychange', restart);
      motion.removeEventListener('change', restart);
      mixer?.stopAllAction();
      disposeObject(object);
      renderer?.dispose();
      renderer?.forceContextLoss();
    };
  }, [settings.enabled, settings.wireframe, settings.animationClip, settings.playModelAnimation, modelUrl, modelName]);

  return settings.enabled ? <canvas ref={canvasRef} className="ascii-animation" aria-hidden="true" /> : null;
}
