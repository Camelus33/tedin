import React from 'react';

// Simple arrow component
const Arrow = ({ id, color = "#6B7280" /* Gray */ }: { id: string, color?: string }) => (
  <marker
    id={id}
    viewBox="0 0 10 10"
    refX="5"
    refY="5"
    markerWidth="6"
    markerHeight="6"
    orient="auto-start-reverse"
  >
    <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
  </marker>
);

export default function VirtuousCycleGraphic() {
  const viewBoxSize = 360;
  const center = viewBoxSize / 2;
  const radius = viewBoxSize / 2 - 75; // Increased margin for text labels

  // Helper function to calculate pentagon vertex positions
  const getPentagonVertex = (index: number) => {
    const angle = -90 + index * 72; // 72 degrees per step
    const radians = angle * (Math.PI / 180);
    return {
      x: center + radius * Math.cos(radians),
      y: center + radius * Math.sin(radians),
      angle: angle // Store angle for label positioning
    };
  };

  // Pentagon vertices
  const points = Array.from({ length: 5 }, (_, i) => getPentagonVertex(i));

  // Revised Labels
  const labels = [
    { text: "1. 정보 입력", detail: "" },
    { text: "2. 측정", detail: "(상태 파악)" },
    { text: "3. 인지", detail: "(변화 확인)" },
    { text: "4. 결과", detail: "(효율 향상)" },
    { text: "5. 동기", detail: "(성장 가속)" },
  ];

  // Refined function to calculate label positions outside the pentagon
  const getLabelPosition = (point: { x: number, y: number, angle: number }) => {
    const labelOffset = 30; // Distance from the node center
    const radians = point.angle * (Math.PI / 180);

    // Calculate base position further out
    const labelX = center + (radius + labelOffset) * Math.cos(radians);
    const labelY = center + (radius + labelOffset) * Math.sin(radians);

    // Adjust anchor and dy based on angle for better alignment
    let textAnchor = "middle";
    let dy = 5; // Base vertical alignment adjustment

    if (point.angle > -45 && point.angle < 45) { // Right side (Measure)
        textAnchor = "start"; dy = 5;
    } else if (point.angle > 135 && point.angle < 225) { // Left side (Feedback)
        textAnchor = "end"; dy = 5;
    } else if (point.angle >= 45 && point.angle <= 135) { // Bottom vertices (Awareness, Outcome)
        dy = 15; // Push lower labels down more
         if (Math.abs(point.angle - 90) < 10) textAnchor = "middle"; // Center bottom label if close to 90
         else if (point.angle > 90) textAnchor = "end"; // Outcome (bottom-left)
         else textAnchor = "start"; // Awareness (bottom-right)

    } else { // Top vertex (Input)
       dy = -10; // Push top label up
    }


    return { x: labelX, y: labelY, anchor: textAnchor, dy: dy };
  };

  return (
    <div className="w-full h-full flex justify-center items-center p-4">
      <svg viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`} className="w-full h-full overflow-visible"> {/* Allow overflow for labels */}
        <defs>
          <Arrow id="arrow-virtuous-normal" color="#60A5FA" /> {/* Brighter Blue */}
          <Arrow id="arrow-virtuous-reinforce" color="#22C55E" /> {/* Brighter Green */}
          {/* 중앙 텍스트용 그라데이션 */}
          <linearGradient id="cybernetics-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="50%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>

        {/* 중앙 텍스트 */}
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="'Orbitron', 'Pretendard', sans-serif"
          fontWeight="900"
          fontSize="20"
          fill="url(#cybernetics-gradient)"
          style={{
            filter: 'drop-shadow(0 2px 6px #fff) drop-shadow(0 0px 10px #7c3aed)',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
          className="select-none cybernetics-center-text"
        >
          Cybernetics AI
        </text>

        {/* Draw connecting curved arrows */}
        {points.map((p, i) => {
          const nextIndex = (i + 1) % points.length;
          const nextPoint = points[nextIndex];
          const arrowId = "arrow-virtuous-normal";
          const strokeColor = "#93C5FD"; // Lighter Blue
          const strokeWidth = "3";

          // Calculate control point for curve slightly outside the pentagon edge center
          const midX = (p.x + nextPoint.x) / 2;
          const midY = (p.y + nextPoint.y) / 2;
          const angleMid = Math.atan2(midY - center, midX - center);
          const controlRadius = radius * 0.3; // Adjust curve intensity
          const ctrlX = midX + controlRadius * Math.cos(angleMid);
          const ctrlY = midY + controlRadius * Math.sin(angleMid);


          return (
            <path
              key={`curve-arrow-${i}`}
              d={`M ${p.x} ${p.y} Q ${ctrlX} ${ctrlY}, ${nextPoint.x} ${nextPoint.y}`}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              markerEnd={`url(#${arrowId})`}
            />
          );
        })}

        {/* Draw Reinforcement Arrow (5 -> 2) - More prominent curve */}
         <path
           d={`M ${points[4].x} ${points[4].y} 
               Q ${center - radius * 0.1} ${center - radius * 0.9}, 
               ${points[1].x} ${points[1].y}`} // Adjusted control point for a more inward curve
           fill="none"
           stroke="#22C55E" // Brighter Green
           strokeWidth="4" // Thicker
           strokeDasharray="8 4" // Dashed pattern
           markerEnd="url(#arrow-virtuous-reinforce)"
         />


        {/* Draw nodes and labels */}
        {points.map((p, i) => {
           const labelPos = getLabelPosition(p);
           const isReinforceTarget = i === 1; // Highlight Measure step as target of reinforcement
          return (
          <g key={`node-${i}`}>
            {/* Node design */}
            <circle cx={p.x} cy={p.y} r="14" fill="white" stroke={ isReinforceTarget ? "#22C55E" : "#BFDBFE"} strokeWidth="2" /> {/* White background, Blue/Green border */}
            <text
                x={p.x}
                y={p.y}
                textAnchor="middle"
                dy=".3em" // Vertical center alignment trick
                fontSize="14"
                fill={ isReinforceTarget ? "#16A34A" : "#3B82F6"} // Blue/Green number
                className="font-bold"
            >
                {i + 1} {/* Display step number */}
            </text>

            {/* Text Label */}
            <text
              x={labelPos.x}
              y={labelPos.y}
              textAnchor={labelPos.anchor}
              dy={labelPos.dy}
              fontSize="13"
              fill="#1F2937" // Dark Gray
              className="font-semibold"
            >
              {labels[i].text.substring(labels[i].text.indexOf(' ') + 1)} {/* Show only text part */}
            </text>
             <text
              x={labelPos.x}
              y={labelPos.y + 16} // Detail text below main label
              textAnchor={labelPos.anchor}
               dy={labelPos.dy}
              fontSize="11"
              fill="#6B7280" // Medium Gray
            >
              {labels[i].detail}
            </text>
          </g>
        )})}

      </svg>

      {/* 스타일: 모바일에서 중앙 텍스트 크기 축소 */}
      <style jsx>{`
        .cybernetics-center-text {
          font-size: 1.2rem;
        }
        @media (max-width: 600px) {
          .cybernetics-center-text {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </div>
  );
} 