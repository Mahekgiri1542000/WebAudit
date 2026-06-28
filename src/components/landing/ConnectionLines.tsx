'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const NODE_COUNT = 12;

function generateNodes() {
  const nodes: THREE.Vector3[] = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    const phi = Math.acos(-1 + (2 * i) / NODE_COUNT);
    const theta = Math.sqrt(NODE_COUNT * Math.PI) * phi;
    nodes.push(new THREE.Vector3(
      2 * Math.sin(phi) * Math.cos(theta),
      2 * Math.sin(phi) * Math.sin(theta),
      2 * Math.cos(phi)
    ));
  }
  return nodes;
}

const NODES = generateNodes();
const PAIRS: [number, number][] = [];
for (let i = 0; i < NODE_COUNT; i++) {
  for (let j = i + 1; j < NODE_COUNT; j++) {
    if (NODES[i].distanceTo(NODES[j]) < 2.2) PAIRS.push([i, j]);
  }
}

export default function ConnectionLines() {
  const groupRef = useRef<THREE.Group>(null);
  const clockRef = useRef(0);

  const lineGeometries = PAIRS.map(([a, b]) => {
    const geo = new THREE.BufferGeometry().setFromPoints([NODES[a], NODES[b]]);
    return geo;
  });

  useFrame((_state, delta) => {
    clockRef.current += delta;
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group ref={groupRef}>
      {lineGeometries.map((geo, i) => (
        // @ts-expect-error R3F <line> conflicts with SVG type — works at runtime
        <line key={i} geometry={geo}>
          <lineBasicMaterial color="#3b82f6" transparent opacity={0.15} />
        </line>
      ))}
    </group>
  );
}
