"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { amfaTheme } from './theme';
import { BrandSloganTyping } from './TypingEffect';

interface TrailSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  time: number;
  intensity: number;
  velocity: number;
  angle: number;
  length: number;
}

interface LinearWave {
  segmentId: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  time: number;
  intensity: number;
  perpOffset: number; // 궤적에 수직인 방향으로의 오프셋
  side: 'left' | 'right'; // 궤적의 왼쪽 또는 오른쪽
  amplitude: number;
  frequency: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  opacity: number;
  type: 'spray' | 'foam' | 'droplet';
  rotation: number;
  rotationSpeed: number;
}

// 소용돌이 인터페이스 추가
interface Vortex {
  x: number;
  y: number;
  strength: number;
  radius: number;
  life: number;
  maxLife: number;
  rotation: number;
  rotationSpeed: number;
  particles: VortexParticle[];
}

// 소용돌이에 빨려들어가는 파티클
interface VortexParticle {
  x: number;
  y: number;
  angle: number;
  distance: number;
  speed: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
  spiralSpeed: number;
  color: { r: number; g: number; b: number };
}

interface Foam {
  x: number;
  y: number;
  size: number;
  life: number;
  maxLife: number;
  opacity: number;
}

interface WaveAnimationProps {
  className?: string;
  waveColor?: string;
  maxTrailSegments?: number;
  waveSpeed?: number;
  dampening?: number;
  onStartJourney?: () => void;
}

