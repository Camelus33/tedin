import React from 'react';

export default function ViciousCycleGraphic() {
  const viewBoxSize = 300;
  const center = viewBoxSize / 2;
  const circleRadius = 100;
  const loopThickness = 25;
  const triangleSize = circleRadius * 0.8; // Approx size of the inner triangle loop

  // Simple path for the triangle loop (adjust coordinates as needed)
  const trianglePath = `
    M ${center},${center - triangleSize * 0.6}
    L ${center + triangleSize * 0.7},${center + triangleSize * 0.4}
    L ${center - triangleSize * 0.7},${center + triangleSize * 0.4}
    Z
  `;

  // Simple path for the feedback arrow (adjust coordinates as needed)
  const feedbackArrowPath = `
    M ${center + triangleSize * 0.7 + 10}, ${center + triangleSize * 0.4 + 10}
    C ${center + triangleSize + 50}, ${center + triangleSize},
      ${center + triangleSize}, ${center - triangleSize - 20},
      ${center + 10}, ${center - triangleSize * 0.6 - 10}
  `;

  return (
    <div className="w-full h-full flex justify-center items-center p-4">
      <svg viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`} className="w-full h-auto">
        {/* Arrowheads Definition */}
        <defs>
          <marker
            id="arrowhead-purple-static"
            viewBox="0 0 10 10"
            refX="8" // Adjust refX for thick stroke
            refY="5"
            markerWidth="8" // Slightly larger for thick stroke
            markerHeight="8"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#8B5CF6" /> {/* Purple */}
          </marker>
          <marker
            id="arrowhead-red-feedback-static"
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#EF4444" /> {/* Red */}
          </marker>
        </defs>

        {/* 1. Red Outer Circle (Simplified spikes using dash) */}
        <circle
          cx={center}
          cy={center}
          r={circleRadius}
          fill="#FEE2E2" // Light Red
          stroke="#F87171" // Medium Red
          strokeWidth="3"
        />
         {/* Spikes illusion */}
         <circle
          cx={center}
          cy={center}
          r={circleRadius + 8} // Slightly larger radius
          fill="none"
          stroke="#F97316" // Orange
          strokeWidth="10"
          strokeDasharray="15 30" // Creates spaced dashes for spike effect
        />

        {/* 2. Purple Triangle Loop */}
        <path
          d={trianglePath}
          fill="none"
          stroke="#8B5CF6" // Darker purple directly
          strokeWidth={loopThickness}
          strokeLinejoin="round"
          strokeLinecap="round"
          markerStart="url(#arrowhead-purple-static)" // Use static ID
          markerMid="url(#arrowhead-purple-static)"   // Use static ID
          markerEnd="url(#arrowhead-purple-static)"   // Use static ID
        />

        {/* 3. Inner Abstract Shapes */}
        <g>
          {/* Orange Shape (approx) */}
          <path d={`M ${center - 30} ${center + 10} q 20 -40 40 0 q 20 40 -10 30 Z`} fill="#FDBA74" /> 
          {/* Blue Shape (approx) */}
           <path d={`M ${center + 10} ${center - 20} v 30 h -10 v -15 h -10 Z`} fill="#93C5FD" /> 
          <circle cx={center} cy={center + 35} r="8" fill="#FDBA74" />
        </g>

        {/* 4. Red Feedback Arrow */}
        <path
          d={feedbackArrowPath}
          fill="none"
          stroke="#EF4444" // Red
          strokeWidth="3"
          strokeDasharray="6 3"
          markerEnd="url(#arrowhead-red-feedback-static)" // Use static ID
        />
      </svg>
    </div>
  );
} 