'use client';

import { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, useProgress, Html, Center } from '@react-three/drei';

// Set decoder path for DRACO compression models
useGLTF.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');

interface Hotspot3D {
  id: string;
  category: 'aero' | 'engine';
  position: [number, number, number];
  title: string;
  desc: string;
  metric: string;
  unit: string;
  valueRange: [number, number];
  color: string;
}

const HOTSPOTS_3D: Hotspot3D[] = [
  // Aerodynamics (Teal/Cyan)
  {
    id: 'front-wing',
    category: 'aero',
    position: [0, -0.1, 1.8],
    title: 'Outwash Front Wing',
    desc: 'Directs high-velocity airflow around the front tyres, minimizing wake turbulence.',
    metric: 'DF-LEVEL',
    unit: 'N',
    valueRange: [1800, 2200],
    color: '#27F4D2',
  },
  {
    id: 'venturi-tunnels',
    category: 'aero',
    position: [0, -0.22, 0],
    title: 'Venturi Underfloor Tunnels',
    desc: 'Generates massive ground-effect downforce, pulling the chassis flat to the tarmac.',
    metric: 'TUNNEL-P',
    unit: 'kPa',
    valueRange: [-45, -35],
    color: '#27F4D2',
  },
  {
    id: 'rear-wing',
    category: 'aero',
    position: [0, 0.45, -1.6],
    title: 'DRS Active Rear Wing',
    desc: 'Reduces drag by opening the upper wing flap on straightaways, boosting velocity by 10-12 km/h.',
    metric: 'DRAG-COEFF',
    unit: 'Cd',
    valueRange: [0.120, 0.450],
    color: '#27F4D2',
  },
  // Power Unit (Red/Crimson)
  {
    id: 'sidepod-intake',
    category: 'engine',
    position: [0.45, -0.05, 0.2],
    title: 'Sidepod Radiator Airflow',
    desc: 'Feeds clean ambient air into internal radiators for hybrid cooling efficiency.',
    metric: 'COOLING-FLOW',
    unit: 'L/s',
    valueRange: [180, 220],
    color: '#C9201A',
  },
  {
    id: 'airbox',
    category: 'engine',
    position: [0, 0.28, -0.4],
    title: 'V6 Turbocharger Plenums',
    desc: 'Compresses high-velocity combustion air directly into the twin-stage compressor.',
    metric: 'BOOST-P',
    unit: 'bar',
    valueRange: [3.80, 4.20],
    color: '#C9201A',
  },
  {
    id: 'mgu-k',
    category: 'engine',
    position: [0, -0.15, -0.9],
    title: 'Kinetic Recovery (MGU-K)',
    desc: 'Recovers kinetic energy under braking, delivering 120kW (160hp) of instant electric boost.',
    metric: 'SOC-REGEN',
    unit: '%',
    valueRange: [40, 95],
    color: '#C9201A',
  },
];

function Model() {
  const { scene } = useGLTF('/ferrari_sf-25.glb');
  
  // Enable shadow casting and receiving for the model meshes
  useEffect(() => {
    scene.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  return <primitive object={scene} />;
}

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center bg-black/90 p-6 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-md w-64 text-center font-mono">
        <span className="text-accent text-[0.65rem] font-bold tracking-[0.25em] mb-3 animate-pulse">
          LOADING TELEMETRY MODEL
        </span>
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-2">
          <div 
            className="h-full bg-accent transition-all duration-300 shadow-[0_0_8px_#C9201A]" 
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-white text-xs font-bold tabular-nums">
          {Math.round(progress)}%
        </span>
      </div>
    </Html>
  );
}

interface ThreeCarSceneProps {
  hoveredGroup: 'aero' | 'engine' | null;
  telemetry: Record<string, number>;
  scrollProgress?: number;
}