export function WaveAnimation({
  className = '',
  waveColor = 'rgba(6, 182, 212, 0.6)',
  maxTrailSegments = 20,
  waveSpeed = 3.0,
  dampening = 0.98,
  onStartJourney
}: WaveAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [trailSegments, setTrailSegments] = useState<TrailSegment[]>([]);
  const [linearWaves, setLinearWaves] = useState<LinearWave[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [foams, setFoams] = useState<Foam[]>([]);
  const [vortexes, setVortexes] = useState<Vortex[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [mouseTrail, setMouseTrail] = useState<{x: number, y: number, time: number}[]>([]);
  const [animationTime, setAnimationTime] = useState(0); // 배경 애니메이션용 시간
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{x: number, y: number} | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{x: number, y: number} | null>(null);

  // 사이버 테마 색상 팔레트 - 더 짙고 진한 색상
  const cyberColors = {
    navy: { r: 15, g: 35, b: 85 },       // 더 짙은 남색 (Deep Navy)
    purple: { r: 55, g: 15, b: 95 },     // 더 짙은 보라 (Deep Purple)
    darkGreen: { r: 3, g: 45, b: 35 },   // 더 짙은 녹색 (Very Dark Green)
    deepBlue: { r: 8, g: 15, b: 35 },    // 매우 깊은 파랑 (Very Deep Blue)
    teal: { r: 8, g: 85, b: 75 },        // 더 짙은 청록색 (Deep Teal)
    midnight: { r: 5, g: 10, b: 25 },    // 자정색 (Midnight)
    abyss: { r: 2, g: 8, b: 18 }         // 심연색 (Abyss)
  };

  // 색상 보간 함수
  const interpolateColor = (color1: {r: number, g: number, b: number}, color2: {r: number, g: number, b: number}, factor: number) => {
    const r = Math.round(color1.r + (color2.r - color1.r) * factor);
    const g = Math.round(color1.g + (color2.g - color1.g) * factor);
    const b = Math.round(color1.b + (color2.b - color1.b) * factor);
    return { r, g, b };
  };

  // 소용돌이 생성 함수
  const createVortex = useCallback((x: number, y: number, dragDistance: number) => {
    const strength = Math.min(dragDistance / 100, 3.0); // 드래그 거리에 따른 강도
    const radius = Math.min(dragDistance * 0.8, 200); // 최대 반지름 200px
    
    const newVortex: Vortex = {
      x,
      y,
      strength,
      radius,
      life: 0,
      maxLife: 5000, // 5초 지속
      rotation: 0,
      rotationSpeed: strength * 0.02, // 강도에 따른 회전 속도
      particles: []
    };
    
    // 소용돌이 주변에 파티클 생성
    const particleCount = Math.floor(strength * 20 + 30); // 30-90개 파티클
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const distance = radius * 0.3 + Math.random() * radius * 0.7;
      
      const vortexParticle: VortexParticle = {
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        angle,
        distance,
        speed: 0.5 + Math.random() * 1.5,
        size: 2 + Math.random() * 4,
        opacity: 0.8 + Math.random() * 0.2,
        life: 0,
        maxLife: 3000 + Math.random() * 2000,
        spiralSpeed: 0.02 + Math.random() * 0.03,
        color: {
          r: 6 + Math.random() * 50,
          g: 182 + Math.random() * 50,
          b: 212 + Math.random() * 43
        }
      };
      
      newVortex.particles.push(vortexParticle);
    }
    
    setVortexes(prev => [...prev, newVortex]);
  }, []);
  
  // 소용돌이 업데이트 함수
  const updateVortexes = useCallback((deltaTime: number) => {
    setVortexes(prev => prev.map(vortex => {
      // 소용돌이 생명주기 업데이트
      const newLife = vortex.life + deltaTime;
      if (newLife > vortex.maxLife) return null;
      
      // 소용돌이 회전
      const newRotation = vortex.rotation + vortex.rotationSpeed * deltaTime;
      
      // 파티클 업데이트
      const updatedParticles = vortex.particles.map(particle => {
        const particleLife = particle.life + deltaTime;
        if (particleLife > particle.maxLife) return null;
        
        // 나선 궤도 계산
        const spiralProgress = particleLife / particle.maxLife;
        const newAngle = particle.angle + particle.spiralSpeed * deltaTime;
        const newDistance = particle.distance * (1 - spiralProgress * 0.8); // 점점 중심으로
        
        // 새 위치 계산
        const newX = vortex.x + Math.cos(newAngle) * newDistance;
        const newY = vortex.y + Math.sin(newAngle) * newDistance;
        
        // 투명도 감소
        const newOpacity = particle.opacity * (1 - spiralProgress);
        
        return {
          ...particle,
          x: newX,
          y: newY,
          angle: newAngle,
          distance: newDistance,
          life: particleLife,
          opacity: newOpacity
        };
      }).filter(Boolean) as VortexParticle[];
      
      return {
        ...vortex,
        life: newLife,
        rotation: newRotation,
        particles: updatedParticles
      };
    }).filter(Boolean) as Vortex[]);
  }, []);

  // 시간 기반 색상 생성 - 더 진하고 극적인 색상 변화
  const getTimeBasedColor = (time: number, alpha: number = 1) => {
    const cycle = time * 0.0008; // 조금 더 빠른 색상 변화
    
    // 5개 색상 간 순환 (Abyss → Navy → Purple → Dark Green → Teal → Midnight → Abyss)
    const phase = (Math.sin(cycle) + 1) / 2; // 0-1 사이 값
    const phase2 = (Math.sin(cycle + Math.PI * 0.8) + 1) / 2;
    const phase3 = (Math.sin(cycle + Math.PI * 1.6) + 1) / 2;
    
    let baseColor;
    if (phase > 0.8) {
      // Abyss → Navy (심연에서 깊은 바다로)
      const factor = (phase - 0.8) / 0.2;
      baseColor = interpolateColor(cyberColors.abyss, cyberColors.navy, factor);
    } else if (phase > 0.6) {
      // Navy → Purple (깊은 바다에서 신비로운 보라로)
      const factor = (phase - 0.6) / 0.2;
      baseColor = interpolateColor(cyberColors.navy, cyberColors.purple, factor);
    } else if (phase > 0.4) {
      // Purple → Dark Green (보라에서 깊은 녹색으로)
      const factor = (phase - 0.4) / 0.2;
      baseColor = interpolateColor(cyberColors.purple, cyberColors.darkGreen, factor);
    } else if (phase > 0.2) {
      // Dark Green → Teal (깊은 녹색에서 청록으로)
      const factor = (phase - 0.2) / 0.2;
      baseColor = interpolateColor(cyberColors.darkGreen, cyberColors.teal, factor);
    } else {
      // Teal → Midnight (청록에서 자정색으로)
      const factor = phase / 0.2;
      baseColor = interpolateColor(cyberColors.teal, cyberColors.midnight, factor);
    }
    
    // 추가적인 깊이감을 위한 색상 조정
    const depthFactor = Math.sin(time * 0.0005) * 0.3 + 0.7; // 0.4 ~ 1.0
    const adjustedColor = {
      r: Math.round(baseColor.r * depthFactor),
      g: Math.round(baseColor.g * depthFactor),
      b: Math.round(baseColor.b * depthFactor)
    };
    
    return `rgba(${adjustedColor.r}, ${adjustedColor.g}, ${adjustedColor.b}, ${alpha})`;
  };

  // 배경 그라디언트 애니메이션 렌더링 - 더 진하고 깊은 색상
  const drawBackgroundWaves = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { width, height } = canvasSize;
    
    // 기본 배경 클리어
    ctx.clearRect(0, 0, width, height);
    
    // 다층 배경 그라디언트 (바다 깊이감) - 더 진한 색상
    const time = animationTime;
    
    // 1층: 가장 깊은 바다 (심연의 어둠)
    const deepGradient = ctx.createLinearGradient(0, 0, 0, height);
    deepGradient.addColorStop(0, getTimeBasedColor(time * 0.2, 0.95));      // 더 진한 상단
    deepGradient.addColorStop(0.3, getTimeBasedColor(time * 0.2 + 800, 0.85)); // 중간 깊이
    deepGradient.addColorStop(0.7, getTimeBasedColor(time * 0.2 + 1600, 0.9)); // 하단 깊이
    deepGradient.addColorStop(1, getTimeBasedColor(time * 0.2 + 2400, 1.0));   // 바닥 (완전 불투명)
    
    ctx.fillStyle = deepGradient;
    ctx.fillRect(0, 0, width, height);
    
    // 2층: 중간 깊이 물결 (좌우 움직임) - 더 강한 색상
    const waveOffset1 = Math.sin(time * 0.0006) * 120;
    const waveOffset2 = Math.cos(time * 0.0004) * 80;
    const midGradient = ctx.createRadialGradient(
      width/2 + waveOffset1, height/3 + waveOffset2, 0,
      width/2 + waveOffset1, height/3 + waveOffset2, Math.max(width, height) * 0.8
    );
    midGradient.addColorStop(0, getTimeBasedColor(time * 0.4, 0.6));
    midGradient.addColorStop(0.4, getTimeBasedColor(time * 0.4 + 1200, 0.4));
    midGradient.addColorStop(0.8, getTimeBasedColor(time * 0.4 + 2400, 0.2));
    midGradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = midGradient;
    ctx.fillRect(0, 0, width, height);
    
    // 3층: 표면 물결 (파도 형태) - 더 역동적
    const segments = 60; // 더 세밀한 파도
    const amplitude = 40; // 더 큰 진폭
    const frequency = 0.004;
    
    ctx.beginPath();
    ctx.moveTo(0, height);
    
    for (let i = 0; i <= segments; i++) {
      const x = (i / segments) * width;
      const wave1 = Math.sin(x * frequency + time * 0.0008) * amplitude;
      const wave2 = Math.sin(x * frequency * 2.5 + time * 0.0012) * amplitude * 0.6;
      const wave3 = Math.sin(x * frequency * 0.7 + time * 0.0006) * amplitude * 0.4;
      const wave4 = Math.sin(x * frequency * 4 + time * 0.0015) * amplitude * 0.3; // 추가 파도
      const y = height * 0.65 + wave1 + wave2 + wave3 + wave4;
      
      ctx.lineTo(x, y);
    }
    
    ctx.lineTo(width, height);
    ctx.closePath();
    
    // 표면 그라디언트 - 더 진한 색상
    const surfaceGradient = ctx.createLinearGradient(0, height * 0.5, 0, height);
    surfaceGradient.addColorStop(0, getTimeBasedColor(time * 0.6, 0.7));
    surfaceGradient.addColorStop(0.3, getTimeBasedColor(time * 0.6 + 600, 0.6));
    surfaceGradient.addColorStop(0.7, getTimeBasedColor(time * 0.6 + 1200, 0.8));
    surfaceGradient.addColorStop(1, getTimeBasedColor(time * 0.6 + 1800, 0.9));
    
    ctx.fillStyle = surfaceGradient;
    ctx.fill();
    
    // 4층: 빛 반사 효과 (상단) - 더 신비로운 빛
    const lightGradient = ctx.createLinearGradient(0, 0, 0, height * 0.5);
    const lightOffset1 = Math.sin(time * 0.001) * 0.4 + 0.6;
    const lightOffset2 = Math.cos(time * 0.0008) * 0.3 + 0.7;
    lightGradient.addColorStop(0, getTimeBasedColor(time * 0.8, 0.4));
    lightGradient.addColorStop(lightOffset1, getTimeBasedColor(time * 0.8 + 400, 0.2));
    lightGradient.addColorStop(lightOffset2, getTimeBasedColor(time * 0.8 + 800, 0.3));
    lightGradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = lightGradient;
    ctx.fillRect(0, 0, width, height * 0.5);
    
    // 5층: 미세한 파티클 효과 - 더 많고 진한 파티클
    const particleCount = 30; // 더 많은 파티클
    for (let i = 0; i < particleCount; i++) {
      const x = (i / particleCount) * width + Math.sin(time * 0.0008 + i) * 60;
      const y = height * 0.2 + Math.sin(time * 0.0012 + i * 2) * 120;
      const size = 1.5 + Math.sin(time * 0.0015 + i * 3) * 1.5;
      const alpha = 0.2 + Math.sin(time * 0.0018 + i * 1.5) * 0.2;
      
      const particleGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 4);
      particleGradient.addColorStop(0, getTimeBasedColor(time * 0.7 + i * 150, alpha));
      particleGradient.addColorStop(0.6, getTimeBasedColor(time * 0.7 + i * 150 + 300, alpha * 0.5));
      particleGradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = particleGradient;
      ctx.beginPath();
      ctx.arc(x, y, size * 4, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // 6층: 심연의 어둠 (하단 강화)
    const abyssGradient = ctx.createLinearGradient(0, height * 0.8, 0, height);
    abyssGradient.addColorStop(0, 'transparent');
    abyssGradient.addColorStop(0.5, getTimeBasedColor(time * 0.3 + 3000, 0.3));
    abyssGradient.addColorStop(1, getTimeBasedColor(time * 0.3 + 3600, 0.6));
    
    ctx.fillStyle = abyssGradient;
    ctx.fillRect(0, 0, width, height);
    
  }, [canvasSize, animationTime, getTimeBasedColor]);

  // SSR 호환성
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Canvas 크기 설정
  const updateCanvasSize = useCallback(() => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      canvasRef.current.width = rect.width * dpr;
      canvasRef.current.height = rect.height * dpr;
      
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
      
      setCanvasSize({ width: rect.width, height: rect.height });
    }
  }, []);

  // 소용돌이 렌더링 함수
  const renderVortexes = useCallback((ctx: CanvasRenderingContext2D) => {
    vortexes.forEach(vortex => {
      const lifeProgress = vortex.life / vortex.maxLife;
      const alpha = 1 - lifeProgress;
      
      // 소용돌이 중심 렌더링
      ctx.save();
      ctx.translate(vortex.x, vortex.y);
      ctx.rotate(vortex.rotation);
      
      // 소용돌이 중심 글로우 효과
      const centerGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, vortex.radius * 0.3);
      centerGradient.addColorStop(0, `rgba(6, 182, 212, ${alpha * 0.8})`);
      centerGradient.addColorStop(0.5, `rgba(147, 51, 234, ${alpha * 0.6})`);
      centerGradient.addColorStop(1, `rgba(6, 182, 212, ${alpha * 0.2})`);
      
      ctx.fillStyle = centerGradient;
      ctx.beginPath();
      ctx.arc(0, 0, vortex.radius * 0.3, 0, Math.PI * 2);
      ctx.fill();
      
      // 소용돌이 나선 라인 렌더링
      ctx.strokeStyle = `rgba(6, 182, 212, ${alpha * 0.4})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      const spiralTurns = 3;
      const steps = 100;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const angle = t * spiralTurns * Math.PI * 2;
        const radius = vortex.radius * (1 - t * 0.8);
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      
      ctx.restore();
      
      // 소용돌이 파티클 렌더링
      vortex.particles.forEach(particle => {
        if (particle.opacity <= 0) return;
        
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        
        // 파티클 글로우 효과
        const particleGradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 2
        );
        particleGradient.addColorStop(0, `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, 1)`);
        particleGradient.addColorStop(0.5, `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, 0.6)`);
        particleGradient.addColorStop(1, `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, 0)`);
        
        ctx.fillStyle = particleGradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        // 파티클 궤적 라인
        const trailLength = particle.size * 3;
        const trailAngle = particle.angle + Math.PI;
        const trailX = particle.x + Math.cos(trailAngle) * trailLength;
        const trailY = particle.y + Math.sin(trailAngle) * trailLength;
        
        ctx.strokeStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${particle.opacity * 0.3})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(trailX, trailY);
        ctx.stroke();
        
        ctx.restore();
      });
    });
  }, [vortexes]);

  // 궤적 기반 물보라 파티클 생성
  const createTrailParticles = useCallback((segment: TrailSegment) => {
    const newParticles: Particle[] = [];
    const segmentLength = segment.length;
    
    // 궤적을 따라 여러 지점에서 파티클 생성
    const particlePoints = Math.floor(segmentLength / 10) + 3;
    
    for (let i = 0; i < particlePoints; i++) {
      const t = i / (particlePoints - 1);
      const x = segment.x1 + (segment.x2 - segment.x1) * t;
      const y = segment.y1 + (segment.y2 - segment.y1) * t;
      
      // 궤적에 수직인 방향으로 파티클 분사
      const perpAngle1 = segment.angle + Math.PI / 2;
      const perpAngle2 = segment.angle - Math.PI / 2;
      
      // 양쪽으로 스프레이 생성
      [perpAngle1, perpAngle2].forEach(angle => {
        const sprayCount = Math.floor(segment.intensity * 8 + 3);
        for (let j = 0; j < sprayCount; j++) {
          const spreadAngle = angle + (Math.random() - 0.5) * 0.8;
          const particleSpeed = Math.random() * 6 + 2;
          const life = Math.random() * 30 + 20;
          
          newParticles.push({
            x: x + (Math.random() - 0.5) * 10,
            y: y + (Math.random() - 0.5) * 10,
            vx: Math.cos(spreadAngle) * particleSpeed,
            vy: Math.sin(spreadAngle) * particleSpeed - Math.random() * 2,
            life,
            maxLife: life,
            size: Math.random() * 2 + 1,
            opacity: segment.intensity * 0.8,
            type: 'spray',
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.2
          });
        }
      });
      
      // 거품 생성 (궤적 주변)
      if (segment.intensity > 0.5) {
        const foamCount = Math.floor(segment.intensity * 4 + 2);
        for (let j = 0; j < foamCount; j++) {
          const foamAngle = Math.random() * Math.PI * 2;
          const foamDistance = Math.random() * 15 + 5;
          const life = Math.random() * 60 + 40;
          
          newParticles.push({
            x: x + Math.cos(foamAngle) * foamDistance,
            y: y + Math.sin(foamAngle) * foamDistance,
            vx: Math.cos(foamAngle) * 0.5,
            vy: Math.sin(foamAngle) * 0.5 - 1,
            life,
            maxLife: life,
            size: Math.random() * 4 + 2,
            opacity: segment.intensity * 0.6,
            type: 'foam',
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.1
          });
        }
      }
    }
    
    return newParticles;
  }, []);

  // 궤적 기반 거품 생성
  const createTrailFoam = useCallback((segment: TrailSegment) => {
    const newFoams: Foam[] = [];
    const foamPoints = Math.floor(segment.length / 20) + 2;
    
    for (let i = 0; i < foamPoints; i++) {
      const t = i / (foamPoints - 1);
      const x = segment.x1 + (segment.x2 - segment.x1) * t;
      const y = segment.y1 + (segment.y2 - segment.y1) * t;
      
      // 궤적 주변에 거품 생성
      const foamCount = Math.floor(segment.intensity * 3 + 1);
      for (let j = 0; j < foamCount; j++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 25 + 10;
        const life = Math.random() * 80 + 60;
        
        newFoams.push({
          x: x + Math.cos(angle) * distance,
          y: y + Math.sin(angle) * distance,
          size: Math.random() * 8 + 4,
          life,
          maxLife: life,
          opacity: Math.random() * 0.3 + 0.2
        });
      }
    }
    
    return newFoams;
  }, []);

  // 드래그 이벤트 핸들러
  const handleMouseDown = useCallback((event: MouseEvent) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    setIsDragging(true);
    setDragStart({ x, y });
    setDragCurrent({ x, y });
  }, []);
  
  const handleMouseUp = useCallback((event: MouseEvent) => {
    if (!isDragging || !dragStart || !dragCurrent) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const endX = event.clientX - rect.left;
    const endY = event.clientY - rect.top;
    
    // 드래그 거리 계산
    const dragDistance = Math.sqrt(
      Math.pow(endX - dragStart.x, 2) + Math.pow(endY - dragStart.y, 2)
    );
    
    // 최소 드래그 거리 체크 (30px 이상)
    if (dragDistance > 30) {
      // 드래그 끝점에 소용돌이 생성
      createVortex(endX, endY, dragDistance);
    }
    
    setIsDragging(false);
    setDragStart(null);
    setDragCurrent(null);
  }, [isDragging, dragStart, dragCurrent, createVortex]);

  // 마우스 이벤트 핸들러 (궤적 기반)
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const currentTime = Date.now();
    
    // 드래그 중일 때 현재 위치 업데이트
    if (isDragging) {
      setDragCurrent({ x, y });
    }
    
    // 마우스 궤적 업데이트
    setMouseTrail(prevTrail => {
      const newTrail = [...prevTrail, { x, y, time: currentTime }];
      return newTrail.slice(-30); // 더 긴 궤적 유지
    });
    
    // 이전 포인트와 현재 포인트로 궤적 세그먼트 생성
    if (mouseTrail.length > 0) {
      const lastPoint = mouseTrail[mouseTrail.length - 1];
      const dx = x - lastPoint.x;
      const dy = y - lastPoint.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      
      // 최소 이동 거리 체크
      if (length > 5) {
        const velocity = length / Math.max(currentTime - lastPoint.time, 1);
        const intensity = Math.min(velocity / 10, 1);
        const angle = Math.atan2(dy, dx);
        
        const newSegment: TrailSegment = {
          x1: lastPoint.x,
          y1: lastPoint.y,
          x2: x,
          y2: y,
          time: 0,
          intensity: Math.max(intensity, 0.3),
          velocity,
          angle,
          length
        };
        
        // 궤적 세그먼트 추가
        setTrailSegments(prevSegments => {
          const newSegments = [...prevSegments, newSegment];
          return newSegments.slice(-maxTrailSegments);
        });
        
        // 궤적을 따라 선형 파도 생성
        const wavesPerSegment = Math.floor(length / 15) + 2;
        const newWaves: LinearWave[] = [];
        
        for (let i = 0; i < wavesPerSegment; i++) {
          const waveT = i / (wavesPerSegment - 1);
          const waveX1 = lastPoint.x + dx * waveT;
          const waveY1 = lastPoint.y + dy * waveT;
          const waveX2 = waveX1 + dx * 0.1; // 짧은 세그먼트
          const waveY2 = waveY1 + dy * 0.1;
          
          // 양쪽으로 파도 생성
          ['left', 'right'].forEach((side, sideIndex) => {
            for (let offset = 10; offset <= 50; offset += 10) {
              newWaves.push({
                segmentId: `${currentTime}-${i}-${side}-${offset}`,
                x1: waveX1,
                y1: waveY1,
                x2: waveX2,
                y2: waveY2,
                time: 0,
                intensity: intensity * (1 - offset / 60),
                perpOffset: offset * (side === 'left' ? -1 : 1),
                side: side as 'left' | 'right',
                amplitude: 15 + intensity * 20,
                frequency: 0.03 + intensity * 0.02
              });
            }
          });
        }
        
        setLinearWaves(prevWaves => [...prevWaves, ...newWaves]);
        
        // 빠른 움직임 시 파티클과 거품 생성
        if (velocity > 3) {
          setParticles(prevParticles => [
            ...prevParticles,
            ...createTrailParticles(newSegment)
          ]);
          
          if (velocity > 6) {
            setFoams(prevFoams => [
              ...prevFoams,
              ...createTrailFoam(newSegment)
            ]);
          }
        }
      }
    }
  }, [maxTrailSegments, mouseTrail, createTrailParticles, createTrailFoam]);

  // 궤적 기반 선형 파도 렌더링
  const drawLinearTrailWaves = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 배경 물결 먼저 그리기
    drawBackgroundWaves();
    
    // 기존 마우스 인터랙션 효과는 그대로 유지하되, 배경과 조화되도록 투명도 조정
    // ... 기존 코드 유지 (궤적 세그먼트, 선형 파도, 파티클 등)
    
    // 궤적 세그먼트 렌더링 (기본 경로) - 더 진한 사이버 색상
    trailSegments.forEach(segment => {
      const opacity = Math.max(0, segment.intensity * Math.pow(dampening, segment.time));
      
      if (opacity > 0.01) {
        // 시간에 따라 변화하는 진한 사이버 색상 사용
        const segmentColor = getTimeBasedColor(animationTime + segment.time * 50, opacity * 0.8); // 더 진한 투명도
        ctx.strokeStyle = segmentColor;
        ctx.lineWidth = 4; // 더 굵은 선
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(segment.x1, segment.y1);
        ctx.lineTo(segment.x2, segment.y2);
        ctx.stroke();
      }
    });
    
    // 선형 파도 렌더링 (궤적을 따라 퍼져나가는 파도) - 색상 조화
    linearWaves.forEach(wave => {
      const opacity = Math.max(0, wave.intensity * Math.pow(dampening, wave.time));
      
      if (opacity > 0.01) {
        const dx = wave.x2 - wave.x1;
        const dy = wave.y2 - wave.y1;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        if (length > 0) {
          const perpX = -dy / length;
          const perpY = dx / length;
          
          const waveSpread = wave.time * waveSpeed;
          const currentOffset = wave.perpOffset + waveSpread * (wave.side === 'left' ? -1 : 1);
          
          const centerX = (wave.x1 + wave.x2) / 2 + perpX * currentOffset;
          const centerY = (wave.y1 + wave.y2) / 2 + perpY * currentOffset;
          
          ctx.save();
          ctx.globalAlpha = opacity;
          
          const waveLength = Math.max(length, 20);
          const segments = 16;
          
          ctx.beginPath();
          // 시간에 따라 변화하는 색상 사용
          const timeBasedWaveColor = getTimeBasedColor(animationTime + wave.time * 100, opacity);
          ctx.strokeStyle = timeBasedWaveColor;
          ctx.lineWidth = 3 - Math.abs(currentOffset) / 30;
          
          for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            
            const baseX = wave.x1 + dx * t;
            const baseY = wave.y1 + dy * t;
            
            const waveHeight = Math.sin(t * Math.PI * 2 * wave.frequency + wave.time * 0.1) * wave.amplitude;
            const turbulence = Math.sin(t * Math.PI * 6 + wave.time * 0.15) * wave.amplitude * 0.3;
            
            const totalHeight = waveHeight + turbulence;
            
            const finalX = baseX + perpX * (currentOffset + totalHeight);
            const finalY = baseY + perpY * (currentOffset + totalHeight);
            
            if (i === 0) {
              ctx.moveTo(finalX, finalY);
            } else {
              ctx.lineTo(finalX, finalY);
            }
          }
          
          ctx.stroke();
          
          // 파도 글로우 효과 - 더 진한 사이버 색상 적용
          if (Math.abs(currentOffset) < 40) { // 더 넓은 범위에서 글로우 효과
            const glowGradient = ctx.createRadialGradient(
              centerX, centerY, 0,
              centerX, centerY, waveLength / 1.5 // 더 큰 글로우 범위
            );
            const glowColor1 = getTimeBasedColor(animationTime + wave.time * 50, opacity * 0.6); // 더 진한 중심색
            const glowColor2 = getTimeBasedColor(animationTime + wave.time * 50 + 800, opacity * 0.4); // 더 진한 중간색
            const glowColor3 = getTimeBasedColor(animationTime + wave.time * 50 + 1600, opacity * 0.2); // 더 진한 외곽색
            glowGradient.addColorStop(0, glowColor1);
            glowGradient.addColorStop(0.4, glowColor2);
            glowGradient.addColorStop(0.8, glowColor3);
            glowGradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.ellipse(centerX, centerY, waveLength / 1.5, waveLength / 3, Math.atan2(dy, dx), 0, Math.PI * 2);
            ctx.fill();
          }
          
          ctx.restore();
        }
      }
    });
    
    // 거품 렌더링
    foams.forEach(foam => {
      const lifeRatio = foam.life / foam.maxLife;
      const alpha = foam.opacity * lifeRatio;
      
      if (alpha > 0.01) {
        const size = foam.size * (0.5 + lifeRatio * 0.5);
        
        const foamGradient = ctx.createRadialGradient(
          foam.x, foam.y, 0,
          foam.x, foam.y, size
        );
        foamGradient.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.8})`);
        foamGradient.addColorStop(0.6, `rgba(200, 240, 255, ${alpha * 0.4})`);
        foamGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = foamGradient;
        ctx.beginPath();
        ctx.arc(foam.x, foam.y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    
    // 물보라 파티클 렌더링
    particles.forEach(particle => {
      const lifeRatio = particle.life / particle.maxLife;
      const alpha = particle.opacity * lifeRatio;
      
      if (alpha > 0.01) {
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation);
        
        const size = particle.size * (0.3 + lifeRatio * 0.7);
        
        switch (particle.type) {
          case 'spray':
            const sprayGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
            const sprayColor = getTimeBasedColor(animationTime + particle.life * 10, alpha * 1.2); // 더 진한 색상
            sprayGradient.addColorStop(0, sprayColor);
            sprayGradient.addColorStop(0.3, getTimeBasedColor(animationTime + particle.life * 10 + 300, alpha * 0.9)); // 더 진한 중간색
            sprayGradient.addColorStop(0.7, getTimeBasedColor(animationTime + particle.life * 10 + 600, alpha * 0.6)); // 더 진한 외곽색
            sprayGradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = sprayGradient;
            ctx.beginPath();
            ctx.arc(0, 0, size, 0, Math.PI * 2);
            ctx.fill();
            break;
            
          case 'foam':
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.7})`;
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
              const angle = (i / 6) * Math.PI * 2;
              const radius = size * (0.8 + Math.sin(particle.rotation + i) * 0.2);
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              
              if (i === 0) {
                ctx.moveTo(x, y);
              } else {
                ctx.lineTo(x, y);
              }
            }
            ctx.closePath();
            ctx.fill();
            break;
        }
        
        ctx.restore();
      }
    });
    
    // 마우스 궤적 렌더링 (연결된 선) - 더 진한 사이버 색상 적용
    if (mouseTrail.length > 1) {
      ctx.globalCompositeOperation = 'screen'; // 더 밝은 블렌딩
      
      // 각 트레일 포인트를 개별적으로 렌더링하여 더 강렬한 효과
      for (let i = 1; i < mouseTrail.length; i++) {
        const point = mouseTrail[i];
        const prevPoint = mouseTrail[i - 1];
        const age = Date.now() - point.time;
        const maxAge = 2000; // 2초간 지속
        
        if (age < maxAge) {
          const alpha = Math.max(0, (1 - age / maxAge) * 0.9); // 더 강한 투명도
          const size = Math.max(2, (1 - age / maxAge) * 30); // 더 큰 크기
          
          // 시간에 따른 색상 변화 - 더 진한 사이버 색상
          const timeOffset = (animationTime * 0.003 + i * 0.5) % (Math.PI * 2);
          const colorPhase = (Math.sin(timeOffset) + 1) / 2;
          
          let trailColor;
          if (colorPhase > 0.75) {
            // Deep Purple → Abyss
            const factor = (colorPhase - 0.75) / 0.25;
            trailColor = interpolateColor(cyberColors.purple, cyberColors.abyss, factor);
          } else if (colorPhase > 0.5) {
            // Teal → Deep Purple
            const factor = (colorPhase - 0.5) / 0.25;
            trailColor = interpolateColor(cyberColors.teal, cyberColors.purple, factor);
          } else if (colorPhase > 0.25) {
            // Navy → Teal
            const factor = (colorPhase - 0.25) / 0.25;
            trailColor = interpolateColor(cyberColors.navy, cyberColors.teal, factor);
          } else {
            // Midnight → Navy
            const factor = colorPhase / 0.25;
            trailColor = interpolateColor(cyberColors.midnight, cyberColors.navy, factor);
          }
          
          // 원형 그라디언트로 트레일 포인트 렌더링
          const gradient = ctx.createRadialGradient(
            point.x, point.y, 0,
            point.x, point.y, size
          );
          gradient.addColorStop(0, `rgba(${trailColor.r}, ${trailColor.g}, ${trailColor.b}, ${alpha})`);
          gradient.addColorStop(0.4, `rgba(${trailColor.r}, ${trailColor.g}, ${trailColor.b}, ${alpha * 0.7})`);
          gradient.addColorStop(0.7, `rgba(${trailColor.r}, ${trailColor.g}, ${trailColor.b}, ${alpha * 0.4})`);
          gradient.addColorStop(1, `rgba(${trailColor.r}, ${trailColor.g}, ${trailColor.b}, 0)`);
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
          ctx.fill();
          
          // 연결선 그리기 - 더 진한 색상
          if (i > 1) {
            ctx.strokeStyle = `rgba(${trailColor.r}, ${trailColor.g}, ${trailColor.b}, ${alpha * 0.8})`;
            ctx.lineWidth = Math.max(2, size * 0.2);
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(prevPoint.x, prevPoint.y);
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
          }
        }
      }
      
      ctx.globalCompositeOperation = 'source-over'; // 기본 블렌딩으로 복원
    }
    
    // 소용돌이 렌더링
    renderVortexes(ctx);
    
    // 드래그 중일 때 드래그 라인 표시
    if (isDragging && dragStart && dragCurrent) {
      const dragDistance = Math.sqrt(
        Math.pow(dragCurrent.x - dragStart.x, 2) + Math.pow(dragCurrent.y - dragStart.y, 2)
      );
      
      if (dragDistance > 10) {
        ctx.save();
        ctx.strokeStyle = `rgba(6, 182, 212, 0.8)`;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.setLineDash([5, 5]);
        
        ctx.beginPath();
        ctx.moveTo(dragStart.x, dragStart.y);
        ctx.lineTo(dragCurrent.x, dragCurrent.y);
        ctx.stroke();
        
        // 드래그 끝점에 미리보기 원
        const previewRadius = Math.min(dragDistance * 0.3, 60);
        ctx.strokeStyle = `rgba(147, 51, 234, 0.6)`;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(dragCurrent.x, dragCurrent.y, previewRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
      }
    }
    
    // 상태 업데이트
    setTrailSegments(prevSegments => 
      prevSegments
        .map(segment => ({ ...segment, time: segment.time + 0.1 }))
        .filter(segment => segment.time < 100)
    );
    
    setLinearWaves(prevWaves => 
      prevWaves
        .map(wave => ({ ...wave, time: wave.time + 0.08 }))
        .filter(wave => wave.time < 80 && Math.abs(wave.perpOffset + wave.time * waveSpeed) < 200)
    );
    
    setParticles(prevParticles => 
      prevParticles
        .map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          vy: particle.vy + 0.08,
          vx: particle.vx * 0.995,
          life: particle.life - 1,
          rotation: particle.rotation + particle.rotationSpeed
        }))
        .filter(particle => particle.life > 0)
    );
    
    setFoams(prevFoams => 
      prevFoams
        .map(foam => ({
          ...foam,
          life: foam.life - 1,
          y: foam.y - 0.15
        }))
        .filter(foam => foam.life > 0)
    );
    
    // 마우스 궤적 정리
    const currentTime = Date.now();
    setMouseTrail(prevTrail => 
      prevTrail.filter(point => currentTime - point.time < 3000)
    );
    
    // 소용돌이 업데이트
    updateVortexes(16); // 60fps 기준 deltaTime
    
    // 애니메이션 시간 업데이트
    setAnimationTime(prev => prev + 16); // 60fps 기준
    
  }, [trailSegments, linearWaves, particles, foams, mouseTrail, canvasSize, waveColor, waveSpeed, dampening, animationTime, drawBackgroundWaves, getTimeBasedColor, updateVortexes]);

  // 애니메이션 루프
  useEffect(() => {
    if (!isClient) return;
    
    const animate = () => {
      drawLinearTrailWaves();
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [drawLinearTrailWaves, isClient]);

  // 이벤트 리스너 설정
  useEffect(() => {
    if (!isClient || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    
    updateCanvasSize();
    
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('resize', updateCanvasSize);
    
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [isClient, handleMouseMove, handleMouseDown, handleMouseUp, updateCanvasSize]);



  if (!isClient) {
    return (
      <div className={`w-full h-full bg-gradient-to-br from-cyan-500/10 to-purple-500/10 ${className}`}>
        <div className="w-full h-full flex items-center justify-center">
          <div className="animate-pulse text-cyan-400">궤적 기반 파도 애니메이션 로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* 기본 어두운 배경 (Canvas 애니메이션의 베이스) */}
      <div className="absolute inset-0 bg-gray-900" />
      
      {/* 궤적 기반 파도 애니메이션 캔버스 */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-none"
        style={{ 
          background: 'transparent'
        }}
      />
      
      {/* 안내 텍스트 */}
      <div className="absolute top-4 left-4 text-cyan-400/70 text-sm pointer-events-none">
        AMFA, 이제 나만의 지식 파도를 만들어 보세요
      </div>
      
      {/* 중앙 콘텐츠 영역 - 약간 아래로 이동 */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center pointer-events-none pt-16">
        <div className="text-center space-y-6">
          {/* 메인 타이틀 - 폰트 크기 축소 및 간격 조정 */}
          <div className="space-y-3">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-cyan-400 leading-tight drop-shadow-lg">
              얕은 해변에서
            </h1>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-purple-400 leading-tight drop-shadow-lg">
              깊은 심해로
            </h1>
          </div>

          {/* 브랜드 슬로건 - 타이핑 효과 */}
          <div className="py-6">
            <div className="min-h-[3rem] flex items-center justify-center">
              <BrandSloganTyping className="opacity-90 drop-shadow-md" />
            </div>
          </div>

          {/* CTA 버튼 */}
          <div className="pt-6">
            <button className={`
              px-8 py-4 rounded-full font-bold text-lg
              bg-gradient-to-r from-cyan-500 to-purple-500
              text-white shadow-2xl hover:shadow-cyan-500/25
              transform hover:scale-105 transition-all duration-300
              focus:outline-none focus:ring-4 focus:ring-cyan-400/50
              pointer-events-auto
              backdrop-blur-sm bg-opacity-90
              border border-white/20
            `} onClick={onStartJourney}>
              DIVE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 궤적 기반 파도 물리 상수
export const LinearTrailWavePhysics = {
  WAVE_SPEED: 3.0,              // 파도 전파 속도 (궤적에서 멀어지는 속도)
  DAMPENING: 0.98,              // 감쇠 계수
  TRAIL_SEGMENTS: 20,           // 최대 궤적 세그먼트 수
  WAVES_PER_SEGMENT: 5,         // 세그먼트당 파도 수
  PERPENDICULAR_SPREAD: 200,    // 궤적에 수직으로 퍼지는 최대 거리
  SPRAY_PARTICLES: 8,           // 물보라 파티클 수
  FOAM_PARTICLES: 4,            // 거품 파티클 수
  GRAVITY: 0.08,                // 중력 효과
  AIR_RESISTANCE: 0.995,        // 공기 저항
  WAVE_AMPLITUDE: 15,           // 파도 진폭
  WAVE_FREQUENCY: 0.03          // 파도 주파수
}; 

export default WaveAnimation; 