"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { amfaTheme } from './theme';

interface TypingEffectProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

interface AdvancedTypingEffectProps {
  text: string;
  speed?: number;
  className?: string;
  colors?: string[];
  highlightColor?: string;
  onComplete?: () => void;
}

interface BrandSloganTypingProps {
  className?: string;
  onComplete?: () => void;
}

// 물방울 글자 인터페이스
interface DropletChar {
  char: string;
  x: number;
  y: number;
  targetY: number;
  velocity: number;
  opacity: number;
  scale: number;
  rotation: number;
  rippleRadius: number;
  rippleOpacity: number;
  isLanded: boolean;
  landTime: number;
}

// 파도 연동 타이핑 효과
interface WaveTypingChar {
  char: string;
  index: number;
  isVisible: boolean;
  waveOffset: number;
  glowIntensity: number;
  rippleEffect: boolean;
  splashParticles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    size: number;
  }>;
}

// 기본 타이핑 효과
export function TypingEffect({ 
  text, 
  speed = 100, 
  className = '', 
  onComplete 
}: TypingEffectProps) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  useEffect(() => {
    const cursorTimer = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);
    return () => clearInterval(cursorTimer);
  }, []);

  return (
    <span className={className}>
      {displayText}
      <span className={`${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`}>
        |
      </span>
    </span>
  );
}

// 고급 그라디언트 타이핑 효과
export function AdvancedTypingEffect({ 
  text, 
  speed = 80, 
  className = '', 
  colors = ['text-cyan-400', 'text-purple-400', 'text-blue-400'],
  highlightColor = 'text-yellow-300',
  onComplete 
}: AdvancedTypingEffectProps) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setHighlightIndex(currentIndex);
        setCurrentIndex(prev => prev + 1);
        
        setTimeout(() => setHighlightIndex(-1), 200);
      }, speed);
      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  useEffect(() => {
    const cursorTimer = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);
    return () => clearInterval(cursorTimer);
  }, []);

  return (
    <span className={className}>
      {displayText.split('').map((char, index) => {
        const colorClass = colors[index % colors.length];
        const isHighlighted = index === highlightIndex;
        
        return (
          <span
            key={index}
            className={`
              ${isHighlighted ? highlightColor : colorClass}
              ${isHighlighted ? 'drop-shadow-lg scale-110' : ''}
              transition-all duration-200 inline-block
            `}
          >
            {char}
          </span>
        );
      })}
      <span className={`${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100 ${colors[0]}`}>
        |
      </span>
    </span>
  );
}