export default function ThreeCarScene({ hoveredGroup, telemetry, scrollProgress = 0 }: ThreeCarSceneProps) {
  const [hoveredHotspot, setHoveredHotspot] = useState<string | null>(null);

  // Map scroll progress to a 288-degree spin (1.6 * PI) to reveal all angles of the car
  const rotationY = scrollProgress * Math.PI * 1.6;

  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [2.5, 0.8, 3.2], fov: 32 }}
        gl={{ antialias: true, alpha: true }}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Studio Lights (Neutral and bright to show natural car colors) */}
        <ambientLight intensity={1.2} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={2.0} 
          castShadow 
          shadow-mapSize={2048}
        />
        <directionalLight 
          position={[-10, 6, -5]} 
          intensity={1.0} 
          color="#ffffff"
        />
        <pointLight position={[0, 6, 2]} intensity={1.5} />

        <Suspense fallback={<Loader />}>
          <group scale={0.65} position={[0, -0.05, 0]} rotation={[0, rotationY, 0]}>
            <Center position={[0, 0, 0]}>
              <Model />
            </Center>

            {/* Render 3D Hotspots */}
            {HOTSPOTS_3D.map((hotspot) => {
              const isGroupHovered = hoveredGroup === hotspot.category;
              const isSelfHovered = hoveredHotspot === hotspot.id;
              const scaleMultiplier = isSelfHovered ? 1.6 : isGroupHovered ? 1.3 : 1.0;
              
              return (
                <mesh 
                  key={hotspot.id} 
                  position={hotspot.position}
                  onPointerOver={(e) => {
                    e.stopPropagation();
                    setHoveredHotspot(hotspot.id);
                  }}
                  onPointerOut={() => setHoveredHotspot(null)}
                >
                  {/* 3D Pulse Sphere */}
                  <sphereGeometry args={[0.045 * scaleMultiplier, 16, 16]} />
                  <meshBasicMaterial 
                    color={hotspot.color} 
                    transparent
                    opacity={0.8}
                  />

                  {/* Outer Ring */}
                  <mesh>
                    <torusGeometry args={[0.07 * scaleMultiplier, 0.006, 8, 24]} />
                    <meshBasicMaterial color={hotspot.color} transparent opacity={0.4} />
                  </mesh>

                  {/* Floating HTML Tooltip overlay */}
                  {isSelfHovered && (
                    <Html distanceFactor={4.5} center zIndexRange={[50, 100]}>
                      <div 
                        className="w-72 rounded-xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-md font-sans pointer-events-none select-none"
                        style={{ 
                          transform: 'translateY(-20px)',
                          backgroundColor: '#111111',
                          color: '#ffffff',
                          border: '1px solid rgba(255, 255, 255, 0.15)'
                        }}
                      >
                        <div className="flex items-center justify-between border-b border-white/[0.08] pb-1.5 mb-2 font-mono text-[0.6rem]">
                          <span 
                            className="uppercase tracking-wider font-bold"
                            style={{ color: hotspot.color }}
                          >
                            {hotspot.category === 'aero' ? 'Aerodynamics' : 'Power Unit'}
                          </span>
                          <div className="flex items-center gap-1 text-zinc-400">
                            <span>{hotspot.metric}:</span>
                            <span className="text-white font-bold tabular-nums">
                              {telemetry[hotspot.id]}
                            </span>
                            <span>{hotspot.unit}</span>
                          </div>
                        </div>
                        <h4 className="font-display text-sm font-bold uppercase tracking-wide mb-1 text-white">
                          {hotspot.title}
                        </h4>
                        <p className="text-[0.65rem] text-zinc-300 leading-relaxed font-light">
                          {hotspot.desc}
                        </p>
                        {/* Arrow tail */}
                        <div 
                          className="absolute bottom-[-4px] left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-r border-b border-white/10"
                          style={{
                            backgroundColor: '#111111'
                          }}
                        />
                      </div>
                    </Html>
                  )}
                </mesh>
              );
            })}
          </group>
        </Suspense>

        <OrbitControls 
          enableZoom={false} 
          autoRotate={false} 
          maxPolarAngle={Math.PI / 1.9}
          minPolarAngle={Math.PI / 4}
        />
      </Canvas>
      
      {/* 3D Orbit Tip Overlay */}
      <div className="absolute bottom-4 right-4 bg-black/75 px-3 py-1.5 text-[0.55rem] font-mono uppercase tracking-[0.15em] text-white/60 rounded border border-white/5 pointer-events-none select-none z-10">
        Drag to Orbit 3D
      </div>
    </div>
  );
}
