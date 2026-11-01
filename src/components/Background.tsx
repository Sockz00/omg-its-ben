import { useEffect, useRef, useState } from "react";

const MODEL_URLS = [2, 3, 4, 5, 6, 7, 8].map(
  (model) => `https://raw.githubusercontent.com/maximiliankaspar/ascii-animation/main/models/model${model}.stl`,
);

/** 12-column helper grid, toggled with shift + g (easter egg from the original). */
export function GridOverlay() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key.toLowerCase() === "g") {
        e.preventDefault();
        ref.current?.classList.toggle("is-visible");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="gridlayout-invisible" ref={ref} aria-hidden="true">
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} className="gridlayout-column" />
      ))}
    </div>
  );
}

/** 10px pixel grid at 4% opacity – line count is generated from the viewport like the original script. */
function PixelGrid() {
  const [counts, setCounts] = useState({ h: 4, v: 4 });

  useEffect(() => {
    const gap = 10;
    const lineWidth = 0.1;
    const compute = () =>
      setCounts({
        h: Math.floor((window.innerWidth + gap) / (lineWidth + gap)),
        v: Math.floor((window.innerHeight + gap) / (lineWidth + gap)),
      });
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  return (
    <div className="background_pixelgrid" aria-hidden="true">
      <div className="bg-flex_vertical">
        {Array.from({ length: counts.v }, (_, i) => (
          <div key={i} className="line_vertical" />
        ))}
      </div>
      <div className="bg-flex_horizontal">
        {Array.from({ length: counts.h }, (_, i) => (
          <div key={i} className="line_horizontal" />
        ))}
      </div>
    </div>
  );
}

/** Three.js ASCII scene, based on maximiliankaspar/ascii-animation's main.js. */
function AsciiAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let disposed = false;
    let frame = 0;
    let renderer: { dispose: () => void } | undefined;
    let effect: { domElement: HTMLElement; setSize: (width: number, height: number) => void; render: (scene: unknown, camera: unknown) => void } | undefined;
    let scene: { add: (object: unknown) => void } | undefined;
    let camera: { aspect: number; updateProjectionMatrix: () => void } | undefined;
    let mesh: { rotation: { z: number } } | undefined;

    // Load Three.js in the browser so the site's existing dependency tree stays small.
    const load = async () => {
      try {
        const threeUrl = "https://esm.sh/three@0.158.0";
        const [THREE, { STLLoader }, { AsciiEffect }] = await Promise.all([
          import(/* @vite-ignore */ threeUrl),
          import(/* @vite-ignore */ `${threeUrl}/examples/jsm/loaders/STLLoader.js`),
          import(/* @vite-ignore */ `${threeUrl}/examples/jsm/effects/AsciiEffect.js`),
        ]);
        if (disposed || !containerRef.current) return;

        const activeScene = new THREE.Scene();
        scene = activeScene;
        const activeCamera = new THREE.PerspectiveCamera(5, window.innerWidth / window.innerHeight, 1, 1000);
        camera = activeCamera;
        activeCamera.position.set(0, 100, 0);
        activeCamera.lookAt(0, 0, 0);
        activeCamera.up.set(0, 0, 1);

        const activeRenderer = new THREE.WebGLRenderer({ alpha: false, antialias: true });
        renderer = activeRenderer;
        activeRenderer.setClearColor(0xffffff);
        const activeEffect = new AsciiEffect(activeRenderer, " .:-=+*1#%@0$!*", { invert: false, resolution: 0.2 });
        effect = activeEffect;
        activeEffect.domElement.style.color = "#ADADAD";
        activeEffect.domElement.style.backgroundColor = "white";
        activeEffect.domElement.setAttribute("aria-hidden", "true");
        containerRef.current.replaceChildren(activeEffect.domElement);

        const resize = () => {
          if (!containerRef.current) return;
          const width = containerRef.current.clientWidth || window.innerWidth;
          const height = containerRef.current.clientHeight || window.innerHeight;
          activeCamera.aspect = width / height;
          activeCamera.updateProjectionMatrix();
          activeRenderer.setSize(width, height);
          activeEffect.setSize(width, height);
        };
        resize();
        window.addEventListener("resize", resize);

        const animate = () => {
          if (disposed) return;
          frame = window.requestAnimationFrame(animate);
          if (mesh) mesh.rotation.z += 0.001;
          activeEffect.render(activeScene, activeCamera);
        };

        const modelURL = MODEL_URLS[Math.floor(Math.random() * MODEL_URLS.length)];
        new STLLoader().load(modelURL, (geometry: InstanceType<typeof THREE.BufferGeometry>) => {
          if (disposed) {
            geometry.dispose();
            return;
          }
          geometry.computeBoundingBox();
          const bounds = geometry.boundingBox!;
          const offsetX = (bounds.max.x + bounds.min.x) / 2;
          const offsetY = (bounds.max.y + bounds.min.y) / 2;
          const height = bounds.max.z - bounds.min.z;
          const offsetZ = bounds.min.z + height / 1.7;
          geometry.translate(-offsetX, -offsetY, -offsetZ);
          const activeMesh = new THREE.Mesh(geometry, new THREE.MeshNormalMaterial());
          mesh = activeMesh;
          activeMesh.rotation.set(Math.PI, 0, 0);
          activeScene.add(activeMesh);
          animate();
        });

        return () => window.removeEventListener("resize", resize);
      } catch (error) {
        if (!disposed) console.error("Could not load the ASCII animation", error);
      }
    };

    let removeResize: (() => void) | undefined;
    void load().then((cleanup) => { removeResize = cleanup; });
    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      removeResize?.();
      renderer?.dispose();
      effect?.domElement.remove();
    };
  }, []);

  return (
    <div className="ascii-animation" ref={containerRef} aria-hidden="true" />
  );
}

export function Background() {
  return (
    <>
      <div className="background-gridlines" aria-hidden="true">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="grid-line" />
        ))}
      </div>
      <PixelGrid />
      <AsciiAnimation />
    </>
  );
}