// 파도 연동 브랜드 슬로건 타이핑 (완전히 새로운 물결 효과)
export function BrandSloganTyping({ 
  className = '', 
  onComplete 
}: BrandSloganTypingProps) {
  const text = "1줄 메모로 지식의 파도를 만드세요";
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [waveChars, setWaveChars] = useState<WaveTypingChar[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const animationRef = useRef<number>();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 파도 연동 글자 초기화
  useEffect(() => {
    const chars = text.split('').map((char, index) => ({
      char,
      index,
      isVisible: false,
      waveOffset: Math.random() * Math.PI * 2,
      glowIntensity: 0,
      rippleEffect: false,
      splashParticles: []
    }));
    setWaveChars(chars);
  }, [text]);

  // 마우스 위치 추적
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove, isClient]);

  // 파도 타이핑 애니메이션
  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setWaveChars(prev => 
          prev.map((char, index) => 
            index === currentIndex 
              ? { 
                  ...char, 
                  isVisible: true, 
                  rippleEffect: true,
                  glowIntensity: 1,
                  splashParticles: Array.from({ length: 8 }, (_, i) => ({
                    x: 0,
                    y: 0,
                    vx: (Math.random() - 0.5) * 4,
                    vy: Math.random() * -3 - 1,
                    life: 30,
                    size: Math.random() * 3 + 1
                  }))
                } 
              : char
          )
        );
        setCurrentIndex(prev => prev + 1);
      }, 120 + Math.random() * 80); // 자연스러운 타이핑 리듬
      return () => clearTimeout(timer);
    } else if (onComplete) {
      setTimeout(onComplete, 500);
    }
  }, [currentIndex, text.length, onComplete]);

  // 커서 깜빡임
  useEffect(() => {
    const cursorTimer = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);
    return () => clearInterval(cursorTimer);
  }, []);

  // 파도 효과 애니메이션
  const animateWaveEffects = useCallback(() => {
    if (!canvasRef.current || !containerRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 캔버스 크기 조정
    const rect = containerRef.current.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // 캔버스 클리어
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const time = Date.now() * 0.003;

    setWaveChars(prev => prev.map(char => {
      if (!char.isVisible) return char;

      // 파도 오프셋 업데이트
      const newWaveOffset = char.waveOffset + 0.1;
      
      // 글로우 효과 감소
      const newGlowIntensity = Math.max(0, char.glowIntensity - 0.02);
      
      // 리플 효과 감소
      const newRippleEffect = char.glowIntensity > 0.3;

      // 스플래시 파티클 업데이트
      const updatedParticles = char.splashParticles
        .map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          vy: particle.vy + 0.1, // 중력
          life: particle.life - 1
        }))
        .filter(particle => particle.life > 0);

      // 마우스 근접 효과
      const charElement = document.querySelector(`[data-char-index="${char.index}"]`) as HTMLElement;
      if (charElement) {
        const charRect = charElement.getBoundingClientRect();
        const containerRect = containerRef.current!.getBoundingClientRect();
        const charX = charRect.left - containerRect.left + charRect.width / 2;
        const charY = charRect.top - containerRect.top + charRect.height / 2;
        
        const distance = Math.sqrt(
          Math.pow(mousePos.x - charX, 2) + Math.pow(mousePos.y - charY, 2)
        );
        
        if (distance < 50) {
          // 마우스 근접 시 파도 효과 강화
          const proximity = 1 - (distance / 50);
          
          // 리플 효과 그리기
          ctx.save();
          ctx.globalAlpha = proximity * 0.3;
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 2;
          
          for (let i = 0; i < 3; i++) {
            const radius = (time * 50 + i * 20) % 60;
            ctx.beginPath();
            ctx.arc(charX, charY, radius, 0, Math.PI * 2);
            ctx.stroke();
          }
          ctx.restore();
        }

        // 스플래시 파티클 렌더링
        updatedParticles.forEach(particle => {
          ctx.save();
          ctx.globalAlpha = particle.life / 30;
          ctx.fillStyle = '#06b6d4';
          ctx.beginPath();
          ctx.arc(
            charX + particle.x, 
            charY + particle.y, 
            particle.size, 
            0, 
            Math.PI * 2
          );
          ctx.fill();
          ctx.restore();
        });
      }

      return {
        ...char,
        waveOffset: newWaveOffset,
        glowIntensity: newGlowIntensity,
        rippleEffect: newRippleEffect,
        splashParticles: updatedParticles
      };
    }));

    animationRef.current = requestAnimationFrame(animateWaveEffects);
  }, [mousePos]);

  useEffect(() => {
    if (!isClient) return;
    
    animateWaveEffects();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animateWaveEffects, isClient]);

  if (!isClient) {
    return (
      <div className={`text-2xl md:text-3xl font-bold ${amfaTheme.primary} ${className}`}>
        {text}
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`relative text-2xl md:text-3xl font-bold ${className}`}
    >
      {/* 파도 효과 캔버스 */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ mixBlendMode: 'screen' }}
      />
      
      {/* 텍스트 렌더링 */}
      <div className="relative z-10">
        {waveChars.map((charData, index) => {
          if (!charData.isVisible) return null;
          
          const waveY = Math.sin(charData.waveOffset) * 3;
          const glowIntensity = charData.glowIntensity;
          
          // 공백 문자 처리
          if (charData.char === ' ') {
            return (
              <span
                key={index}
                data-char-index={index}
                className="inline-block"
                style={{
                  width: '0.5em', // 공백 너비 설정
                  transform: `translateY(${waveY}px)`
                }}
              >
                &nbsp;
              </span>
            );
          }
          
          return (
            <span
              key={index}
              data-char-index={index}
              className={`
                inline-block transition-all duration-300
                ${amfaTheme.primary}
                ${charData.rippleEffect ? 'animate-pulse' : ''}
              `}
              style={{
                transform: `translateY(${waveY}px) scale(${1 + glowIntensity * 0.1})`,
                textShadow: `
                  0 0 ${glowIntensity * 10}px rgba(6, 182, 212, ${glowIntensity}),
                  0 0 ${glowIntensity * 20}px rgba(6, 182, 212, ${glowIntensity * 0.5}),
                  0 0 ${glowIntensity * 30}px rgba(6, 182, 212, ${glowIntensity * 0.3})
                `,
                filter: `brightness(${1 + glowIntensity * 0.5})`
              }}
            >
              {charData.char}
            </span>
          );
        })}
        
        {/* 파도 커서 */}
        <span 
          className={`
            ${showCursor ? 'opacity-100' : 'opacity-0'} 
            transition-opacity duration-100 
            ${amfaTheme.secondary}
            inline-block
          `}
          style={{
            textShadow: `
              0 0 10px rgba(147, 51, 234, 0.8),
              0 0 20px rgba(147, 51, 234, 0.4)
            `,
            animation: showCursor ? 'pulse 1s infinite' : 'none'
          }}
        >
          |
        </span>
      </div>
    </div>
  );
}

