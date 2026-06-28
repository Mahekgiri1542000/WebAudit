'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

export function ScoreRing({ score = 94 }: { score?: number }) {
  const ringRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.y = 1.5 + Math.sin(clock.elapsedTime * 0.8) * 0.1;
      groupRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group ref={groupRef} position={[2.5, 1.5, 0]} rotation={[0.26, 0, 0]}>
      <mesh ref={ringRef}>
        <torusGeometry args={[0.6, 0.05, 16, 64]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
        />
      </mesh>
      <Text
        position={[0, 0, 0.01]}
        fontSize={0.35}
        color="white"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Inter-Bold.woff"
      >
        {score}
      </Text>
    </group>
  );
}
