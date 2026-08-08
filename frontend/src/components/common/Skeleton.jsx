import React from "react";

/**
 * Primitive Skeleton component with animated shimmer effect
 */
export default function Skeleton({
  variant = "text",
  width,
  height,
  count = 1,
  className = "",
  style = {},
  circle = false,
  animation = "shimmer",
}) {
  const elements = [];

  for (let i = 0; i < count; i++) {
    const customStyle = { ...style };
    if (width !== undefined)
      customStyle.width = typeof width === "number" ? `${width}px` : width;
    if (height !== undefined)
      customStyle.height = typeof height === "number" ? `${height}px` : height;

    let variantClass = "skeleton-text";
    if (variant === "text-sm") variantClass = "skeleton-text-sm";
    if (variant === "text-lg") variantClass = "skeleton-text-lg";
    if (variant === "rectangular" || variant === "rect")
      variantClass = "skeleton-rect";
    if (variant === "circular" || variant === "circle" || circle)
      variantClass = "skeleton-circle";

    const animClass = animation === "pulse" ? "skeleton-pulse-anim" : "";

    elements.push(
      <span
        key={i}
        className={`skeleton-base ${variantClass} ${animClass} ${className}`}
        style={customStyle}
        aria-hidden="true"
      />,
    );
  }

  if (count === 1) return elements[0];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {elements}
    </div>
  );
}

export function SkeletonText({
  lines = 1,
  width = "100%",
  height,
  size = "md",
  style,
  className,
}) {
  const variant =
    size === "sm" ? "text-sm" : size === "lg" ? "text-lg" : "text";
  return (
    <Skeleton
      variant={variant}
      count={lines}
      width={width}
      height={height}
      style={style}
      className={className}
    />
  );
}

export function SkeletonRect({
  width = "100%",
  height = "40px",
  borderRadius = "8px",
  style,
  className,
}) {
  return (
    <Skeleton
      variant="rectangular"
      width={width}
      height={height}
      style={{ borderRadius, ...style }}
      className={className}
    />
  );
}

export function SkeletonCircle({ size = 40, style, className }) {
  return (
    <Skeleton
      variant="circular"
      width={size}
      height={size}
      style={style}
      className={className}
    />
  );
}

export function SkeletonStatCard() {
  return (
    <div className="skeleton-stat-tile">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Skeleton variant="text-sm" width="40%" />
        <Skeleton variant="circular" width={28} height={28} />
      </div>
      <Skeleton variant="text-lg" width="60%" height={32} />
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <Skeleton variant="text-sm" width="30%" />
        <Skeleton variant="text-sm" width="40%" />
      </div>
    </div>
  );
}

export function SkeletonCard({ height = "180px" }) {
  return (
    <div
      className="skeleton-card"
      style={{ display: "flex", flexDirection: "column", gap: "1rem", height }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Skeleton variant="text" width="65%" height={22} />
        <Skeleton
          variant="rectangular"
          width={70}
          height={24}
          style={{ borderRadius: "12px" }}
        />
      </div>
      <Skeleton variant="text-sm" width="85%" />
      <Skeleton variant="text-sm" width="45%" />
      <div
        style={{
          marginTop: "auto",
          paddingTop: "0.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Skeleton variant="text-sm" width="30%" />
        <Skeleton
          variant="rectangular"
          width={90}
          height={32}
          style={{ borderRadius: "6px" }}
        />
      </div>
    </div>
  );
}

export function SkeletonTableRow({ columns = 5 }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1.25rem",
        padding: "0.85rem 1.25rem",
        borderBottom: "1px solid #f1f5f9",
      }}
    >
      {Array.from({ length: columns }).map((_, idx) => (
        <div key={idx} style={{ flex: idx === 0 ? 2 : 1 }}>
          <Skeleton
            variant={idx === 0 ? "text" : "text-sm"}
            width={idx === 0 ? "80%" : "60%"}
          />
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart({ height = "280px" }) {
  return (
    <div
      className="skeleton-card"
      style={{ display: "flex", flexDirection: "column", gap: "1rem", height }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Skeleton variant="text" width="40%" height={20} />
        <Skeleton
          variant="rectangular"
          width={100}
          height={28}
          style={{ borderRadius: "6px" }}
        />
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "flex-end",
          gap: "1rem",
          padding: "1rem 0",
        }}
      >
        {[40, 75, 55, 90, 65, 80, 45, 70, 85].map((h, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Skeleton
              variant="rectangular"
              width="100%"
              height={`${h}%`}
              style={{ borderRadius: "4px 4px 0 0" }}
            />
            <Skeleton variant="text-sm" width="80%" height={10} />
          </div>
        ))}
      </div>
    </div>
  );
}
