"use client";

import React, { useEffect, useState } from 'react';
import { PdfHighlight, PdfHighlightOverlayProps, PdfHighlightCoordinates } from '@/types/pdf';
import { domRectToSvgCoordinates, getHighlightsForPage, validateCoordinates } from '@/lib/pdfHighlightUtils';

interface HighlightElementProps {
  highlight: PdfHighlight;
  coordinates: PdfHighlightCoordinates;
  onClick?: (highlight: PdfHighlight) => void;
  onEdit?: (highlight: PdfHighlight) => void;
  onDelete?: (highlightId: string) => void;
}

function HighlightElement({ 
  highlight, 
  coordinates, 
  onClick, 
  onEdit, 
  onDelete 
}: HighlightElementProps) {
  const [isHovered, setIsHovered] = useState(false);

  if (!validateCoordinates(coordinates)) {
    return null;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(highlight);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(highlight);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete?.(highlight.id);
  };

  return (
    <g>
      {/* 둥근 모서리 하이라이트 배경 */}
      <rect
        x={coordinates.x}
        y={coordinates.y}
        width={coordinates.width}
        height={coordinates.height}
        rx={4} // 둥근 모서리
        ry={4}
        fill={highlight.color}
        fillOpacity={isHovered ? highlight.opacity + 0.1 : highlight.opacity}
        stroke={isHovered ? highlight.color : 'transparent'}
        strokeWidth={isHovered ? 1 : 0}
        strokeOpacity={0.8}
        className="cursor-pointer transition-all duration-200"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
      />
      
      {/* 하이라이트 ID 표시 (디버그용, 나중에 제거 가능) */}
      {isHovered && (
        <text
          x={coordinates.x + 4}
          y={coordinates.y - 4}
          fontSize="10"
          fill={highlight.color}
          className="pointer-events-none select-none font-mono"
        >
          {highlight.text.length > 20 ? highlight.text.substring(0, 20) + '...' : highlight.text}
        </text>
      )}
      
      {/* 메모 표시 아이콘 */}
      {highlight.note && (
        <circle
          cx={coordinates.x + coordinates.width - 8}
          cy={coordinates.y + 8}
          r={4}
          fill="#ffffff"
          stroke={highlight.color}
          strokeWidth={1.5}
          className="pointer-events-none"
        />
      )}
    </g>
  );
}

export default function PdfHighlightOverlay({
  highlights,
  pageNumber,
  scale,
  containerRef,
  onHighlightClick,
  onHighlightEdit,
  onHighlightDelete
}: PdfHighlightOverlayProps) {
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null);

  // 컨테이너 크기 업데이트
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerRect(rect);
        setSvgDimensions({
          width: rect.width,
          height: rect.height
        });
      }
    };

    updateDimensions();

    // 윈도우 리사이즈 시 업데이트
    window.addEventListener('resize', updateDimensions);
    
    // MutationObserver로 컨테이너 변경 감지
    let observer: MutationObserver | null = null;
    if (containerRef.current) {
      observer = new MutationObserver(updateDimensions);
      observer.observe(containerRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
      });
    }

    return () => {
      window.removeEventListener('resize', updateDimensions);
      observer?.disconnect();
    };
  }, [containerRef, scale, pageNumber]);

  // 현재 페이지의 하이라이트만 필터링
  const currentPageHighlights = getHighlightsForPage(highlights, pageNumber);

  if (!containerRect || svgDimensions.width === 0 || svgDimensions.height === 0) {
    return null;
  }

  return (
    <svg
      className="absolute top-0 left-0 pointer-events-none z-10"
      width={svgDimensions.width}
      height={svgDimensions.height}
      style={{
        pointerEvents: 'none'
      }}
    >
      <defs>
        {/* 하이라이트 필터 효과 */}
        <filter id="highlight-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <g style={{ pointerEvents: 'auto' }}>
        {currentPageHighlights.map((highlight) => {
          // DOM 좌표를 SVG 좌표로 변환
          const coordinates = domRectToSvgCoordinates(
            highlight.boundingRect,
            containerRect,
            scale
          );

          return (
            <HighlightElement
              key={highlight.id}
              highlight={highlight}
              coordinates={coordinates}
              onClick={onHighlightClick}
              onEdit={onHighlightEdit}
              onDelete={onHighlightDelete}
            />
          );
        })}
      </g>
    </svg>
  );
} 