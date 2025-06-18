'use client';

import React, { useRef, useEffect } from 'react';

const InteractiveCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    const mouse = {
        x: canvas.width / 2,
        y: canvas.height / 2,
    };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    class Ball {
      x: number;
      y: number;
      radius: number;
      color: string;
      vx: number;
      vy: number;

      constructor(x: number, y: number, radius: number, color: string) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.vx = (Math.random() - 0.5) * 1;
        this.vy = (Math.random() - 0.5) * 1;
      }

      update() {
        if (!canvas) return;
        this.x += this.vx;
        this.y += this.vy;
        
        if (this.x < this.radius || this.x > canvas.width - this.radius) this.vx *= -1;
        if (this.y < this.radius || this.y > canvas.height - this.radius) this.vy *= -1;
      }

      draw() {
        if(!ctx) return;
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const balls = [
      new Ball(canvas.width * 0.2, canvas.height * 0.5, 60, '#06b6d4'),
      new Ball(canvas.width * 0.8, canvas.height * 0.5, 70, '#0e7490'),
      new Ball(canvas.width * 0.5, canvas.height * 0.2, 80, '#8b5cf6'),
      new Ball(canvas.width * 0.5, canvas.height * 0.8, 90, '#164e63'),
      new Ball(canvas.width * 0.3, canvas.height * 0.3, 50, '#0891b2'),
      new Ball(canvas.width * 0.7, canvas.height * 0.7, 100, '#6366f1'),
    ];

    const animate = () => {
      if(!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      balls.forEach(ball => {
        ball.update();
        ball.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute top-0 left-0 w-full h-full -z-10 bg-indigo-950">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full" 
        style={{ filter: 'blur(80px) contrast(20)' }}
      />
    </div>
  );
};

export default InteractiveCanvas; 