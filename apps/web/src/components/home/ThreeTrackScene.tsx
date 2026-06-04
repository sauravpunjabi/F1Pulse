'use client';

import { Suspense, useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Html } from '@react-three/drei';
// @ts-ignore
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';
import * as THREE from 'three';
import { CIRCUIT_MAPS } from './StartLightsLoader';

interface ThreeTrackSceneProps {
  circuitId: string | undefined;
  circuitName: string | undefined;
}

const getCircuitKey = (id: string | undefined) => {
  if (!id) return 'monaco';
  const normalized = id.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  const matched = Object.keys(CIRCUIT_MAPS).find(key => 
    normalized.includes(key) || key.includes(normalized)
  );
  return matched || 'monaco';
};

function TrackOutline({ circuitId }: { circuitId: string | undefined }) {
  const points3d = useMemo(() => {
    const key = getCircuitKey(circuitId);
    const trackData = CIRCUIT_MAPS[key] || CIRCUIT_MAPS.monaco;
    if (!trackData) return [];
    const pathStr = trackData.path;
    
    try {
      const loader = new SVGLoader();
      const parsed = loader.parse(`<svg><path d="${pathStr}" /></svg>`);
      const path = parsed.paths[0];
      if (!path) return [];
      
      const shapes = path.toShapes(true);
      const points2d = shapes[0]?.getPoints() || [];
      if (points2d.length === 0) return [];
      
      // Compute bounding box to center and scale track
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      points2d.forEach((p: any) => {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      });
      
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      const sizeX = maxX - minX;
      const sizeY = maxY - minY;
      const maxDim = Math.max(sizeX, sizeY);
      
      const scale = 3.6 / maxDim; // scale to fit nicely in the view
      
      const pts = points2d.map((p: any) => new THREE.Vector3(
        (p.x - centerX) * scale,
        0.05, // raised slightly in empty space
        (p.y - centerY) * scale
      ));
      
      // Close loop
      pts.push(pts[0].clone());
      return pts;
    } catch (e) {
      console.error('Error parsing track path:', e);
      return [];
    }
  }, [circuitId]);

  const height = 0.16; // vertical height of the 3D ribbon

  // Construct vertical 3D ribbon geometry
  const ribbonGeometry = useMemo(() => {
    if (points3d.length < 2) return null;
    const geometry = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];
    
    points3d.forEach((pt: any, idx: number) => {
      // Bottom vertex
      vertices.push(pt.x, pt.y - height / 2, pt.z);
      // Top vertex
      vertices.push(pt.x, pt.y + height / 2, pt.z);
      
      const u = idx / (points3d.length - 1);
      uvs.push(u, 0);
      uvs.push(u, 1);
    });
    
    const N = points3d.length;
    for (let i = 0; i < N - 1; i++) {
      const currBottom = 2 * i;
      const currTop = 2 * i + 1;
      const nextBottom = 2 * (i + 1);
      const nextTop = 2 * (i + 1) + 1;
      
      // Front face
      indices.push(currBottom, nextBottom, currTop);
      indices.push(currTop, nextBottom, nextTop);
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  }, [points3d]);

  // Glowing stroke points directly on top of the ribbon
  const topPoints3d = useMemo(() => {
    return points3d.map((pt: any) => new THREE.Vector3(pt.x, pt.y + height / 2 + 0.002, pt.z));
  }, [points3d]);

  // Distribute 8 corners along the track path coordinates
  const corners = useMemo(() => {
    if (points3d.length === 0) return [];
    const N = points3d.length;
    const fractions = [0.05, 0.18, 0.32, 0.45, 0.58, 0.70, 0.82, 0.92];
    const speeds = [85, 145, 265, 110, 280, 75, 210, 130];
    const gears = ['1st', '3rd', '6th', '2nd', '8th', '2nd', '5th', '3rd'];
    const gForces = [1.9, 3.1, 4.6, 2.4, 5.0, 1.8, 3.8, 2.8];

    return fractions.map((f, i) => {
      const idx = Math.floor(f * N);
      const pt = points3d[idx];
      return {
        id: `turn-${i + 1}`,
        number: String(i + 1).padStart(2, '0'),
        position: pt ? [pt.x, pt.y, pt.z] as [number, number, number] : [0, 0, 0] as [number, number, number],
        speed: speeds[i],
        gear: gears[i],
        gForce: gForces[i],
      };
    });
  }, [points3d]);

  const carRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!carRef.current || points3d.length === 0) return;
    const time = state.clock.getElapsedTime();
    const speed = 10; // points per second
    const totalPoints = points3d.length;
    const index = Math.floor(time * speed) % totalPoints;
    const currentPt = points3d[index];
    
    // Smooth lerp
    const nextIndex = (index + 1) % totalPoints;
    const nextPt = points3d[nextIndex];
    const alpha = (time * speed) % 1;
    
    if (currentPt && nextPt) {
      const targetPos = new THREE.Vector3().lerpVectors(currentPt, nextPt, alpha);
      // Place the car slightly above the ribbon's top edge
      targetPos.y += height / 2 + 0.01;
      carRef.current.position.copy(targetPos);
    }
  });

  if (points3d.length === 0) return null;

  return (
    <group>
      {/* 3D Track Ribbon Wall */}
      {ribbonGeometry && (
        <mesh geometry={ribbonGeometry}>
          <meshStandardMaterial 
            color="#8a1a16" // sleek dark crimson-red ribbon body
            roughness={0.4}
            metalness={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Glowing Bright Red Stroke on Ribbon Top Face */}
      <Line
        points={topPoints3d}
        color="#FF1E1E"
        lineWidth={3.0}
      />
      
      {/* Outer ambient glow effect */}
      <Line
        points={topPoints3d}
        color="#FF1E1E"
        lineWidth={1.0}
        opacity={0.25}
        transparent
      />

      {/* Pulsing Car Tracker Dot */}
      <mesh ref={carRef}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color="#FF1E1E" />
        <pointLight color="#FF1E1E" intensity={2.0} distance={2} />
      </mesh>

      {/* Interactive Corner Numbers Suspended via Leader Lines */}
      {corners.map((c) => {
        const baseHeight = height / 2;
        const leaderLength = 0.40;
        const totalHeight = baseHeight + leaderLength;
        const badgePosition: [number, number, number] = [c.position[0], c.position[1] + totalHeight, c.position[2]];
        
        return (
          <group key={c.id}>
            {/* Base anchor dot on the track edge */}
            <mesh position={[c.position[0], c.position[1] + baseHeight, c.position[2]]}>
              <sphereGeometry args={[0.015, 8, 8]} />
              <meshBasicMaterial color="#FF1E1E" />
            </mesh>

            {/* Vertical Leader Line */}
            <Line
              points={[
                new THREE.Vector3(c.position[0], c.position[1] + baseHeight, c.position[2]),
                new THREE.Vector3(c.position[0], c.position[1] + totalHeight, c.position[2])
              ]}
              color="#FF1E1E"
              lineWidth={1.0}
              opacity={0.35}
              transparent
            />

            {/* Suspended HTML Badge */}
            <Html 
              position={badgePosition} 
              distanceFactor={4.5} 
              center 
              zIndexRange={[50, 100]}
            >
              <div className="group relative select-none pointer-events-auto">
                {/* Pulsing Outer Target */}
                <span className="absolute -inset-1 rounded-full bg-[#FF1E1E]/20 opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity" />
                
                {/* Corner Badge */}
                <button 
                  className="h-5 w-5 bg-black border border-white/20 text-white rounded-full flex items-center justify-center font-mono text-[0.5rem] font-black shadow-lg hover:bg-[#FF1E1E] hover:border-[#FF1E1E] hover:text-white hover:scale-110 transition-all duration-300 focus:outline-none"
                  aria-label={`Corner ${c.number}`}
                >
                  {c.number}
                </button>
                
                {/* Floating Telemetry Tooltip on Hover */}
                 <div 
                   className="opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 absolute bottom-7 left-1/2 -translate-x-1/2 p-2.5 rounded-lg w-32 shadow-[0_15px_30px_rgba(0,0,0,0.5)] text-center font-sans z-50"
                   style={{
                     backgroundColor: '#111111',
                     color: '#ffffff',
                     border: '1px solid rgba(255, 255, 255, 0.15)',
                   }}
                 >
                   <span className="block font-mono text-[0.55rem] uppercase text-[#FF1E1E] font-bold mb-1">TURN {c.number}</span>
                   <div className="grid grid-cols-2 gap-0.5 text-[0.48rem] font-mono">
                     <span className="text-left text-zinc-500">SPEED:</span>
                     <span className="text-right text-white font-bold">{c.speed} KM/H</span>
                     <span className="text-left text-zinc-500">GEAR:</span>
                     <span className="text-right text-white font-bold">{c.gear}</span>
                     <span className="text-left text-zinc-500">G-FORCE:</span>
                     <span className="text-right text-white font-bold">{c.gForce}G</span>
                   </div>
                   {/* Tooltip Arrow */}
                   <div 
                     className="absolute bottom-[-4px] left-1/2 h-1.5 w-1.5 -translate-x-1/2 rotate-45 border-r border-b border-white/10"
                     style={{
                       backgroundColor: '#111111',
                     }}
                   />
                 </div>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

export default function ThreeTrackScene({ circuitId, circuitName }: ThreeTrackSceneProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-transparent">
        <div className="font-mono text-[0.65rem] text-accent tracking-[0.25em] animate-pulse uppercase">
          CALIBRATING TRACK GEOMETRY...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[400px] relative bg-transparent overflow-hidden">
      <div className="absolute top-4 left-4 z-10 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-black/50">
        HOLOGRAPHIC CIRCUIT MAP // {circuitName || 'MONACO GP'}
      </div>

      <Canvas
        shadows
        camera={{ position: [0, 3.2, 3], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          <TrackOutline circuitId={circuitId} />
        </Suspense>

        <OrbitControls 
          enableZoom={false} 
          autoRotate={false} 
          maxPolarAngle={Math.PI / 2.2}
          minPolarAngle={Math.PI / 6}
        />
      </Canvas>

      <div className="absolute bottom-4 right-4 bg-black/75 px-3 py-1.5 text-[0.55rem] font-mono uppercase tracking-[0.15em] text-white/60 rounded border border-white/5 pointer-events-none select-none z-10">
        Drag to Orbit Track
      </div>
    </div>
  );
}
