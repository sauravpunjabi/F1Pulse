import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const COUNT = 200;

type XYZ = [number, number, number];

/**
 * 200 instanced spheres drifting in slow sinusoidal loops.
 * Low-poly (4-segment sphere) keeps the GPU cost negligible.
 * Geometry and material are disposed on unmount via the cleanup return.
 */
export function ParticleField() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const geometry = useMemo(
    () => new THREE.SphereGeometry(0.018, 4, 4),
    [],
  );
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#bbbbbb',
        transparent: true,
        opacity: 0.35,
      }),
    [],
  );

  // Generate base positions once — scattered across a wide volume.
  const basePositions = useMemo<XYZ[]>(() => {
    const arr: XYZ[] = [];
    for (let i = 0; i < COUNT; i++) {
      arr.push([
        (Math.random() - 0.5) * 24,   // x: wide spread
        (Math.random() - 0.5) * 12,   // y: moderate height
        (Math.random() - 0.5) * 18,   // z: depth layers
      ]);
    }
    return arr;
  }, []);

  // Set initial instance matrices, dispose on unmount.
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    basePositions.forEach(([x, y, z], i) => {
      dummy.position.set(x, y, z);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;

    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [basePositions, dummy, geometry, material]);

  // Animate: slow sinusoidal drift per particle.
  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = clock.getElapsedTime();

    basePositions.forEach(([x, y, z], i) => {
      dummy.position.set(
        x + Math.sin(t * 0.25 + i * 0.6) * 0.12,
        y + Math.cos(t * 0.18 + i * 0.9) * 0.09,
        z,
      );
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, material, COUNT]} />
  );
}
