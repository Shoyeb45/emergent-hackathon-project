"use client";

import type { WeddingBackgroundTemplateId } from "@/lib/wedding-templates";

const GOLD = "#C6A75E";
const BURGUNDY = "#5c2a4a";
const CHAMPAGNE = "#FAF7F2";
const LIGHT = "#f5f0e8";

const BASE_STYLES: Record<WeddingBackgroundTemplateId, string> = {
  champagne: `linear-gradient(165deg, #FAF7F2 0%, #f5f0e8 40%, #f0ebe3 100%)`,
  dots: `linear-gradient(165deg, #faf6f1 0%, #f2ebe2 45%, #ebe4dc 100%)`,
  flowers: `linear-gradient(165deg, #fdf9f5 0%, #f8f2eb 50%, #f0eae2 100%)`,
  leaves: `linear-gradient(165deg, #f8f6f1 0%, #f0ede5 50%, #e8e4dc 100%)`,
  petals: `linear-gradient(165deg, #fcf8f5 0%, #f5efe8 50%, #ede6df 100%)`,
  "gold-grid": `linear-gradient(165deg, #faf7f0 0%, #f2ede4 45%, #eae5dc 100%)`,
};

export function WeddingBackground({
  templateId,
  children,
}: {
  templateId: WeddingBackgroundTemplateId;
  children: React.ReactNode;
}) {
  const backgroundStyle = BASE_STYLES[templateId] ?? BASE_STYLES.champagne;

  return (
    <div key={templateId} className="min-h-screen relative overflow-x-hidden">
      {/* Base gradient – varies by template so change is visible */}
      <div
        className="absolute inset-0 -z-10 transition-colors duration-500"
        style={{ background: backgroundStyle }}
      />

      {/* Pattern overlays */}
      {templateId === "dots" && <DotsOverlay />}
      {templateId === "flowers" && <FlowersOverlay />}
      {templateId === "leaves" && <LeavesOverlay />}
      {templateId === "petals" && <PetalsOverlay />}
      {templateId === "gold-grid" && <GoldGridOverlay />}

      {children}
    </div>
  );
}

function DotsOverlay() {
  return (
    <div
      className="absolute inset-0 -z-9 opacity-[0.18]"
      style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, ${BURGUNDY} 0.5px, transparent 0)`,
        backgroundSize: "24px 24px",
      }}
    />
  );
}

function FlowersOverlay() {
  const positions: [number, number, number][] = [
    [20, 25, 3],
    [80, 20, 2.5],
    [15, 70, 3.5],
    [85, 75, 3],
    [50, 15, 2],
    [70, 55, 2.5],
    [25, 50, 2],
    [90, 45, 2],
    [40, 85, 3],
  ];
  return (
    <div className="absolute inset-0 -z-9 opacity-[0.14] pointer-events-none">
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        stroke={BURGUNDY}
        strokeWidth="0.35"
      >
        {positions.map(([x, y, r], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={r} />
            <circle cx={x - r * 0.4} cy={y - r * 0.3} r={r * 0.35} />
            <circle cx={x + r * 0.35} cy={y - r * 0.25} r={r * 0.3} />
            <circle cx={x + r * 0.2} cy={y + r * 0.4} r={r * 0.3} />
            <circle cx={x - r * 0.25} cy={y + r * 0.35} r={r * 0.28} />
          </g>
        ))}
      </svg>
    </div>
  );
}

function LeavesOverlay() {
  const leaf = "M 0 0 Q 8 4 6 12 Q 4 8 0 10 Q -4 8 -6 12 Q -8 4 0 0";
  return (
    <div className="absolute inset-0 -z-9 opacity-[0.12] pointer-events-none overflow-hidden">
      <svg
        className="absolute -left-[10%] -top-[5%] w-[40%] h-[50%]"
        viewBox="-10 -5 20 25"
        fill="none"
        stroke={BURGUNDY}
        strokeWidth="0.35"
      >
        <path d={leaf} transform="rotate(-20)" />
        <path d={leaf} transform="translate(12 8) rotate(15) scale(0.8)" />
        <path d={leaf} transform="translate(5 15) rotate(-5) scale(0.7)" />
      </svg>
      <svg
        className="absolute right-0 bottom-0 w-[35%] h-[45%]"
        viewBox="-10 -5 20 25"
        fill="none"
        stroke={BURGUNDY}
        strokeWidth="0.35"
      >
        <path d={leaf} transform="rotate(160)" />
        <path d={leaf} transform="translate(-8 10) rotate(180) scale(0.8)" />
      </svg>
    </div>
  );
}

function PetalsOverlay() {
  const petal = "M 0 0 Q 3 2 2 6 Q 0 3 0 0 Q -3 2 -2 6 Q 0 3 0 0";
  return (
    <div className="absolute inset-0 -z-9 opacity-[0.13] pointer-events-none">
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        fill={BURGUNDY}
        fillOpacity="0.2"
      >
        {[
          [10, 20],
          [88, 25],
          [15, 75],
          [82, 70],
          [50, 10],
          [25, 50],
          [75, 55],
          [5, 45],
          [92, 40],
          [45, 88],
        ].map(([x, y], i) => (
          <ellipse
            key={i}
            cx={x}
            cy={y}
            rx="2.5"
            ry="4"
            transform={`rotate(${i * 36} ${x} ${y})`}
          />
        ))}
      </svg>
    </div>
  );
}

function GoldGridOverlay() {
  return (
    <div
      className="absolute inset-0 -z-9 pointer-events-none"
      style={{
        backgroundImage: `
          linear-gradient(${GOLD}22 1px, transparent 1px),
          linear-gradient(90deg, ${GOLD}22 1px, transparent 1px)
        `,
        backgroundSize: "48px 48px",
        opacity: 0.85,
      }}
    />
  );
}
