"use client";

import { useRef, useMemo, useEffect, useState, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Edges } from "@react-three/drei";
import * as THREE from "three";

// --- Types ---

interface ShapeConfig {
  id: string;
  type: "hexPrism" | "stackedCubes" | "layeredDisc" | "steppedBlocks" | "octahedron" | "torus";
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  color: string;
  opacity: number;
  parallaxDepth: number;
  rotationSpeed: [number, number, number];
}

// --- Shape palette matching the blob (purple-400, pink-300, orange-300) ---

const WARM_COLORS = ["#c084fc", "#f9a8d4", "#fdba74", "#e879f9", "#fb923c"];

// --- Shape definitions scattered in the left/right gutters ---

const SHAPE_CONFIGS: ShapeConfig[] = [
  // Left side shapes
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
  // Right side shapes
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
  // Additional accent shapes (further out)
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

// Reduced config for tablet screens
const TABLET_SHAPE_IDS = [
  "hex-left",
  "steps-right",
  "octa-right",
  "disc-left",
];

// --- Individual Shape Components ---

function HexPrism({ color, opacity }: { color: string; opacity: number }) {
  return (
    <mesh>
      <cylinderGeometry args={[1, 1, 1.2, 6]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      <Edges threshold={15} color={color} lineWidth={1}>
        <lineBasicMaterial
          color={color}
          transparent
          opacity={opacity}
          depthWrite={false}
        />
      </Edges>
    </mesh>
  );
}

function StackedCubes({ color, opacity }: { color: string; opacity: number }) {
  const positions: [number, number, number][] = [
    [0, 0.6, 0],
    [0, -0.6, 0],
    [0.5, 0, 0.5],
    [-0.5, 0, -0.5],
  ];
  return (
    <group>
      {positions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <boxGeometry args={[0.6, 0.6, 0.6]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          <Edges threshold={15} color={color} lineWidth={1}>
            <lineBasicMaterial
              color={color}
              transparent
              opacity={opacity}
              depthWrite={false}
            />
          </Edges>
        </mesh>
      ))}
    </group>
  );
}

function LayeredDisc({ color, opacity }: { color: string; opacity: number }) {
  const layers = 4;
  return (
    <group>
      {Array.from({ length: layers }).map((_, i) => (
        <mesh key={i} position={[0, (i - (layers - 1) / 2) * 0.35, 0]}>
          <cylinderGeometry args={[1 - i * 0.12, 1 - i * 0.12, 0.12, 16]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          <Edges threshold={15} color={color} lineWidth={1}>
            <lineBasicMaterial
              color={color}
              transparent
              opacity={opacity}
              depthWrite={false}
            />
          </Edges>
        </mesh>
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
  const steps = 5;
  return (
    <group>
      {Array.from({ length: steps }).map((_, i) => (
        <mesh key={i} position={[i * 0.35, i * 0.35, 0]}>
          <boxGeometry args={[0.8, 0.3, 0.6]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          <Edges threshold={15} color={color} lineWidth={1}>
            <lineBasicMaterial
              color={color}
              transparent
              opacity={opacity}
              depthWrite={false}
            />
          </Edges>
        </mesh>
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
  return (
    <mesh>
      <octahedronGeometry args={[1, 0]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      <Edges threshold={15} color={color} lineWidth={1}>
        <lineBasicMaterial
          color={color}
          transparent
          opacity={opacity}
          depthWrite={false}
        />
      </Edges>
    </mesh>
  );
}

function TorusShape({ color, opacity }: { color: string; opacity: number }) {
  return (
    <mesh>
      <torusGeometry args={[0.8, 0.25, 8, 16]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      <Edges threshold={15} color={color} lineWidth={1}>
        <lineBasicMaterial
          color={color}
          transparent
          opacity={opacity}
          depthWrite={false}
        />
      </Edges>
    </mesh>
  );
}

// --- Shape Renderer ---

function ShapeRenderer({
  config,
}: {
  config: ShapeConfig;
}) {
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
      return <OctahedronShape color={config.color} opacity={config.opacity} />;
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

    // Smooth parallax offset based on mouse
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

    // Apply position with parallax offset
    groupRef.current.position.x =
      config.position[0] + currentOffset.current.x;
    groupRef.current.position.y =
      config.position[1] + currentOffset.current.y;

    // Subtle continuous rotation
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

// --- Scene that tracks mouse and renders shapes ---

function Scene({ shapes }: { shapes: ShapeConfig[] }) {
  const mouse = useRef({ x: 0, y: 0 });
  const { size } = useThree();

  const handlePointerMove = useCallback(
    (e: THREE.Event & { clientX?: number; clientY?: number }) => {
      // Normalize mouse position to [-1, 1]
      const event = e as unknown as PointerEvent;
      mouse.current.x = (event.clientX / size.width) * 2 - 1;
      mouse.current.y = -(event.clientY / size.height) * 2 + 1;
    },
    [size.width, size.height]
  );

  // Also listen on window so we pick up mouse even when pointer-events: none
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <group onPointerMove={handlePointerMove}>
      {shapes.map((config) => (
        <AnimatedShape key={config.id} config={config} mouse={mouse} />
      ))}
    </group>
  );
}

// --- Main Component ---

export default function GeometricBackground() {
  const [breakpoint, setBreakpoint] = useState<
    "mobile" | "tablet" | "desktop"
  >("desktop");

  useEffect(() => {
    const checkBreakpoint = () => {
      const w = window.innerWidth;
      if (w < 768) setBreakpoint("mobile");
      else if (w < 1024) setBreakpoint("tablet");
      else setBreakpoint("desktop");
    };
    checkBreakpoint();
    window.addEventListener("resize", checkBreakpoint);
    return () => window.removeEventListener("resize", checkBreakpoint);
  }, []);

  const shapes = useMemo(() => {
    if (breakpoint === "mobile") return [];
    if (breakpoint === "tablet")
      return SHAPE_CONFIGS.filter((s) => TABLET_SHAPE_IDS.includes(s.id));
    return SHAPE_CONFIGS;
  }, [breakpoint]);

  // Don't render anything on mobile
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
