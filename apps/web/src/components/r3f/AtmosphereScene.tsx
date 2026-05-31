import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { ParticleField } from './ParticleField';
import { useScrollCamera } from '@/hooks/useScrollCamera';

/**
 * A tiny component that sits inside the Canvas and drives the camera.
 * Separated so useScrollCamera (which calls useFrame / useThree) is only
 * ever invoked from within the R3F render tree.
 */
function CameraController() {
  useScrollCamera();
  return null;
}

/**
 * AtmosphereScene — the persistent R3F 3D layer.
 *
 * Fixed full-viewport, z-index -1 → lives below all UI.
 * Never SSR'd: this file is only ever loaded via the dynamic import in
 * AtmosphereLayer (ssr: false), so importing @react-three/* here is safe.
 *
 * Art-direction notes (tune here, not in sub-components):
 *   Fog:    near=8, far=28 — particles at z ≈ -10 start to dissolve.
 *   Noise:  opacity 0.04, SOFT_LIGHT — very faint animated film grain.
 *   Bloom:  intensity 0.15, threshold 0.4 — invisible unless lit objects exist.
 *           Add point lights / emissive meshes later to activate it.
 */
export default function AtmosphereScene() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
      }}
    >
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 5], fov: 60 }}
        gl={{ antialias: false, alpha: true }}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Dark exponential fog — deepens perceived depth */}
        <fog attach="fog" args={['#050505', 8, 28]} />

        <ParticleField />
        <CameraController />

        <EffectComposer>
          {/* Film grain — NoiseEffect animates per-frame for a cinematic texture */}
          <Noise
            opacity={0.04}
            blendFunction={BlendFunction.SOFT_LIGHT}
          />
          {/* Subtle bloom — currently near-invisible; activates when emissive
              objects are added to the scene */}
          <Bloom
            intensity={0.15}
            luminanceThreshold={0.4}
            luminanceSmoothing={0.9}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
