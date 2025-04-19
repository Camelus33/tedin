'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei/core/OrbitControls';
import { useGLTF } from '@react-three/drei/core/useGLTF';
import * as THREE from 'three';

// 브레인 모델 컴포넌트 
function Brain() {
  const brainRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/models/Brain.glb');
  
  // 브레인 회전 애니메이션
  useFrame(({ clock }) => {
    if (brainRef.current) {
      brainRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.2;
    }
  });

  return (
    <primitive 
      ref={brainRef} 
      object={scene} 
      scale={1.8} 
      position={[0, -0.2, 0]} 
      rotation={[0.1, 0, 0]} 
    />
  );
}

export default function Brain3DClient() {
  return (
    <div 
      style={{ 
        width: '100%',
        height: '500px', // 고정 높이 사용
        overflow: 'visible',
        position: 'relative',
        margin: '0 auto',
        zIndex: 10
      }}
    >
      <Canvas 
        style={{ background: 'transparent' }}
        camera={{
          position: [0, 0, 5],
          fov: 50,
          near: 0.1,
          far: 1000
        }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
        <directionalLight position={[-5, -5, -5]} intensity={0.5} color="#d4a0ff" />
        
        <Brain />
        
        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          rotateSpeed={0.5}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.8}
        />
      </Canvas>
    </div>
  );
}

// 모델 프리로드
useGLTF.preload('/models/Brain.glb'); 