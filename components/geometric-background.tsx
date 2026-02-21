"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// --- Types ---

interface ShapeConfig {
  id: string;
  type:
    | "hexPrism"
    | "stackedCubes"
    | "layeredDisc"
    | "steppedBlocks"
    | "octahedron"
    | "torus";
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  color: string;
  opacity: number;
  parallaxDepth: number;
  rotationSpeed: [number, number, number];
}

// --- Shape palette matching the blob (warm tones) ---

const WARM_COLORS = ["#c084fc", "#f9a8d4", "#fdba74", "#e879f9", "#fb923c"];

// --- Shape definitions scattered in left/right gutters ---

const SHAPE_CONFIGS: ShapeConfig[] = [
  {
    id: "hex-left",
    type: "hexPrism",
    position: [-5.5, 2.0, -2],
    rotation: [0.3, 0.5, 0.1],
    scale: 0.9,
    color: WARM_COLORS[0],
    opacity: 0.18,
    parallaxDepth: 0.8,
    rotationSpeed: [0.001, 0.002, 0.0005],
  },
  {
    id: "cubes-left",
    type: "stackedCubes",
    position: [-4.8, -1.8, -1],
    rotation: [0.2, 0.8, 0],
    scale: 0.7,
    color: WARM_COLORS[1],
    opacity: 0.15,
    parallaxDepth: 1.2,
    rotationSpeed: [0.0015, 0.001, 0.002],
  },
  {
    id: "disc-left",
    type: "layeredDisc",
    position: [-6.0, 0, -3],
    rotation: [0.5, 0.2, 0.3],
    scale: 0.8,
    color: WARM_COLORS[2],
    opacity: 0.12,
    parallaxDepth: 0.5,
    rotationSpeed: [0.0008, 0.0015, 0.001],
  },
  {
    id: "steps-right",
    type: "steppedBlocks",
    position: [5.5, 1.5, -2],
    rotation: [0.1, -0.4, 0.2],
    scale: 0.8,
    color: WARM_COLORS[3],
    opacity: 0.16,
    parallaxDepth: 1.0,
    rotationSpeed: [0.001, 0.0012, 0.0008],
  },
  {
    id: "octa-right",
    type: "octahedron",
    position: [5.0, -2.0, -1.5],
    rotation: [0.4, 0.6, 0.1],
    scale: 0.85,
    color: WARM_COLORS[4],
    opacity: 0.14,
    parallaxDepth: 1.4,
    rotationSpeed: [0.002, 0.001, 0.0015],
  },
  {
    id: "torus-right",
    type: "torus",
    position: [6.0, 0.2, -2.5],
    rotation: [0.6, 0.3, 0],
    scale: 0.75,
    color: WARM_COLORS[0],
    opacity: 0.13,
    parallaxDepth: 0.6,
    rotationSpeed: [0.0012, 0.0008, 0.002],
  },
  {
    id: "hex-right-far",
    type: "hexPrism",
    position: [4.2, 3.0, -3.5],
    rotation: [0.7, 0.1, 0.4],
    scale: 0.5,
    color: WARM_COLORS[2],
    opacity: 0.1,
    parallaxDepth: 0.4,
    rotationSpeed: [0.0005, 0.001, 0.0008],
  },
  {
    id: "octa-left-far",
    type: "octahedron",
    position: [-4.0, -3.2, -3],
    rotation: [0.2, 0.5, 0.7],
    scale: 0.55,
    color: WARM_COLORS[1],
    opacity: 0.1,
    parallaxDepth: 0.35,
    rotationSpeed: [0.001, 0.0005, 0.0012],
  },
];

const TABLET_SHAPE_IDS = ["hex-left", "steps-right", "octa-right", "disc-left"];

// --- Wireframe shape using native Three.js EdgesGeometry ---

function WireframeEdges({
  geometry,
  color,
  opacity,
}: {
  geometry: THREE.BufferGeometry;
  color: string;
  opacity: number;
}) {
  const edgesGeo = useMemo(
    () => new THREE.EdgesGeometry(geometry, 15),
    [geometry]
  );

  return (
    <lineSegments geometry={edgesGeo}>
      <lineBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </lineSegments>
  );
}

// --- Individual Shape Components ---

function HexPrism({ color, opacity }: { color: string; opacity: number }) {
  const geo = useMemo(() => new THREE.CylinderGeometry(1, 1, 1.2, 6), []);
  return <WireframeEdges geometry={geo} color={color} opacity={opacity} />;
}

function StackedCubes({ color, opacity }: { color: string; opacity: number }) {
  const geo = useMemo(() => new THREE.BoxGeometry(0.6, 0.6, 0.6), []);
  const positions: [number, number, number][] = useMemo(
    () => [
      [0, 0.6, 0],
      [0, -0.6, 0],
      [0.5, 0, 0.5],
      [-0.5, 0, -0.5],
    ],
    []
  );

  return (
    <group>
      {positions.map((pos, i) => (
        <group key={i} position={pos}>
          <WireframeEdges geometry={geo} color={color} opacity={opacity} />
        </group>
      ))}
    </group>
  );
}

