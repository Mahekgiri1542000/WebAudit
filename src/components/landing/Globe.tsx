'use client';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function Globe() {
  const globeRef = useRef<THREE.Mesh>(null);
  const nodesRef = useRef<THREE.InstancedMesh>(null);

  const nodePositions = useMemo(() => {
    const positions: THREE.Vector3[] = [];
    for (let i = 0; i < 40; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2.02;
      positions.push(
        new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi)
        )
      );
    }
    return positions;
  }, []);

  useFrame(() => {
    if (globeRef.current) globeRef.current.rotation.y += 0.001;
    if (nodesRef.current) nodesRef.current.rotation.y += 0.001;
  });

  const dummy = useMemo(() => new THREE.Object3D(), []);

  return (
    <group>
      {/* Wireframe globe */}
      <mesh ref={globeRef}>
        <icosahedronGeometry args={[2, 4]} />
        <meshBasicMaterial color="#1e3a8a" wireframe opacity={0.15} transparent />
      </mesh>

      {/* Node points */}
      <instancedMesh ref={nodesRef} args={[undefined, undefined, 40]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={0.8} />
        {nodePositions.map((pos, i) => {
          dummy.position.copy(pos);
          dummy.updateMatrix();
          return null; // Matrix set via imperative approach
        })}
      </instancedMesh>
    </group>
  );
}
