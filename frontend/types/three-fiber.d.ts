/// <reference types="@react-three/fiber" />
/// <reference types="@react-three/drei" />

import { Object3DNode } from '@react-three/fiber';

declare module '@react-three/fiber' {
  interface ThreeElements {
    ambientLight: Object3DNode<THREE.AmbientLight, typeof THREE.AmbientLight>;
    directionalLight: Object3DNode<THREE.DirectionalLight, typeof THREE.DirectionalLight>;
    primitive: Object3DNode<THREE.Object3D, typeof THREE.Object3D>;
  }
} 