function LayeredDisc({ color, opacity }: { color: string; opacity: number }) {
  const layers = 4;
  const geometries = useMemo(
    () =>
      Array.from(
        { length: layers },
        (_, i) =>
          new THREE.CylinderGeometry(1 - i * 0.12, 1 - i * 0.12, 0.12, 16)
      ),
    []
  );

  return (
    <group>
      {geometries.map((geo, i) => (
        <group key={i} position={[0, (i - (layers - 1) / 2) * 0.35, 0]}>
          <WireframeEdges geometry={geo} color={color} opacity={opacity} />
        </group>
      ))}
    </group>
  );
}

function SteppedBlocks({
  color,
  opacity,
}: {
  color: string;
  opacity: number;
}) {
  const geo = useMemo(() => new THREE.BoxGeometry(0.8, 0.3, 0.6), []);

  return (
    <group>
      {Array.from({ length: 5 }).map((_, i) => (
        <group key={i} position={[i * 0.35, i * 0.35, 0]}>
          <WireframeEdges geometry={geo} color={color} opacity={opacity} />
        </group>
      ))}
    </group>
  );
}

function OctahedronShape({
  color,
  opacity,
}: {
  color: string;
  opacity: number;
}) {
  const geo = useMemo(() => new THREE.OctahedronGeometry(1, 0), []);
  return <WireframeEdges geometry={geo} color={color} opacity={opacity} />;
}

function TorusShape({ color, opacity }: { color: string; opacity: number }) {
  const geo = useMemo(() => new THREE.TorusGeometry(0.8, 0.25, 8, 16), []);
  return <WireframeEdges geometry={geo} color={color} opacity={opacity} />;
}

// --- Shape Renderer ---

function ShapeRenderer({ config }: { config: ShapeConfig }) {
  switch (config.type) {
    case "hexPrism":
      return <HexPrism color={config.color} opacity={config.opacity} />;
    case "stackedCubes":
      return <StackedCubes color={config.color} opacity={config.opacity} />;
    case "layeredDisc":
      return <LayeredDisc color={config.color} opacity={config.opacity} />;
    case "steppedBlocks":
      return <SteppedBlocks color={config.color} opacity={config.opacity} />;
    case "octahedron":
      return (
        <OctahedronShape color={config.color} opacity={config.opacity} />
      );
    case "torus":
      return <TorusShape color={config.color} opacity={config.opacity} />;
    default:
      return null;
  }
}

// --- Animated Shape Wrapper with Parallax ---

function AnimatedShape({
  config,
  mouse,
}: {
  config: ShapeConfig;
  mouse: React.RefObject<{ x: number; y: number }>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const currentOffset = useRef({ x: 0, y: 0 });

  useFrame(() => {
    if (!groupRef.current || !mouse.current) return;

    const targetX = mouse.current.x * config.parallaxDepth * 0.3;
    const targetY = mouse.current.y * config.parallaxDepth * 0.3;

    currentOffset.current.x = THREE.MathUtils.lerp(
      currentOffset.current.x,
      targetX,
      0.05
    );
    currentOffset.current.y = THREE.MathUtils.lerp(
      currentOffset.current.y,
      targetY,
      0.05
    );

    groupRef.current.position.x =
      config.position[0] + currentOffset.current.x;
    groupRef.current.position.y =
      config.position[1] + currentOffset.current.y;

    groupRef.current.rotation.x += config.rotationSpeed[0];
    groupRef.current.rotation.y += config.rotationSpeed[1];
    groupRef.current.rotation.z += config.rotationSpeed[2];
  });

  return (
    <group
      ref={groupRef}
      position={config.position}
      rotation={config.rotation}
      scale={config.scale}
    >
      <ShapeRenderer config={config} />
    </group>
  );
}

// --- Scene ---

function Scene({ shapes }: { shapes: ShapeConfig[] }) {
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <>
      {shapes.map((config) => (
        <AnimatedShape key={config.id} config={config} mouse={mouse} />
      ))}
    </>
  );
}

// --- Main Component ---

export default function GeometricBackground() {
  const [breakpoint, setBreakpoint] = useState<
    "mobile" | "tablet" | "desktop"
  >("desktop");

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      if (w < 768) setBreakpoint("mobile");
      else if (w < 1024) setBreakpoint("tablet");
      else setBreakpoint("desktop");
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const shapes = useMemo(() => {
    if (breakpoint === "mobile") return [];
    if (breakpoint === "tablet")
      return SHAPE_CONFIGS.filter((s) => TABLET_SHAPE_IDS.includes(s.id));
    return SHAPE_CONFIGS;
  }, [breakpoint]);

  if (breakpoint === "mobile") return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-20"
      aria-hidden="true"
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 10], fov: 50 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        <Scene shapes={shapes} />
      </Canvas>
    </div>
  );
}
