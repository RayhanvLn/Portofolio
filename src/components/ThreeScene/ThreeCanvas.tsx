'use client';
import { Suspense, useRef, type RefObject } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { motionStore } from '@/lib/motionStore';
import type { ModelContent } from '@/types/portfolio';

export type Quality = 'high' | 'low';

const ACCENT = '#FF8000';
const PAPER = '#F1F0E9';

/** Shared motion: slow spin, pointer tilt, scroll-linked travel, velocity boost. */
function useObjectMotion(group: RefObject<THREE.Group | null>) {
  useFrame((_state, delta) => {
    const g = group.current;
    if (!g) return;
    const d = Math.min(delta, 1 / 30);
    const p = motionStore.pointer;
    const hero = motionStore.hero.progress;
    const vel = Math.min(Math.abs(motionStore.scroll.velocity), 40);
    g.rotation.y += d * (0.22 + vel * 0.025);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, 0.25 + p.ny * 0.3 + hero * 0.9, 3, d);
    g.rotation.z = THREE.MathUtils.damp(g.rotation.z, 0.12 - p.nx * 0.18, 3, d);
    g.position.x = THREE.MathUtils.damp(g.position.x, p.nx * 0.22, 2.5, d);
    g.position.y = THREE.MathUtils.damp(g.position.y, -p.ny * 0.16 + hero * 1.4, 2.5, d);
  });
}

/** Procedural identity object: dark chrome ring, faceted core, accent orbit. */
function IdentityObject({ quality }: { quality: Quality }) {
  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const orbit = useRef<THREE.Mesh>(null);
  const seg = quality === 'high' ? 160 : 64;
  useObjectMotion(group);
  useFrame((_s, delta) => {
    const d = Math.min(delta, 1 / 30);
    if (core.current) {
      core.current.rotation.x -= d * 0.35;
      core.current.rotation.y -= d * 0.5;
    }
    if (orbit.current) orbit.current.rotation.z += d * 0.4;
  });

  return (
    <group ref={group}>
      <mesh>
        <torusGeometry args={[1.2, 0.34, quality === 'high' ? 64 : 28, seg]} />
        <meshPhysicalMaterial color="#1b1b1e" metalness={1} roughness={0.2} clearcoat={1} clearcoatRoughness={0.12} />
      </mesh>
      <mesh ref={core}>
        <icosahedronGeometry args={[0.58, 1]} />
        <meshStandardMaterial color={PAPER} roughness={0.5} metalness={0.05} flatShading />
      </mesh>
      <mesh ref={orbit} rotation={[Math.PI / 2.4, 0.2, 0]}>
        <torusGeometry args={[1.9, 0.011, 8, seg]} />
        <meshBasicMaterial color={ACCENT} toneMapped={false} />
      </mesh>
    </group>
  );
}

/** Your own .glb (enable in src/data/portfolio.ts → model.enabled). */
function Model({ src, draco }: { src: string; draco: boolean }) {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF(src, draco);
  useObjectMotion(group);
  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  );
}

export default function ThreeCanvas({ quality, active, model }: { quality: Quality; active: boolean; model: ModelContent }) {
  return (
    <Canvas
      dpr={quality === 'high' ? [1, 1.75] : [1, 1.25]}
      camera={{ position: [0, 0, 6.4], fov: 32 }}
      gl={{ antialias: quality === 'high', alpha: true, powerPreference: 'high-performance' }}
      frameloop={active ? 'always' : 'never'}
    >
      <ambientLight intensity={0.25} />
      <directionalLight position={[4, 5, 6]} intensity={2.2} />
      <pointLight position={[-3.5, -2, 3]} intensity={14} distance={12} color={ACCENT} />
      {/* Procedural studio environment — no external HDR download. */}
      <Environment resolution={quality === 'high' ? 256 : 64} frames={1}>
        <Lightformer form="rect" intensity={2.4} position={[0, 4, -3]} scale={[12, 3, 1]} />
        <Lightformer form="rect" intensity={1.1} position={[-5, 0, 2]} rotation-y={Math.PI / 2} scale={[8, 2, 1]} />
        <Lightformer form="ring" intensity={1.6} color={ACCENT} position={[4, -1, 3]} scale={2.4} />
      </Environment>
      {model.enabled ? (
        <Suspense fallback={<IdentityObject quality={quality} />}>
          <Model src={model.src} draco={model.draco} />
        </Suspense>
      ) : (
        <IdentityObject quality={quality} />
      )}
    </Canvas>
  );
}