// 물방울 타이핑 효과 (추가 컴포넌트)
export function DropletTypingEffect({ 
  text, 
  className = '', 
  onComplete 
}: { text: string; className?: string; onComplete?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [droplets, setDroplets] = useState<DropletChar[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const animationRef = useRef<number>();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 물방울 생성
  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        const newDroplet: DropletChar = {
          char: text[currentIndex],
          x: currentIndex * 30 + 50,
          y: -50,
          targetY: 100,
          velocity: 0,
          opacity: 0,
          scale: 0.5,
          rotation: Math.random() * 360,
          rippleRadius: 0,
          rippleOpacity: 0,
          isLanded: false,
          landTime: 0
        };
        
        setDroplets(prev => [...prev, newDroplet]);
        setCurrentIndex(prev => prev + 1);
      }, 200);
      return () => clearTimeout(timer);
    } else if (onComplete) {
      setTimeout(onComplete, 1000);
    }
  }, [currentIndex, text, onComplete]);

  // 물방울 애니메이션
  const animateDroplets = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 200;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    setDroplets(prev => prev.map(droplet => {
      if (!droplet.isLanded) {
        // 낙하 물리학
        const newVelocity = droplet.velocity + 0.5; // 중력
        const newY = droplet.y + newVelocity;
        
        if (newY >= droplet.targetY) {
          // 착지
          return {
            ...droplet,
            y: droplet.targetY,
            velocity: 0,
            isLanded: true,
            landTime: Date.now(),
            opacity: 1,
            scale: 1,
            rippleRadius: 5,
            rippleOpacity: 1
          };
        }
        
        return {
          ...droplet,
          y: newY,
          velocity: newVelocity,
          opacity: Math.min(1, (droplet.targetY - newY) / 100),
          scale: Math.min(1, 0.5 + (droplet.targetY - newY) / 200)
        };
      } else {
        // 착지 후 리플 효과
        const timeSinceLand = Date.now() - droplet.landTime;
        const rippleProgress = Math.min(1, timeSinceLand / 1000);
        
        return {
          ...droplet,
          rippleRadius: 5 + rippleProgress * 30,
          rippleOpacity: Math.max(0, 1 - rippleProgress)
        };
      }
    }));

    // 렌더링
    droplets.forEach(droplet => {
      ctx.save();
      
      // 리플 효과
      if (droplet.isLanded && droplet.rippleOpacity > 0) {
        ctx.globalAlpha = droplet.rippleOpacity;
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(droplet.x, droplet.targetY, droplet.rippleRadius, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      // 글자 렌더링
      ctx.globalAlpha = droplet.opacity;
      ctx.fillStyle = '#06b6d4';
      ctx.font = `${24 * droplet.scale}px bold`;
      ctx.textAlign = 'center';
      ctx.fillText(droplet.char, droplet.x, droplet.y);
      
      ctx.restore();
    });

    animationRef.current = requestAnimationFrame(animateDroplets);
  }, [droplets]);

  useEffect(() => {
    if (!isClient) return;
    
    animateDroplets();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animateDroplets, isClient]);

  if (!isClient) {
    return <div className={className}>{text}</div>;
  }

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-32"
      />
    </div>
  );
} 