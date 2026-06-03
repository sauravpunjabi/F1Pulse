import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { gsap } from 'gsap';
import type Lenis from 'lenis';
import { useLenis } from '@/providers/LenisProvider';

/**
 * Drives the R3F camera from Lenis scroll progress via GSAP easing.
 *
 * Must be called inside a <Canvas> render tree (useFrame / useThree
 * requirement). The camera starts at z=5; scrolling eases it forward
 * and gently upward — art-direct the target values in the gsap.to call.
 *
 * GSAP owns the interpolation (power2.out, 0.8s), so we get eased movement
 * without a manual lerp in useFrame.
 */
export function useScrollCamera(): void {
  const { camera } = useThree();
  const lenis = useLenis();

  // GSAP mutates this object each frame; useFrame reads it.
  const target = useRef({ z: 5, y: 0 });

  useEffect(() => {
    if (!lenis) return;

    const onScroll = (instance: Lenis) => {
      gsap.to(target.current, {
        z: 5 - instance.progress * 3,   // dive from z=5 → z=2 over full scroll
        y: instance.progress * 1.5,     // drift slightly upward
        duration: 0.8,
        ease: 'power2.out',
        overwrite: true,
      });
    };

    lenis.on('scroll', onScroll);
    return () => lenis.off('scroll', onScroll);
  }, [lenis]);

  useFrame(() => {
    camera.position.z = target.current.z;
    camera.position.y = target.current.y;
  });
}
